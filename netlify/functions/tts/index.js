// SANDRA IA - TTS ENDPOINT
// Tier 1: TTS MP3 (Free, no keys required)
// Tier 2: Cartesia (Backup - premium)

const fetch = global.fetch;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Tier 1: TTS MP3 - Free API (no API key required)
async function ttsmp3TTS(text) {
  try {
    console.log('🎤 Tier 1: TTS MP3 - Converting to speech...');

    const url = `https://ttsmp3.com/api/convert?textspeak=${encodeURIComponent(text)}&lang=es&speed=0.8`;

    const resp = await fetch(url, { method: 'GET', timeout: 30000 });

    if (!resp.ok) {
      throw new Error(`TTS MP3 API returned ${resp.status}`);
    }

    const data = await resp.json();

    if (!data.URL) {
      throw new Error('No audio URL in TTS MP3 response');
    }

    // Fetch the audio file from S3
    const audioResp = await fetch(data.URL, { timeout: 30000 });

    if (!audioResp.ok) {
      throw new Error(`Failed to fetch audio from ${data.URL}: ${audioResp.status}`);
    }

    const buf = Buffer.from(await audioResp.arrayBuffer());
    console.log('✅ TTS MP3 succeeded - Audio generated');
    return { mime: 'audio/mpeg', buf };

  } catch (error) {
    throw new Error(`TTS MP3 failed: ${error.message}`);
  }
}

// Tier 2: Cartesia - Premium TTS backup (using /tts/bytes endpoint v2024-06-10)
async function cartesiaTTS(text) {
  try {
    console.log('🎤 Tier 2: Cartesia - Converting to speech...');

    const key = process.env.CARTESIA_API_KEY;
    const voice = process.env.CARTESIA_VOICE_ID;

    if (!key || !voice) {
      throw new Error('Cartesia API key or voice ID not configured');
    }

    const resp = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'Cartesia-Version': '2024-06-10',
        'X-API-Key': key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model_id: 'sonic-2',
        transcript: text,
        voice: {
          mode: 'id',
          id: voice
        },
        output_format: {
          container: 'wav',
          encoding: 'pcm_f32le',
          sample_rate: 44100
        },
        speed: 'normal'
      }),
      timeout: 30000
    });

    if (!resp.ok) {
      const error = await resp.text();
      throw new Error(`Cartesia API returned ${resp.status}: ${error.substring(0, 100)}`);
    }

    const buf = Buffer.from(await resp.arrayBuffer());
    console.log('✅ Cartesia succeeded - Audio generated');
    return { mime: 'audio/wav', buf };

  } catch (error) {
    throw new Error(`Cartesia failed: ${error.message}`);
  }
}

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

    const { text } = body;

    if (!text || text.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    let result;
    let usedProvider = 'Unknown';

    // FALLBACK CHAIN: TTS MP3 → Cartesia
    try {
      result = await ttsmp3TTS(text);
      usedProvider = 'TTS MP3';
    } catch (mp3Error) {
      console.warn(`TTS MP3 failed: ${mp3Error.message}`);

      try {
        result = await cartesiaTTS(text);
        usedProvider = 'Cartesia';
      } catch (cartesiaError) {
        console.error(`❌ All TTS providers failed`);
        console.error(`  TTS MP3: ${mp3Error.message}`);
        console.error(`  Cartesia: ${cartesiaError.message}`);

        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({
            error: 'All TTS providers failed',
            details: {
              ttsmp3: mp3Error.message,
              cartesia: cartesiaError.message
            },
            success: false
          })
        };
      }
    }

    const audioBase64 = result.buf.toString('base64');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        audioBase64,
        mime: result.mime,
        provider: usedProvider,
        success: true
      })
    };

  } catch (error) {
    console.error('TTS Handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'TTS generation failed',
        success: false
      })
    };
  }
};
