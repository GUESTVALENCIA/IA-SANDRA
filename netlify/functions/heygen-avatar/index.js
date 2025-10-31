// SANDRA IA 7.0 - HEYGEN STREAMING AVATAR
// Professional video avatar with 4K quality and lipsync
// API: https://docs.heygen.com/reference/new-session-copy

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action, text, sessionId } = JSON.parse(event.body);

    const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
    const HEYGEN_AVATAR_ID = process.env.HEYGEN_AVATAR_ID;

    if (!HEYGEN_API_KEY || !HEYGEN_AVATAR_ID) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'HeyGen credentials not configured' })
      };
    }

    // ACTION: START - Create new HeyGen streaming session
    if (action === 'start') {
      console.log('🎬 Starting HeyGen session...');

      const response = await fetch('https://api.heygen.com/v1/streaming.new', {
        method: 'POST',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quality: 'high', // 'low' | 'medium' | 'high' (4K)
          avatar_name: HEYGEN_AVATAR_ID,
          voice: {
            voice_id: 'Cartesia-ES', // Spanish voice
            rate: 1.0,
            emotion: 'friendly'
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('HeyGen start error:', error);
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ error: 'Failed to start HeyGen session', details: error })
        };
      }

      const data = await response.json();
      console.log('✅ HeyGen session started:', data.data.session_id);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          sessionId: data.data.session_id,
          sdp: data.data.sdp,
          iceServers: data.data.ice_servers || [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        })
      };
    }

    // ACTION: SPEAK - Make avatar speak with text
    if (action === 'speak') {
      console.log('🗣️ HeyGen speaking:', text?.substring(0, 50) + '...');

      const response = await fetch(`https://api.heygen.com/v1/streaming.task`, {
        method: 'POST',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          text: text,
          task_type: 'talk'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('HeyGen speak error:', error);
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ error: 'Failed to make avatar speak', details: error })
        };
      }

      const data = await response.json();
      console.log('✅ Avatar speaking');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          taskId: data.data?.task_id
        })
      };
    }

    // ACTION: STOP - Close HeyGen session
    if (action === 'stop') {
      console.log('🛑 Stopping HeyGen session:', sessionId);

      const response = await fetch(`https://api.heygen.com/v1/streaming.stop`, {
        method: 'POST',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('HeyGen stop error:', error);
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ error: 'Failed to stop session', details: error })
        };
      }

      console.log('✅ HeyGen session stopped');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Session stopped'
        })
      };
    }

    // ACTION: STATUS - Get session status
    if (action === 'status') {
      const response = await fetch(`https://api.heygen.com/v1/streaming.list`, {
        method: 'GET',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY
        }
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ error: 'Failed to get status', details: error })
        };
      }

      const data = await response.json();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          sessions: data.data
        })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action. Use: start, speak, stop, status' })
    };

  } catch (error) {
    console.error('HeyGen function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
