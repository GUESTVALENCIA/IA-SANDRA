/**
 * Maneja respuestas del usuario durante la llamada (DTMF)
 */
const twilio = require('twilio');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { Digits, From, CallSid } = req.body;
    const twiml = new twilio.twiml.VoiceResponse();

    if (Digits === '1') {
      // Usuario quiere más ayuda
      twiml.say({ voice: 'Polly.Lupe', language: 'es-ES' }, 
        'Perfecto, ¿qué más necesitas?');
      twiml.record({
        maxLength: 30,
        action: '/api/twilio-voice/process',
        method: 'POST'
      });
    } else if (Digits === '2' || Digits === '0') {
      // Usuario quiere finalizar
      twiml.say({ voice: 'Polly.Lupe', language: 'es-ES' }, 
        'Gracias por llamar a Guests Valencia. ¡Que tengas un excelente día!');
      twiml.hangup();
    } else {
      // Dígito no reconocido
      twiml.say({ voice: 'Polly.Lupe', language: 'es-ES' }, 
        'No entendí tu respuesta. Presiona 1 para más ayuda o 2 para finalizar.');
      twiml.gather({
        input: 'dtmf',
        timeout: 5,
        numDigits: 1,
        action: '/api/twilio-voice/followup',
        method: 'POST'
      });
    }

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());
  } catch (error) {
    console.error('[TWILIO-VOICE-FOLLOWUP] Error:', error);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.hangup();
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());
  }
}

