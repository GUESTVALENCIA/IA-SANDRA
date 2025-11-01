/**
 * Twilio Voice Webhook Handler
 * Maneja llamadas telefónicas con IA (STT → GPT-4o → TTS)
 */

const { SandraOrchestrator } = require('../orchestrator/sandra-orchestrator');
const twilio = require('twilio');

let orchestrator = null;

async function getOrchestrator() {
  if (!orchestrator) {
    orchestrator = new SandraOrchestrator();
    await orchestrator.initialize();
  }
  return orchestrator;
}

/**
 * Webhook para llamadas entrantes
 * Formato: Vercel Serverless Function
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
    const { From: callerNumber, To: calledNumber, CallSid: callId } = req.body;
    
    console.log(`[TWILIO-VOICE] Llamada recibida de ${callerNumber}`);

    // Obtener orchestrator
    const orch = await getOrchestrator();

    // Crear TwiML para la llamada
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Mensaje de bienvenida (usar TTS de Sandra)
    const welcomeMessage = 'Hola, bienvenido a Guests Valencia. Soy Sandra, tu asistente virtual. ¿En qué puedo ayudarte?';
    
      // Mensaje de bienvenida con TTS de Twilio
      twiml.say({ voice: 'Polly.Lupe', language: 'es-ES' }, welcomeMessage);
      
      // Grabar lo que dice el usuario (max 30 segundos)
      twiml.record({
        maxLength: 30,
        action: '/api/twilio-voice-process',
        method: 'POST',
        finishOnKey: '#',
        transcribe: true, // Transcribir automáticamente con Twilio (fallback)
        transcribeCallback: '/api/twilio-voice-process'
      });

      // Si el usuario presiona # antes, procesar directamente
      twiml.gather({
        input: 'dtmf',
        timeout: 30,
        finishOnKey: '#',
        action: '/api/twilio-voice-process',
        method: 'POST'
      });

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());

  } catch (error) {
    console.error('[TWILIO-VOICE] Error:', error);
    
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Lupe', language: 'es-ES' }, 
      'Lo siento, estamos experimentando dificultades técnicas. Por favor intenta más tarde.');

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());
  }
}

