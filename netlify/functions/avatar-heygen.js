/**
 * Netlify Function: HeyGen Avatar
 * SOLUCIÓN al Problema AI #5
 */

const axios = require('axios');

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_AVATAR_ID = process.env.HEYGEN_AVATAR_ID || '306d1c6f1b014036b467ff70ea38d965';

/**
 * Generar video con avatar HeyGen
 */
async function generateAvatarVideo(text, avatarId = HEYGEN_AVATAR_ID) {
  try {
    const response = await axios.post(
      'https://api.heygen.com/v2/video/generate',
      {
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: avatarId,
            avatar_style: 'normal'
          },
          voice: {
            type: 'text',
            input_text: text,
            voice_id: '1bd001e7e50f421d891986aad5158bc8', // Spanish voice
            speed: 1.0
          }
        }],
        dimension: { width: 1280, height: 720 },
        aspect_ratio: '16:9'
      },
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    return {
      video_id: response.data.data.video_id,
      status: 'processing',
      webhook_url: response.data.data.webhook_url
    };
  } catch (error) {
    console.error('[HEYGEN] Error:', error.response?.data || error.message);
    throw new Error(`HeyGen API failed: ${error.message}`);
  }
}

/**
 * Obtener estado del video
 */
async function getVideoStatus(videoId) {
  try {
    const response = await axios.get(
      `https://api.heygen.com/v2/video_status.get?video_id=${videoId}`,
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY
        }
      }
    );
    
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to get video status: ${error.message}`);
  }
}

/**
 * Handler principal
 */
exports.handler = async (event, context) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://sandra.guestsvalencia.es';
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  };
  
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  // GET: Obtener estado de video
  if (event.httpMethod === 'GET') {
    const videoId = event.queryStringParameters?.video_id;
    
    if (!videoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'video_id parameter required' })
      };
    }
    
    try {
      const status = await getVideoStatus(videoId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(status)
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to get video status',
          message: error.message
        })
      };
    }
  }
  
  // POST: Generar nuevo video
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    if (!HEYGEN_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'HEYGEN_API_KEY not configured'
        })
      };
    }
    
    const body = JSON.parse(event.body || '{}');
    const { text, avatarId } = body;
    
    if (!text || typeof text !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid request',
          message: 'Text is required'
        })
      };
    }
    
    const result = await generateAvatarVideo(text, avatarId || HEYGEN_AVATAR_ID);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        video_id: result.video_id,
        status: result.status,
        embed_url: `https://app.heygen.com/interactive-avatar/${result.video_id}`,
        message: 'Video generation started. Use GET /avatar-heygen?video_id={id} to check status.',
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('[HEYGEN-AVATAR] Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Avatar generation failed',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      })
    };
  }
};

