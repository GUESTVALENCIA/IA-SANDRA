/**
 * Cartesia Text-to-Speech API Endpoint
 * Convierte texto a audio de alta calidad usando Cartesia
 */

const axios = require('axios');

// API Key de Cartesia
const CARTESIA_API_KEY = process.env.CARTESIA_API_KEY || 'sk_car_67c5Tg8LMpR9G6unHvsvnw';

/**
 * Generar audio desde texto usando Cartesia
 */
async function generateSpeech(text, options = {}) {
  const {
    voice = 'sandra', // Voz por defecto
    model = 'sonic-english',
    language = 'es',
    sampleRate = 22050,
    format = 'pcm' // pcm, mp3, wav
  } = options;

  const cartesiaApiKey = CARTESIA_API_KEY;
  
  if (!cartesiaApiKey || cartesiaApiKey.trim() === '') {
    throw new Error('CARTESIA_API_KEY not configured');
  }

  try {
    // Mapeo de voces de Cartesia
    const voiceMap = {
      'sandra': 'sonic-english', // Voz inglesa pero puede hablar español
      'spanish': 'sonic-spanish',
      'english': 'sonic-english'
    };

    const selectedVoice = voiceMap[voice] || voice;

    // Llamada a Cartesia API
    const response = await axios.post(
      'https://api.cartesia.com/tts/v1/generate',
      {
        text: text,
        model_id: model || selectedVoice,
        voice_id: selectedVoice,
        output_format: format,
        sample_rate: sampleRate,
        language: language
      },
      {
        headers: {
          'Authorization': `Bearer ${cartesiaApiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer', // Para audio binario
        timeout: 30000 // 30 segundos timeout
      }
    );

    // Retornar buffer de audio
    return Buffer.from(response.data);

  } catch (error) {
    console.error('[CARTESIA-TTS] Error:', error.message);
    
    if (error.response) {
      console.error('[CARTESIA-TTS] Response status:', error.response.status);
      console.error('[CARTESIA-TTS] Response data:', error.response.data);
    }
    
    throw new Error(`Cartesia TTS failed: ${error.message}`);
  }
}

/**
 * Endpoint HTTP para generar TTS
 */
export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
          const { text, voice = 'sandra', model, language = 'es', sampleRate = 22050, format = 'mp3' } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ 
        error: 'Text is required',
        message: 'Please provide a text string to convert to speech'
      });
    }

    // Validar longitud del texto
    if (text.length > 5000) {
      return res.status(400).json({
        error: 'Text too long',
        message: 'Maximum text length is 5000 characters'
      });
    }

    console.log(`[CARTESIA-TTS] Generating speech for text: ${text.substring(0, 50)}...`);

    // Generar audio
    const audioBuffer = await generateSpeech(text, {
      voice,
      model,
      language,
      sampleRate,
      format
    });

    // Determinar content type según formato
    const contentType = format === 'mp3' 
      ? 'audio/mpeg'
      : format === 'wav'
      ? 'audio/wav'
      : 'audio/pcm'; // PCM por defecto

    // Retornar audio
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    
    return res.status(200).send(audioBuffer);

  } catch (error) {
    console.error('[CARTESIA-TTS] Error:', error);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'TTS generation failed',
      message: error.message
    });
  }
}

// Exportar función de generación para uso en otros módulos
module.exports = {
  generateSpeech
};

