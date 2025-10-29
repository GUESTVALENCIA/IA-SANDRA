// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - LOCAL CHAT ENDPOINT (OPTIMIZED)
// Tier System: Qwen → Mistral → Llama → GROQ
// Enhanced with cache, metrics, and robust error handling
// ═══════════════════════════════════════════════════════════════════

const { withMiddleware, createSuccessResponse, createErrorResponse } = require('../shared/middleware');
const config = require('../shared/config');
const logger = require('../shared/logger');
const cache = require('../shared/cache');
const { recordRequest, recordModelUsage, recordError } = require('../metrics');

/**
 * Call Ollama local model
 */
async function callOllama(model, messages) {
  const startTime = Date.now();

  try {
    const response = await fetch(`${config.models.ollama.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: config.sandraPrompt.system },
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
 * Call GROQ API (Tier 4 fallback)
 */
async function callGROQ(messages) {
  const startTime = Date.now();

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const response = await fetch(`${config.models.groq.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.models.groq.model,
        messages: [
          { role: 'system', content: config.sandraPrompt.system },
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
async function executeTierCascade(messages, requestLogger) {
  const recentMessages = messages.slice(-10); // Optimize: only recent context

  // Try each tier in sequence
  for (const tier of config.tiers.local) {
    try {
      requestLogger.info(`Trying ${tier.name} (Tier ${tier.tier})`);

      const result = await callOllama(tier.model, recentMessages);

      recordModelUsage(tier.name, tier.tier, true);
      requestLogger.info(`${tier.name} succeeded`, {
        latency: `${result.latency}ms`,
        tier: tier.tier
      });

      return {
        text: result.text,
        provider: tier.name,
        tier: tier.tier,
        cost: tier.cost,
        latency: `${result.latency}ms`
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
    requestLogger.info(`Trying ${groqTier.name} (Tier ${groqTier.tier}) - Final fallback`);

    const result = await callGROQ(recentMessages);

    recordModelUsage(groqTier.name, groqTier.tier, true);
    requestLogger.info(`${groqTier.name} succeeded`, {
      latency: `${result.latency}ms`,
      tier: groqTier.tier
    });

    return {
      text: result.text,
      provider: groqTier.name,
      tier: groqTier.tier,
      cost: groqTier.cost,
      latency: `${result.latency}ms`
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
    const { messages = [], locale = 'es-ES' } = body;

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
      userMessage: lastUserMessage.content?.substring(0, 100)
    });

    // Check cache first
    const cachedResponse = cache.get(lastUserMessage.content);
    if (cachedResponse) {
      requestLogger.info('Cache hit - returning cached response');

      const latency = Date.now() - startTime;
      recordRequest('chat-local', 200, latency);

      return createSuccessResponse({
        text: cachedResponse,
        provider: 'Cache',
        tier: 0,
        cost: 'FREE',
        latency: `${latency}ms`,
        cached: true
      });
    }

    // Execute tier cascade
    const result = await executeTierCascade(messages, requestLogger);

    // Cache the response
    cache.set(lastUserMessage.content, result.text);

    // Record metrics
    const latency = Date.now() - startTime;
    recordRequest('chat-local', 200, latency);

    requestLogger.info('Chat request completed', {
      provider: result.provider,
      tier: result.tier,
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
