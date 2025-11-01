/**
 * Barge-In Endpoint
 * Detiene la respuesta actual de TTS cuando el usuario interrumpe
 */

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simplemente confirmar que se recibió el barge-in
    // En producción, esto podría detener streams de audio activos
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      message: 'Barge-in received',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[BARGE-IN] Error:', error);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'Barge-in failed',
      message: error.message
    });
  }
}

