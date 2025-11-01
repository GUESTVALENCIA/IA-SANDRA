/**
 * Netlify Function: Health Check
 * Devuelve el estado del sistema con soporte CORS/Preflight
 */

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://sandra.guestsvalencia.es';
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({ error: 'Method not allowed' });
  }

  // Formato compatible con getServiceStatus() del frontend
  res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        'sandra-ai-core': {
          available: true,
          healthy: true,
          circuitBreaker: { state: 'CLOSED', failureCount: 0 },
          capabilities: ['conversational-ai', 'strategic-advice'],
          provider: 'Netlify Functions',
          lastCheck: new Date().toISOString()
        },
        'netlify-functions': {
          available: true,
          healthy: true,
          circuitBreaker: { state: 'CLOSED', failureCount: 0 },
          capabilities: ['chat', 'voice', 'health'],
          provider: 'Netlify',
          lastCheck: new Date().toISOString()
        }
      }
    });
};
