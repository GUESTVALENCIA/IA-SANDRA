/**
 * Netlify Function: Voice Conversation
 * Usa la versión optimizada si está disponible
 */

// Intentar usar versión optimizada, fallback a stub
try {
  const optimized = require('./voice-conversation-optimized');
  exports.handler = optimized.handler;
} catch (error) {
  // Fallback a stub básico
  exports.handler = async (event) => {
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://sandra.guestsvalencia.es';
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'true'
    };

    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    return {
      statusCode: 501,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'VOICE_CONVERSATION_NOT_IMPLEMENTED',
        message: 'Voice conversation pipeline is not yet implemented. Use voice-conversation-optimized.js'
      })
    };
  };
}
