/**
 * Chat Endpoint - Motor de Sandra IA con OpenAI
 * SOLO TIEMPO REAL - Sin fallbacks automáticos
 */

const { SandraOrchestrator } = require('../orchestrator/sandra-orchestrator');

let orchestrator = null;

async function getOrchestrator() {
  if (!orchestrator) {
    orchestrator = new SandraOrchestrator();
    await orchestrator.initialize();
  }
  return orchestrator;
}

/**
 * Endpoint de chat - Solo conexión en tiempo real con OpenAI
 */
export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationId, context = {} } = req.body;

    // Validar mensaje
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        error: 'Message is required',
        message: 'Please provide a message string'
      });
    }

    // Validar longitud
    if (message.length > 5000) {
      return res.status(400).json({
        error: 'Message too long',
        message: 'Maximum message length is 5000 characters'
      });
    }

    console.log(`[CHAT] Procesando mensaje en tiempo real: "${message.substring(0, 50)}..."`);

    // Verificar que OpenAI API Key esté configurada
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey || openaiKey.trim() === '') {
      throw new Error('OPENAI_API_KEY no configurada. Se requiere conexión en tiempo real.');
    }

    // Obtener orchestrator
    const orch = await getOrchestrator();

    // Procesar mensaje en tiempo real con OpenAI
    const startTime = Date.now();

    const contextWithMessage = {
      ...context,
      message,
      conversationId: conversationId || `conv-${Date.now()}`,
      platform: context.platform || 'web',
      userId: context.userId || 'anonymous',
      language: context.language || 'es',
      timestamp: Date.now()
    };

    console.log(`[CHAT] Enviando a OpenAI en tiempo real...`);

    const response = await orch.processMessage(message, contextWithMessage);

    const endTime = Date.now();
    const latency = endTime - startTime;

    // Validar que la respuesta sea real (no vacía)
    if (!response || !response.text || response.text.trim() === '') {
      throw new Error('OpenAI retornó respuesta vacía. Se requiere conexión en tiempo real.');
    }

    console.log(`[CHAT] Respuesta recibida en tiempo real: ${latency}ms`);

    // Formatear respuesta
          // Compatibilidad con sandra-coo-desktop (espera {reply: "text"})
          const formattedResponse = {
            success: true,
            text: response.text,
            reply: response.text, // Para compatibilidad con sandra-coo-desktop
            conversationId: contextWithMessage.conversationId,
            timestamp: new Date().toISOString(),
            latency: latency,
            metadata: {
              model: response.metadata?.model || 'gpt-4o',
              intent: response.intent,
              role: response.role || response.metadata?.role,
              confidence: response.confidence || 0.95
            }
          };

          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/json');
          return res.status(200).json(formattedResponse);

  } catch (error) {
    console.error('[CHAT] Error en tiempo real:', error);

    // NO fallback - retornar error explícito
    const errorResponse = {
      success: false,
      error: error.message || 'Error processing message',
      timestamp: new Date().toISOString(),
      requiresRealtimeConnection: true
    };

    // Errores específicos de OpenAI
    if (error.message.includes('OPENAI_API_KEY')) {
      errorResponse.error = 'OPENAI_API_KEY no configurada. Se requiere conexión en tiempo real.';
      errorResponse.statusCode = 500;
    } else if (error.message.includes('timeout')) {
      errorResponse.error = 'Timeout en conexión con OpenAI. Se requiere conexión en tiempo real.';
      errorResponse.statusCode = 504;
    } else if (error.response?.status === 401) {
      errorResponse.error = 'API Key de OpenAI inválida o expirada.';
      errorResponse.statusCode = 401;
    } else if (error.response?.status === 429) {
      errorResponse.error = 'Rate limit de OpenAI alcanzado. Por favor intenta más tarde.';
      errorResponse.statusCode = 429;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(errorResponse.statusCode || 500).json(errorResponse);
  }
}

