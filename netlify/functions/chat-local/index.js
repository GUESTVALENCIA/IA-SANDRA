// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - LOCAL CHAT ENDPOINT (OPTIMIZED)
// Tier System: Qwen → Mistral → Llama → GROQ
// Enhanced with cache, metrics, robust error handling + 18 ROLES
// ═══════════════════════════════════════════════════════════════════

const { withMiddleware, createSuccessResponse, createErrorResponse } = require('../shared/middleware');
const config = require('../shared/config');
const logger = require('../shared/logger');
const cache = require('../shared/cache');
const { recordRequest, recordModelUsage, recordError } = require('../metrics');

/**
 * Call Ollama local model with role-specific prompt
 */
async function callOllama(model, messages, role = 'guests-valencia') {
  const startTime = Date.now();

  try {
    // Obtener prompt según rol
    const systemPrompt = config.sandraPrompt.getRolePrompt(role);

    const response = await fetch(`${config.models.ollama.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: false,
        options: config.models.ollama.options
      }),
      timeout: config.models.ollama.timeout
    });

    if (!response.ok) {
      throw new Error(`Ollama ${model} HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.message?.content?.trim() || 'Sin respuesta';
    const latency = Date.now() - startTime;

    return { text, latency };

  } catch (error) {
    throw new Error(`Ollama ${model} failed: ${error.message}`);
  }
}

/**
 * Call GROQ API (Tier 4 fallback) with role-specific prompt
 */
async function callGROQ(messages, role = 'guests-valencia') {
  const startTime = Date.now();

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    // Obtener prompt según rol
    const systemPrompt = config.sandraPrompt.getRolePrompt(role);

    const response = await fetch(`${config.models.groq.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.models.groq.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: config.sandraPrompt.maxTokens
      }),
      timeout: config.models.groq.timeout
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GROQ HTTP ${response.status}: ${error}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || 'Sin respuesta';
    const latency = Date.now() - startTime;

    return { text, latency };

  } catch (error) {
    throw new Error(`GROQ failed: ${error.message}`);
  }
}

/**
 * Execute tier cascade with fallback
 */
async function executeTierCascade(messages, role, requestLogger) {
  const recentMessages = messages.slice(-10); // Optimize: only recent context

  // Try each tier in sequence
  for (const tier of config.tiers.local) {
    try {
      requestLogger.info(`Trying ${tier.name} (Tier ${tier.tier}) with role: ${role}`);

      const result = await callOllama(tier.model, recentMessages, role);

      recordModelUsage(tier.name, tier.tier, true);
      requestLogger.info(`${tier.name} succeeded`, {
        latency: `${result.latency}ms`,
        tier: tier.tier,
        role: role
      });

      return {
        text: result.text,
        provider: tier.name,
        tier: tier.tier,
        cost: tier.cost,
        latency: `${result.latency}ms`,
        role: role
      };

    } catch (error) {
      recordModelUsage(tier.name, tier.tier, false);
      requestLogger.warn(`${tier.name} failed`, {
        error: error.message,
        tier: tier.tier
      });
      // Continue to next tier
    }
  }

  // Final fallback: GROQ API (Tier 4)
  const groqTier = config.tiers.api[0];
  try {
    requestLogger.info(`Trying ${groqTier.name} (Tier ${groqTier.tier}) - Final fallback with role: ${role}`);

    const result = await callGROQ(recentMessages, role);

    recordModelUsage(groqTier.name, groqTier.tier, true);
    requestLogger.info(`${groqTier.name} succeeded`, {
      latency: `${result.latency}ms`,
      tier: groqTier.tier,
      role: role
    });

    return {
      text: result.text,
      provider: groqTier.name,
      tier: groqTier.tier,
      cost: groqTier.cost,
      latency: `${result.latency}ms`,
      role: role
    };

  } catch (error) {
    recordModelUsage(groqTier.name, groqTier.tier, false);
    recordError('chat-local', error, { cascade: 'complete_failure' });
    throw new Error('All models failed. Please try again later.');
  }
}

/**
 * Main handler
 */
const handler = async (event, context, { requestId, body, logger: requestLogger }) => {
  const startTime = Date.now();

  try {
    const { messages = [], locale = 'es-ES', role = 'guests-valencia' } = body;

    // Validar rol
    if (!config.sandraPrompt.isValidRole(role)) {
      requestLogger.warn('Invalid role provided, using default', { role });
      body.role = 'guests-valencia';
    }

    // Validate messages
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided');
    }

    // Get last user message for caching
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    requestLogger.info('Processing chat request', {
      messageCount: messages.length,
      userMessage: lastUserMessage.content?.substring(0, 100),
      role: body.role
    });

    // Check cache first (cache incluye role en key)
    const cacheKey = `${body.role}:${lastUserMessage.content}`;
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      requestLogger.info('Cache hit - returning cached response', { role: body.role });

      const latency = Date.now() - startTime;
      recordRequest('chat-local', 200, latency);

      return createSuccessResponse({
        text: cachedResponse,
        provider: 'Cache',
        tier: 0,
        cost: 'FREE',
        latency: `${latency}ms`,
        cached: true,
        role: body.role
      });
    }

    // Execute tier cascade
    const result = await executeTierCascade(messages, body.role, requestLogger);

    // Cache the response
    cache.set(cacheKey, result.text);

    // Record metrics
    const latency = Date.now() - startTime;
    recordRequest('chat-local', 200, latency);

    requestLogger.info('Chat request completed', {
      provider: result.provider,
      tier: result.tier,
      role: result.role,
      totalLatency: `${latency}ms`
    });

    return createSuccessResponse(result);

  } catch (error) {
    const latency = Date.now() - startTime;
    recordRequest('chat-local', 500, latency);
    recordError('chat-local', error);

    requestLogger.error('Chat request failed', {
      error: error.message,
      latency: `${latency}ms`
    });

    return createErrorResponse(error);
  }
};

// Export with middleware
exports.handler = withMiddleware(handler, {
  endpoint: 'chat',
  methods: ['POST'],
  requiredFields: ['messages'],
  rateLimit: true,
  logging: true
});
