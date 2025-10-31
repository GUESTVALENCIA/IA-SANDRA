/**
 * Netlify Function para Chat
 * Implementa rate limiting, autenticación y monitoring
 */

const { SandraNucleus } = require('../../orchestrator/sandra-nucleus-core');
const { rateLimiter } = require('../../orchestrator/rate-limiter');
const { chatMonitor } = require('../../orchestrator/performance-monitor');
const { errorHandler } = require('../../orchestrator/error-handler');

// Rate limiting por IP (usar Map en memoria, en producción usar Redis)
const rateLimitStore = new Map();

// Inicializar Nucleus si no está inicializado
let nucleusInitialized = false;
async function ensureNucleus() {
  if (!nucleusInitialized) {
    await SandraNucleus.initialize();
    nucleusInitialized = true;
  }
}

/**
 * Rate limiting simple por IP
 */
function checkRateLimit(clientIP) {
  const now = Date.now();
  const windowMs = 60000; // 1 minuto
  const maxRequests = 10; // 10 requests por minuto
  
  const key = `chat:${clientIP}`;
  const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
  
  // Reset si la ventana expiró
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  
  // Limpiar entradas viejas (cada 5 minutos)
  if (Math.random() < 0.01) { // ~1% de probabilidad
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime + 300000) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  if (record.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    };
  }
  
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime
  };
}

/**
 * Handler principal de la función
 */
exports.handler = async (event, context) => {
  const startTime = Date.now();
  
  // CORS headers (ajustar según dominio)
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://sandra.guestsvalencia.es';
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  };
  
  // Manejar preflight CORS (REQUERIDO para navegadores)
  if (event.httpMethod === 'OPTIONS') {
    // Responder inmediatamente a preflight requests
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Length': '0'
      },
      body: ''
    };
  }
  
  // Solo POST permitido
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    // Obtener IP del cliente
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0] 
      || event.headers['client-ip'] 
      || context.clientContext?.custom?.ip 
      || 'unknown';
    
    // Rate limiting
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      headers['X-RateLimit-Limit'] = '10';
      headers['X-RateLimit-Remaining'] = '0';
      headers['X-RateLimit-Reset'] = new Date(rateLimit.resetTime).toISOString();
      headers['Retry-After'] = rateLimit.retryAfter.toString();
      
      chatMonitor.recordMetric(startTime, 'rate_limited', 0, false);
      
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Max 10 requests per minute.`,
          retryAfter: rateLimit.retryAfter
        })
      };
    }
    
    // Agregar headers de rate limit
    headers['X-RateLimit-Limit'] = '10';
    headers['X-RateLimit-Remaining'] = rateLimit.remaining.toString();
    headers['X-RateLimit-Reset'] = new Date(rateLimit.resetTime).toISOString();
    
    // Parsear body
    const body = JSON.parse(event.body || '{}');
    const { message, context: userContext } = body;
    
    // Validación
    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw errorHandler.validationError('message', 'Message is required');
    }
    
    // Asegurar que Nucleus está inicializado
    await ensureNucleus();
    
    // Procesar mensaje
    const response = await SandraNucleus.brain.processMessage(message, userContext || {});
    
    // Estimar costo
    const estimatedCost = estimateOpenAICost(message, response.text);
    
    // Registrar métrica exitosa
    chatMonitor.recordMetric(startTime, 'success', estimatedCost, !nucleusInitialized);
    nucleusInitialized = true; // Ya está caliente
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    // Registrar error
    chatMonitor.recordMetric(startTime, 'error', 0, false);
    
    // Formatear error
    const errorResponse = errorHandler.formatError(error, process.env.NODE_ENV !== 'production');
    
    return {
      statusCode: error.statusCode || 500,
      headers,
      body: JSON.stringify(errorResponse)
    };
  }
};

/**
 * Estimar costo de OpenAI
 */
function estimateOpenAICost(input, output) {
  // GPT-4o: $5/1M input tokens, $15/1M output tokens
  // ~4 caracteres por token
  const inputTokens = (input?.length || 0) / 4;
  const outputTokens = (output?.length || 0) / 4;
  
  const inputCost = (inputTokens / 1000000) * 5;
  const outputCost = (outputTokens / 1000000) * 15;
  
  return inputCost + outputCost;
}

