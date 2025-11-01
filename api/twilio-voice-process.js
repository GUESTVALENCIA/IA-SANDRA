/**
 * Procesa el audio de la llamada telefónica
 * STT (Deepgram) → GPT-4o → TTS (Cartesia) → Audio
 * Formato: Vercel Serverless Function
 */

const twilio = require('twilio');
const axios = require('axios');
const fs = require('fs');

let orchestrator = null;

async function getOrchestrator() {
  if (!orchestrator) {
    const { SandraOrchestrator } = require('../orchestrator/sandra-orchestrator');
    orchestrator = new SandraOrchestrator();
    await orchestrator.initialize();
  }
  return orchestrator;
}

/**
 * Procesa el audio grabado o la transcripción
 */
export default async function handler(req, res) {
  // CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      CallSid: callId,
      From: callerNumber,
      RecordingUrl: recordingUrl,
      TranscriptionText: transcription,
      Digits: dtmfDigits
    } = req.body;

    console.log(`[TWILIO-VOICE-PROCESS] Procesando llamada ${callId}`);

    const orch = await getOrchestrator();
    const twiml = new twilio.twiml.VoiceResponse();

    let userMessage = '';

    // Si hay transcripción, usarla directamente
    if (transcription && transcription.trim()) {
      userMessage = transcription.trim();
      console.log(`[TWILIO-VOICE-PROCESS] Usando transcripción: ${userMessage}`);
    }
    // Si hay URL de grabación, descargar y procesar con Deepgram
    else if (recordingUrl) {
      console.log(`[TWILIO-VOICE-PROCESS] Procesando audio desde: ${recordingUrl}`);
      
      // Descargar audio (Twilio devuelve WAV)
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_TOKEN;
      
      if (!twilioAccountSid || !twilioAuthToken) {
        throw new Error('Twilio credentials not configured');
      }

      const audioResponse = await axios.get(recordingUrl, {
        responseType: 'arraybuffer',
        auth: {
          username: twilioAccountSid,
          password: twilioAuthToken
        }
      });

      const audioBuffer = Buffer.from(audioResponse.data);

      // Usar Deepgram STT (a través de Sandra IA)
      if (orch.services.nucleus && orch.services.nucleus.multimodal) {
        const transcript = await orch.services.nucleus.multimodal.speechToText(audioBuffer);
        userMessage = transcript.text || transcript;
        console.log(`[TWILIO-VOICE-PROCESS] STT resultado: ${userMessage}`);
      } else {
        throw new Error('Multimodal service not available');
      }
    }
    // Si hay dígitos DTMF
    else if (dtmfDigits) {
      userMessage = `El usuario presionó: ${dtmfDigits}`;
    }
    else {
      // Si no hay nada, pedir que repita
      twiml.say({ voice: 'Polly.Lupe', language: 'es-ES' }, 
        'No pude escucharte bien. ¿Podrías repetir tu consulta?');
      twiml.record({
        maxLength: 30,
        action: '/api/twilio-voice/process',
        method: 'POST'
      });
      res.setHeader('Content-Type', 'text/xml');
      return res.status(200).send(twiml.toString());
    }

    if (!userMessage || userMessage.trim() === '') {
      twiml.say({ voice: 'Polly.Lupe', language: 'es-ES' }, 
        'No entendí tu mensaje. ¿Puedes repetirlo?');
      twiml.record({
        maxLength: 30,
        action: '/api/twilio-voice/process',
        method: 'POST'
      });
      res.setHeader('Content-Type', 'text/xml');
      return res.status(200).send(twiml.toString());
    }

    // Procesar mensaje con Sandra IA
    const context = {
      platform: 'voice',
      userId: callerNumber,
      conversationId: `voice-${callId}`,
      touristActivity: true,
      language: 'es',
      role: 'guests-valencia'
    };

    // Intentar con handler de actividades turísticas
    const { TouristActivityHandler } = require('../orchestrator/tourist-activity-handler');
    const activityHandler = new TouristActivityHandler();
    const activityResult = await activityHandler.processQuery(userMessage, context);
    
    let responseText;
    if (activityResult.type === 'activities_list' && activityResult.activities.length > 0) {
      // Para voz, simplificar respuesta (solo primera actividad)
      const firstActivity = activityResult.activities[0].replace(/\n/g, '. ').replace(/\*/g, '');
      responseText = `Encontré ${activityResult.count} actividad. ${firstActivity}. ¿Te gustaría más información?`;
    } else {
      // Usar Sandra IA normal
      const aiResponse = await orch.processMessage(userMessage, context);
      responseText = aiResponse.text || aiResponse.response || 'Gracias por llamar.';
    }

    console.log(`[TWILIO-VOICE-PROCESS] Respuesta IA: ${responseText}`);

    // Generar audio con Cartesia TTS
    if (orch.services.nucleus && orch.services.nucleus.multimodal) {
      try {
        const audioBuffer = await orch.services.nucleus.multimodal.textToSpeech(responseText, 'sandra');
        
        // Guardar temporalmente el audio
        const tempFile = `/tmp/twilio-response-${callId}.mp3`;
        fs.writeFileSync(tempFile, audioBuffer);

        // Subir a un hosting temporal (o usar Twilio Media Streams)
        // Por ahora, usar <Say> con la respuesta
        twiml.say({ voice: 'Polly.Lupe', language: 'es-ES' }, responseText);
        
        // Limpiar archivo temporal
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      } catch (ttsError) {
        console.warn('[TWILIO-VOICE-PROCESS] Error en TTS, usando Say:', ttsError);
        // Fallback a TTS de Twilio
        twiml.say({ voice: 'Polly.Lupe', language: 'es-ES' }, responseText);
      }
    } else {
      // Fallback: usar TTS de Twilio
      twiml.say({ voice: 'Polly.Lupe', language: 'es-ES' }, responseText);
    }

    // Preguntar si necesita más ayuda
    twiml.say({ voice: 'Polly.Lupe', language: 'es-ES' }, 
      '¿Hay algo más en lo que pueda ayudarte? Presiona 1 para sí, 2 para finalizar.');

    twiml.gather({
      input: 'dtmf',
      timeout: 5,
      numDigits: 1,
      action: '/api/twilio-voice/followup',
      method: 'POST'
    });

    // Si no hay respuesta, finalizar
    twiml.say({ voice: 'Polly.Lupe', language: 'es-ES' }, 
      'Gracias por llamar a Guests Valencia. ¡Que tengas un buen día!');
    twiml.hangup();

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());

  } catch (error) {
    console.error('[TWILIO-VOICE-PROCESS] Error:', error);
    
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Lupe', language: 'es-ES' }, 
      'Lo siento, hubo un error procesando tu consulta. Por favor intenta más tarde.');
    twiml.hangup();

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());
  }
}

