const fetch = global.fetch;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// TTS MP3 - API gratuita confiable
async function ttsmp3TTS(text) {
  // Using ttsmp3.com free API - no key required
  const params = new URLSearchParams({
    textspeak: text,
    lang: 'es',  // Spanish
    speed: 0.8
  });

  const resp = await fetch('https://ttsmp3.com/api/convert?textspeak=' + encodeURIComponent(text) + '&lang=es&speed=0.8', {
    method: 'GET'
  });

  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(`TTS MP3 ${resp.status}: ${error}`);
  }

  const data = await resp.json();
  if (!data.URL) throw new Error('No audio URL in response');

  // Fetch the audio file
  const audioResp = await fetch(data.URL);
  if (!audioResp.ok) throw new Error(`Failed to fetch audio: ${audioResp.status}`);

  const buf = Buffer.from(await audioResp.arrayBuffer());
  return { mime: 'audio/mpeg', buf };
}

async function elevenlabsTTS(text) {
  const key = process.env.ELEVENLABS_API_KEY;
  const voice = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice) throw new Error('ElevenLabs not configured');

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  });

  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(`ElevenLabs ${resp.status}: ${error}`);
  }

  const buf = Buffer.from(await resp.arrayBuffer());
  return { mime: 'audio/mpeg', buf };
}

async function cartesiaTTS(text) {
  const key = process.env.CARTESIA_API_KEY;
  const voice = process.env.CARTESIA_VOICE_ID;
  if (!key || !voice) throw new Error('Cartesia not configured');

  const resp = await fetch('https://api.cartesia.ai/tts/stream', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model_id: 'sonic-english',
      transcript: text,
      voice: {
        mode: 'id',
        id: voice
      },
      output_format: {
        container: 'raw',
        encoding: 'pcm_s16le',
        sample_rate: 16000
      }
    })
  });

  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(`Cartesia ${resp.status}: ${error}`);
  }

  const buf = Buffer.from(await resp.arrayBuffer());
  return { mime: 'audio/wav', buf };
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

    // Multi-provider TTS fallback chain
    // Tier 1: TTS MP3 (free, reliable) 💚
    // Tier 2: ElevenLabs (premium)
    // Tier 3: Cartesia (backup)

    try {
      console.log('🎤 Tier 1: Trying TTS MP3 (free)...');
      result = await ttsmp3TTS(text);
      console.log('✅ TTS generated with TTS MP3');
    } catch (mp3Error) {
      console.warn('TTS MP3 failed:', mp3Error.message);

      try {
        console.log('🎤 Tier 2: Trying ElevenLabs...');
        result = await elevenlabsTTS(text);
        console.log('✅ TTS generated with ElevenLabs');
      } catch (elError) {
        console.warn('ElevenLabs failed:', elError.message);

        try {
          console.log('🎤 Tier 3: Trying Cartesia...');
          result = await cartesiaTTS(text);
          console.log('✅ TTS generated with Cartesia');
        } catch (ctError) {
          console.error('❌ All TTS providers failed');
          throw new Error(`All TTS failed - TTS MP3: ${mp3Error.message.slice(0,40)} | ElevenLabs: ${elError.message.slice(0,40)} | Cartesia: ${ctError.message.slice(0,40)}`);
        }
      }
    }

    const audioBase64 = result.buf.toString('base64');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        audioBase64,
        mime: result.mime,
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
