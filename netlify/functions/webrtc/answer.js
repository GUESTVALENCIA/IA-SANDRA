// SANDRA IA - WEBRTC SIGNALING SERVER
// Endpoint: /api/webrtc/answer
// Purpose: Generate and return WebRTC answer for client offer

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

    if (!['POST', 'GET'].includes(event.httpMethod)) {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    let sessionId;

    if (event.httpMethod === 'POST') {
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
      sessionId = body.sessionId;
    } else {
      sessionId = event.queryStringParameters?.sessionId;
    }

    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Session ID required' })
      };
    }

    // In a full implementation, this would:
    // 1. Retrieve the offer from session storage
    // 2. Create a PeerConnection on server side
    // 3. Set remote description (offer)
    // 4. Create answer
    // 5. Set local description (answer)
    // 6. Return answer to client

    // For now, we simulate answer generation
    // Note: Full server-side WebRTC requires additional infrastructure
    // like media servers (Janus, Kurento, mediasoup)

    console.log(`⚙️ Generating answer for session ${sessionId}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sessionId,
        status: 'answer_pending',
        message: 'Answer generation requires media server setup',
        note: 'Consider using peer-to-peer WebRTC or integrate media server like Janus/mediasoup'
      })
    };

  } catch (error) {
    console.error('WebRTC answer handler error:', error);
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
