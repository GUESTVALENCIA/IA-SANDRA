/**
 * Netlify Function: Voice Conversation (stub)
 * Maneja conversaciones de voz (STT/TTS) - pendiente de integración
 * Incluye CORS/Preflight para compatibilidad con navegador
 */

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

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Pendiente: integrar STT (Deepgram), LLM y TTS (Cartesia)
  return {
    statusCode: 501,
    headers,
    body: JSON.stringify({
      success: false,
      error: 'VOICE_CONVERSATION_NOT_IMPLEMENTED',
      message: 'Voice conversation pipeline is not yet implemented.'
    })
  };
};
