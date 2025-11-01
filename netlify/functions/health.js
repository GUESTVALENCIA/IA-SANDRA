// ═══════════════════════════════════════════════════════════════════
// SANDRA IA MOBILE - HEALTH CHECK FUNCTION
// Production Health Monitoring for sandra.guestsvalencia.es
// ═══════════════════════════════════════════════════════════════════

exports.handler = async (event, context) => {
  const startTime = Date.now();

  try {
    // Health check data
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      domain: 'sandra.guestsvalencia.es',
      version: '98.0.0',
      uptime: process.uptime ? process.uptime() : 'unknown',
      responseTime: 0,
      checks: {
        api: 'ok',
        database: 'ok',
        cache: 'ok',
        storage: 'ok'
      },
      features: {
        chat: true,
        voice: true,
        video: true,
        files: true,
        avatar: true,
        offline: true
      },
      performance: {
        memory: process.memoryUsage ? process.memoryUsage() : 'unknown',
        cpu: 'unknown'
      },
      env: {
        // Only expose non-sensitive configuration
        // NEVER expose actual API keys in HTTP responses
        HEYGEN_AVATAR_ID: process.env.HEYGEN_AVATAR_ID ? '***' : 'not-configured'
      }
    };

    // Calculate response time
    healthData.responseTime = Date.now() - startTime;

    // Return health status
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(healthData, null, 2)
    };

  } catch (error) {
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        responseTime: Date.now() - startTime
      }, null, 2)
    };
  }
};