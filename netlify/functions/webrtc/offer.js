// SANDRA IA - WEBRTC SIGNALING SERVER
// Endpoint: /api/webrtc/offer
// Purpose: Handle WebRTC offer from client and create session

const sessions = new Map();

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

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

    const { offer, sessionId } = body;

    if (!offer || !offer.type || !offer.sdp) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid offer format' })
      };
    }

    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Session ID required' })
      };
    }

    // Store session offer
    sessions.set(sessionId, {
      offer,
      createdAt: Date.now(),
      status: 'waiting_answer'
    });

    console.log(`✅ WebRTC offer stored for session ${sessionId}`);

    // In a real implementation, this would trigger answer generation
    // For now, we return acknowledgment
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sessionId,
        status: 'offer_received',
        message: 'Offer stored, waiting for answer generation'
      })
    };

  } catch (error) {
    console.error('WebRTC offer handler error:', error);
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

// Clean up old sessions (> 5 minutes)
setInterval(() => {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes

  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > maxAge) {
      sessions.delete(sessionId);
      console.log(`🗑️ Cleaned up expired session ${sessionId}`);
    }
  }
}, 60000); // Run every minute
