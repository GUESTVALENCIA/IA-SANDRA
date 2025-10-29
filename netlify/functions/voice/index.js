// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - VOICE ENDPOINT
// Whisper (STT) + Cartesia (TTS) + Chat Integration
// ═══════════════════════════════════════════════════════════════════

const { withMiddleware, createSuccessResponse, createErrorResponse } = require('../shared/middleware');
const config = require('../shared/config');
const logger = require('../shared/logger');
const cache = require('../shared/cache');

/**
 * Transcribe audio using Whisper API
 */
async function transcribeAudio(audioBase64, language = 'es') {
  try {
    logger.info('Transcribing audio with Whisper', { language });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // Create form data
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });
    form.append('model', config.models.whisper.model);
    if (language) {
      form.append('language', language);
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...form.getHeaders()
      },
      body: form,
      timeout: config.models.whisper.timeout
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Whisper API error ${response.status}: ${error}`);
    }

    const data = await response.json();
    logger.info('Whisper transcription successful', {
      textLength: data.text?.length || 0
    });

    return data.text;

  } catch (error) {
    logger.error('Whisper transcription failed', { error: error.message });
    throw error;
  }
}

/**
 * Generate speech using Cartesia TTS
 */
async function generateSpeech(text) {
  try {
    logger.info('Generating speech with Cartesia', { textLength: text.length });

    const apiKey = process.env.CARTESIA_API_KEY;
    const voiceId = process.env.CARTESIA_VOICE_ID;

    if (!apiKey || !voiceId) {
      throw new Error('Cartesia API key or voice ID not configured');
    }

    const response = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'Cartesia-Version': config.tts.cartesia.version,
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model_id: config.tts.cartesia.model,
        transcript: text,
        voice: {
          mode: 'id',
          id: voiceId
        },
        output_format: config.tts.cartesia.format,
        speed: 'normal'
      }),
      timeout: 30000
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cartesia API error ${response.status}: ${error}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    logger.info('Cartesia TTS successful', {
      audioSize: audioBuffer.length
    });

    return {
      audioBase64: audioBuffer.toString('base64'),
      mime: 'audio/wav'
    };

  } catch (error) {
    logger.error('Cartesia TTS failed', { error: error.message });
    throw error;
  }
}

/**
 * Get chat response using local models
 */
async function getChatResponse(text) {
  try {
    logger.info('Getting chat response', { textLength: text.length });

    // Check cache first
    const cachedResponse = cache.get(text);
    if (cachedResponse) {
      logger.info('Using cached chat response');
      return cachedResponse;
    }

    // Call chat-local endpoint
    const response = await fetch(`${process.env.URL}/.netlify/functions/chat-local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: text }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Chat endpoint failed');
    }

    const data = await response.json();
    const chatText = data.text || 'Lo siento, no pude procesar tu mensaje.';

    // Cache the response
    cache.set(text, chatText);

    return chatText;

  } catch (error) {
    logger.error('Chat response failed', { error: error.message });
    throw error;
  }
}

/**
 * Main handler
 */
const handler = async (event, context, { requestId, body, logger: requestLogger }) => {
  try {
    const { audio, audioBase64, text, language = 'es', mode = 'full' } = body;

    // Mode: 'stt' (speech-to-text only), 'tts' (text-to-speech only), 'full' (complete pipeline)
    let transcription = text;
    let chatResponse = null;
    let speechAudio = null;

    // Step 1: Transcribe audio if provided
    if ((audio || audioBase64) && mode !== 'tts') {
      const audioData = audio || audioBase64;
      transcription = await transcribeAudio(audioData, language);
      requestLogger.info('Audio transcribed', {
        originalLength: audioData?.length,
        transcription: transcription?.substring(0, 100)
      });
    }

    // Step 2: Get chat response
    if (mode !== 'tts' && transcription) {
      chatResponse = await getChatResponse(transcription);
      requestLogger.info('Chat response generated', {
        responseLength: chatResponse?.length
      });
    }

    // Step 3: Generate speech from response
    if (mode !== 'stt' && (chatResponse || text)) {
      const textToSpeak = chatResponse || text;
      speechAudio = await generateSpeech(textToSpeak);
      requestLogger.info('Speech generated', {
        audioSize: speechAudio.audioBase64?.length
      });
    }

    // Return results based on mode
    const result = {
      requestId,
      mode
    };

    if (transcription && mode !== 'tts') {
      result.transcription = transcription;
    }

    if (chatResponse) {
      result.text = chatResponse;
    }

    if (speechAudio) {
      result.audio = speechAudio.audioBase64;
      result.mime = speechAudio.mime;
    }

    return createSuccessResponse(result);

  } catch (error) {
    requestLogger.error('Voice endpoint failed', { error: error.message });
    return createErrorResponse(error);
  }
};

// Export with middleware
exports.handler = withMiddleware(handler, {
  endpoint: 'voice',
  methods: ['POST'],
  rateLimit: true,
  logging: true
});
