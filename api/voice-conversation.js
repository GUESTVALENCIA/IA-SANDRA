/**
 * Netlify Function: Voice Conversation
 * Usa la versión optimizada si está disponible
 */

// Intentar usar versión optimizada, fallback a stub
try {
  const optimized = require('./voice-conversation-optimized');
  export default optimized.handler;
} catch (error) {
  // Fallback a stub básico
  export default async function handler(req, res) {
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://sandra.guestsvalencia.es';
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'true'
    };

    if (req.method === 'OPTIONS') {
      res.status(200).json({ error: 'Method not allowed' });
    }

    res.status(501).json({
        success: false,
        error: 'VOICE_CONVERSATION_NOT_IMPLEMENTED',
        message: 'Voice conversation pipeline is not yet implemented. Use voice-conversation-optimized.js'
      });
  };
}
