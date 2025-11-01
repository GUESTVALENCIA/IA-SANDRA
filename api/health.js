/**
 * Health Check Endpoint para Vercel
 * Verifica que el servidor y APIs estén funcionando
 */

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Solo GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Sandra IA',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      services: {
        twilio: {
          whatsapp: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not configured',
          voice: process.env.TWILIO_PHONE_NUMBER ? 'configured' : 'not configured'
        },
        ai: {
          openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
          deepgram: process.env.DEEPGRAM_API_KEY ? 'configured' : 'not configured',
          cartesia: process.env.CARTESIA_API_KEY ? 'configured' : 'not configured'
        }
      },
      endpoints: {
        whatsapp: '/api/twilio-whatsapp',
        voice: '/api/twilio-voice',
        voiceProcess: '/api/twilio-voice-process'
      }
    };

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(health);

  } catch (error) {
    console.error('[HEALTH] Error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

