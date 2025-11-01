/**
 * Twilio WhatsApp Webhook Handler
 * Integrado con Sandra IA para chatbot turístico
 */

const twilio = require('twilio');

// Inicializar orchestrator (singleton)
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
 * Webhook para recibir mensajes de WhatsApp desde Twilio
 */
export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validar firma de Twilio (seguridad)
    const twilioSignature = req.headers['x-twilio-signature'];
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    
    // Verificar que las variables estén configuradas
    if (!twilioAuthToken || !twilioAccountSid) {
      console.error('[TWILIO-WHATSAPP] Variables Twilio no configuradas');
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message('Disculpa, el servicio está temporalmente no disponible. Por favor intenta más tarde.');
      res.setHeader('Content-Type', 'text/xml');
      return res.status(200).send(twiml.toString());
    }
    
    const url = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}${req.url}`;
    
    // Si hay token, validar firma (recomendado en producción)
    if (twilioAuthToken && twilioSignature) {
      try {
        const isValid = twilio.validateRequest(
          twilioAuthToken,
          twilioSignature,
          url,
          req.body
        );
        
        if (!isValid) {
          console.warn('[TWILIO-WHATSAPP] Invalid signature');
          // En desarrollo, permitir continuar pero loguear
          if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Invalid Twilio signature' });
          }
        }
      } catch (sigError) {
        console.warn('[TWILIO-WHATSAPP] Signature validation error:', sigError.message);
      }
    }

    // Obtener datos del mensaje
    const {
      From: from,           // Número de WhatsApp del usuario
      To: to,               // Tu número de Twilio
      Body: message,         // Mensaje del usuario
      MessageSid: messageId // ID único del mensaje
    } = req.body;

    console.log(`[TWILIO-WHATSAPP] Mensaje recibido de ${from}: ${message}`);

    // Obtener orchestrator
    const orch = await getOrchestrator();

    // Procesar mensaje con Sandra IA
    const context = {
      platform: 'whatsapp',
      userId: from,
      conversationId: `whatsapp-${from}`,
      touristActivity: true, // Contexto: actividades turísticas
      language: 'es' // Por defecto español
    };

    // Verificar si es consulta sobre actividades turísticas
    const { TouristActivityHandler } = require('../orchestrator/tourist-activity-handler');
    const activityHandler = new TouristActivityHandler();
    
    // Intentar procesar con handler especializado
    let whatsappResponse;
    const activityResult = await activityHandler.processQuery(message, context);
    
    if (activityResult.type === 'activities_list' && activityResult.activities.length > 0) {
      // Si hay resultados de actividades, formatear respuesta
      whatsappResponse = `🏛️ *Actividades Turísticas en Valencia*\n\n` +
              `Encontré ${activityResult.count} actividad(es):\n\n` +
              activityResult.activities.join('\n\n---\n\n') +
              '\n\n💬 ¿Te gustaría más información sobre alguna de estas?';
    } else if (activityResult.type === 'categories') {
      whatsappResponse = activityResult.message + 
              '\n\n💡 ¿Qué categoría te interesa más?';
    } else if (activityResult.type === 'free_activities') {
      whatsappResponse = `💰 ${activityResult.message}:\n\n` +
              activityResult.activities.join('\n\n---\n\n');
    } else {
      // Usar Sandra IA normal para otras consultas
      const response = await orch.processMessage(message, context);
      whatsappResponse = response.text || response.response || 'Lo siento, no pude procesar tu mensaje.';
    }
    
    // Limitar longitud (WhatsApp tiene límite de 4096 caracteres)
    if (whatsappResponse.length > 4000) {
      whatsappResponse = whatsappResponse.substring(0, 4000) + '...';
    }

    // Responder con TwiML (formato XML de Twilio)
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(whatsappResponse);

    console.log(`[TWILIO-WHATSAPP] Respuesta enviada a ${from}`);

    // Enviar respuesta
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());

  } catch (error) {
    console.error('[TWILIO-WHATSAPP] Error:', error);
    
    // Responder con mensaje de error amigable
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('Disculpa, estoy experimentando dificultades técnicas. Por favor intenta de nuevo en unos momentos.');

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());
  }
}

