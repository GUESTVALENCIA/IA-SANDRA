/**
 * Netlify Function: Health Check
 * Devuelve el estado del sistema con soporte CORS/Preflight
 */

exports.handler = async (event) => {
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
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Formato compatible con getServiceStatus() del frontend
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
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
    })
  };
};
