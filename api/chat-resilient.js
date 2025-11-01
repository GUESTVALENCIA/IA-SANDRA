/**
 * Netlify Function: Chat Resilient
 * Implementa retry, fallback, rate limiting y cost tracking
 * SOLUCIÓN COMPLETA al Problema AI #4
 */

const { SandraNucleus } = require('../../orchestrator/sandra-nucleus-core');

// Rate Limiter (en producción usar Redis)
const rateLimiter = {
  requests: new Map(),
  
  checkLimit: (userId) => {
    const now = Date.now();
    const windowMs = 60000; // 1 minuto
    const maxRequests = 20; // 20 req/min (más generoso para mejor UX)
    
    const key = `chat:${userId}`;
    const userRequests = rateLimiter.requests.get(key) || [];
    
    // Limpiar requests antiguos
    const recentRequests = userRequests.filter(t => now - t < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + windowMs
      };
    }
    
    recentRequests.push(now);
    rateLimiter.requests.set(key, recentRequests);
    
    // Limpiar entradas viejas periódicamente
    if (Math.random() < 0.01) {
      for (const [k, v] of rateLimiter.requests.entries()) {
        if (v.every(t => now - t > windowMs * 5)) {
          rateLimiter.requests.delete(k);
        }
      }
    }
    
    return {
      allowed: true,
      remaining: maxRequests - recentRequests.length,
      resetTime: now + windowMs
    };
  }
};

// Cost Tracker
const costTracker = {
  totalCost: 0,
  maxCostPerRequest: 0.10,
  requests: [],
  
  estimateCost: (model, inputTokens, outputTokens) => {
    const costs = {
      'gpt-4o': { input: 0.005, output: 0.015 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
    };
    
    const modelCost = costs[model] || costs['gpt-4o-mini'];
    const inputCost = (inputTokens / 1000) * modelCost.input;
    const outputCost = (outputTokens / 1000) * modelCost.output;
    
    return inputCost + outputCost;
  },
  
  recordCost: (model, inputTokens, outputTokens, requestId) => {
    const cost = costTracker.estimateCost(model, inputTokens, outputTokens);
    costTracker.totalCost += cost;
    
    costTracker.requests.push({
      id: requestId,
      model,
      cost,
      timestamp: Date.now()
    });
    
    // Mantener solo últimos 1000 requests
    if (costTracker.requests.length > 1000) {
      costTracker.requests.shift();
    }
    
    // Alert si costo excede límite
    if (cost > costTracker.maxCostPerRequest) {
      console.warn(`[COST ALERT] Request ${requestId} cost $${cost.toFixed(4)} (limit: $${costTracker.maxCostPerRequest})`);
    }
    
    return cost;
  }
};

/**
 * Retry con exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s (max 10s)
      const delay = Math.min(initialDelay * Math.pow(2, i), 10000);
      console.log(`[RETRY] Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Selección inteligente de modelo basado en tarea
 */
function selectModel(message, options = {}) {
  const lowerMessage = message.toLowerCase();
  const priority = options.priority || 'cost';
  
  // Tareas simples → modelo económico
  const simpleKeywords = ['hola', 'gracias', 'adiós', 'ok', 'sí', 'no', 'entendido'];
  if (simpleKeywords.some(kw => lowerMessage.includes(kw)) && priority === 'cost') {
    return {
      model: 'gpt-4o-mini',
      reason: 'simple_query',
      estimatedCost: 0.002
    };
  }
  
  // Código/programación → mejor modelo
  if (lowerMessage.includes('código') || lowerMessage.includes('programar') || 
      lowerMessage.includes('bug') || lowerMessage.includes('error')) {
    return {
      model: 'gpt-4o',
      reason: 'code_generation',
      estimatedCost: 0.015
    };
  }
  
  // Razonamiento complejo → GPT-4o
  if (lowerMessage.includes('analiza') || lowerMessage.includes('explica') ||
      lowerMessage.includes('comparar') || lowerMessage.includes('diferencias')) {
    return {
      model: 'gpt-4o',
      reason: 'complex_reasoning',
      estimatedCost: 0.012
    };
  }
  
  // Default: GPT-4o-mini (balance costo/calidad)
  return {
    model: 'gpt-4o-mini',
    reason: 'default_cost_optimized',
    estimatedCost: 0.003
  };
}

/**
 * Handler principal
 */
export default async (req, res) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://sandra.guestsvalencia.es';
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  };
  
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({ error: 'Method not allowed' });
  }
  
  try {
    // Obtener userId (IP o session ID)
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] 
      || req.headers['client-ip'] 
      || 'anonymous';
    const userId = req.headers['x-user-id'] || clientIP;
    
    // 1. Rate Limiting
    const rateLimit = rateLimiter.checkLimit(userId);
    if (!rateLimit.allowed) {
      headers['X-RateLimit-Limit'] = '20';
      headers['X-RateLimit-Remaining'] = '0';
      headers['X-RateLimit-Reset'] = new Date(rateLimit.resetTime).toISOString();
      headers['Retry-After'] = Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString();
      
      res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Max 20 requests per minute.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        });
    }
    
    headers['X-RateLimit-Limit'] = '20';
    headers['X-RateLimit-Remaining'] = rateLimit.remaining.toString();
    headers['X-RateLimit-Reset'] = new Date(rateLimit.resetTime).toISOString();
    
    // 2. Parsear request
    const body = JSON.parse(req.body || '{}');
    const { message, options: userOptions = {} } = body;
    
    // Validación
    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({
          error: 'Invalid request',
          message: 'Message is required and must be a non-empty string'
        });
    }
    
    // 3. Selección inteligente de modelo
    const modelSelection = selectModel(message, userOptions);
    
    // 4. Procesar con retry y fallback
    let result;
    let selectedModel = modelSelection.model;
    let fallbackUsed = false;
    
    try {
      // Intentar con retry
      result = await retryWithBackoff(async () => {
        // Usar Nucleus (ya tiene integración con OpenAI)
        const nucleusContext = {
          ...userOptions,
          model: selectedModel,
          priority: userOptions.priority || 'cost'
        };
        
        const response = await SandraNucleus.brain.processMessage(message, nucleusContext);
        
        return {
          text: response.text,
          model: selectedModel,
          usage: {
            prompt_tokens: Math.ceil(message.length / 4),
            completion_tokens: Math.ceil((response.text?.length || 0) / 4)
          },
          metadata: response.metadata
        };
      }, 3);
      
    } catch (error) {
      console.error(`[CHAT-RESILIENT] Primary model failed:`, error);
      
      // FALLBACK: Usar modelo más simple si falla
      if (selectedModel === 'gpt-4o') {
        console.log('[FALLBACK] Switching to GPT-4o-mini...');
        selectedModel = 'gpt-4o-mini';
        fallbackUsed = true;
        
        try {
          result = await retryWithBackoff(async () => {
            const response = await SandraNucleus.brain.processMessage(message, {
              ...userOptions,
              model: 'gpt-4o-mini'
            });
            
            return {
              text: response.text,
              model: 'gpt-4o-mini (fallback)',
              usage: {
                prompt_tokens: Math.ceil(message.length / 4),
                completion_tokens: Math.ceil((response.text?.length || 0) / 4)
              },
              metadata: response.metadata
            };
          }, 2);
        } catch (fallbackError) {
          console.error('[CHAT-RESILIENT] Fallback also failed:', fallbackError);
          throw new Error('All AI services unavailable');
        }
      } else {
        throw error;
      }
    }
    
    // 5. Cost Tracking
    const cost = costTracker.recordCost(
      selectedModel,
      result.usage.prompt_tokens,
      result.usage.completion_tokens,
      requestId
    );
    
    // 6. Response
    const latency = Date.now() - startTime;
    
    res.status(200).json({
        text: result.text,
        model: result.model,
        cost: cost.toFixed(6),
        totalCost: costTracker.totalCost.toFixed(4),
        latency: latency,
        fallback: fallbackUsed,
        requestId: requestId,
        timestamp: new Date().toISOString()
      });
    
  } catch (error) {
    console.error('[CHAT-RESILIENT] Error:', error);
    
    res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
        requestId: requestId,
        timestamp: new Date().toISOString()
      });
  }
};

