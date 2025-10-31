// ============================================
// SANDRA IA - HEYGEN STREAMING AVATAR API
// Professional video avatar with real-time lipsync
// CEO: Clayton Thomas - URGENT REQUIREMENT #5
// ============================================

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

exports.handler = async (event) => {
  // Handle OPTIONS preflight
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

  try {
    const { action, text, sessionId } = JSON.parse(event.body || '{}');

    const apiKey = process.env.HEYGEN_API_KEY;
    const avatarId = process.env.HEYGEN_AVATAR_ID || '306d1c6f1b014036b467ff70ea38d965';

    if (!apiKey) {
      throw new Error('HEYGEN_API_KEY not configured');
    }

    console.log(`[HeyGen] Action: ${action}, Avatar: ${avatarId}`);

    // HeyGen API Base URL
    const baseUrl = 'https://api.heygen.com/v1/streaming.new';

    // ============================================
    // ACTION: START SESSION
    // ============================================
    if (action === 'start') {
      console.log('[HeyGen] Starting streaming session...');

      const response = await fetch(`${baseUrl}/create_session`, {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          avatar_id: avatarId,
          quality: 'high',
          voice: {
            voice_id: 'spanish_female_calm',
            emotion: 'friendly',
            speed: 1.0
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[HeyGen] Start failed:', error);
        throw new Error(`HeyGen start failed: ${error}`);
      }

      const data = await response.json();
      console.log('[HeyGen] Session started:', data.data?.session_id);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          sessionId: data.data?.session_id,
          sdp: data.data?.sdp,
          iceServers: data.data?.ice_servers2 || []
        })
      };

    // ============================================
    // ACTION: SPEAK TEXT (with lipsync)
    // ============================================
    } else if (action === 'speak') {
      if (!sessionId) {
        throw new Error('Session ID required for speak action');
      }

      if (!text || text.trim().length === 0) {
        throw new Error('Text required for speak action');
      }

      console.log('[HeyGen] Speaking text:', text.substring(0, 50) + '...');

      const response = await fetch(`${baseUrl}/submit_ice`, {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          text: text.trim(),
          task_type: 'speak'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[HeyGen] Speak failed:', error);
        throw new Error(`HeyGen speak failed: ${error}`);
      }

      const data = await response.json();
      console.log('[HeyGen] Speak task submitted:', data.data?.task_id);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          taskId: data.data?.task_id
        })
      };

    // ============================================
    // ACTION: STOP SESSION
    // ============================================
    } else if (action === 'stop') {
      if (!sessionId) {
        throw new Error('Session ID required for stop action');
      }

      console.log('[HeyGen] Stopping session:', sessionId);

      const response = await fetch(`${baseUrl}/stop_session`, {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[HeyGen] Stop failed:', error);
        // Don't throw error for stop failures - cleanup anyway
      }

      console.log('[HeyGen] Session stopped successfully');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };

    // ============================================
    // ACTION: ICE CANDIDATE (WebRTC negotiation)
    // ============================================
    } else if (action === 'ice') {
      const { candidate, sdpMid, sdpMLineIndex } = JSON.parse(event.body || '{}');

      if (!sessionId || !candidate) {
        throw new Error('Session ID and candidate required for ICE');
      }

      console.log('[HeyGen] Submitting ICE candidate...');

      const response = await fetch(`${baseUrl}/submit_ice`, {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          candidate: {
            candidate,
            sdpMid,
            sdpMLineIndex
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[HeyGen] ICE submission failed:', error);
        throw new Error(`ICE submission failed: ${error}`);
      }

      console.log('[HeyGen] ICE candidate submitted');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };

    // ============================================
    // INVALID ACTION
    // ============================================
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid action. Valid actions: start, speak, stop, ice'
        })
      };
    }

  } catch (error) {
    console.error('[HeyGen] Error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      })
    };
  }
};
