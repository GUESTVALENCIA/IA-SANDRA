// SANDRA IA - WEBRTC SIGNALING SERVER
// Endpoint: /api/webrtc/ice
// Purpose: Exchange ICE candidates between peers

const iceCandidates = new Map();

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod === 'POST') {
      // Store ICE candidate
      let body = {};
      try {
        body = JSON.parse(event.body || '{}');
      } catch (e) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid JSON' })
        };
      }

      const { sessionId, candidate } = body;

      if (!sessionId || !candidate) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Session ID and candidate required' })
        };
      }

      // Store candidate for this session
      if (!iceCandidates.has(sessionId)) {
        iceCandidates.set(sessionId, []);
      }

      iceCandidates.get(sessionId).push({
        candidate,
        timestamp: Date.now()
      });

      console.log(`✅ ICE candidate stored for session ${sessionId}`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          sessionId,
          candidatesCount: iceCandidates.get(sessionId).length
        })
      };

    } else if (event.httpMethod === 'GET') {
      // Retrieve ICE candidates
      const sessionId = event.queryStringParameters?.sessionId;

      if (!sessionId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Session ID required' })
        };
      }

      const candidates = iceCandidates.get(sessionId) || [];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          sessionId,
          candidates
        })
      };

    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

  } catch (error) {
    console.error('WebRTC ICE handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Internal server error',
        success: false
      })
    };
  }
};

// Clean up old ICE candidates (> 5 minutes)
setInterval(() => {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes

  for (const [sessionId, candidates] of iceCandidates.entries()) {
    const recentCandidates = candidates.filter(c => now - c.timestamp < maxAge);

    if (recentCandidates.length === 0) {
      iceCandidates.delete(sessionId);
      console.log(`🗑️ Cleaned up ICE candidates for session ${sessionId}`);
    } else if (recentCandidates.length < candidates.length) {
      iceCandidates.set(sessionId, recentCandidates);
    }
  }
}, 60000); // Run every minute
