const express = require('express');
const expressWs = require('express-ws');
const ws = require('ws');
const g711 = require('g711');

const app = express();
expressWs(app);
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.CALL_ROUTER_PORT || 4600;
const VOICE_AGENT_WS = process.env.VOICE_AGENT_WS || 'ws://localhost:4747';
const TWILIO_BACK_URL = process.env.TWILIO_BACK_URL;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

// WebSocket para audio bidireccional
app.ws('/audio', (ws, req) => {
  console.log('[call-router] WebSocket /audio connected');
  
  let voiceAgentWs = null;
  
  // Conectar a voice-agent
  try {
    voiceAgentWs = new ws(VOICE_AGENT_WS);
    
    voiceAgentWs.on('open', () => {
      console.log('[call-router] Connected to voice-agent WS');
    });
    
    voiceAgentWs.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Si recibimos audio del voice-agent, re-codificar a μ-law + base64
        if (message.audio && message.audio.delta) {
          const pcm16Buffer = Buffer.from(message.audio.delta, 'base64');
          // Convertir PCM16 a μ-law
          const mulawBuffer = g711.encode(pcm16Buffer, 'mulaw');
          const mulawBase64 = mulawBuffer.toString('base64');
          
          // Enviar de vuelta al cliente WebSocket
          ws.send(JSON.stringify({
            event: 'media',
            media: {
              payload: mulawBase64
            }
          }));
        }
      } catch (e) {
        console.error('[call-router] Error processing voice-agent message:', e);
      }
    });
    
    voiceAgentWs.on('error', (e) => {
      console.error('[call-router] Voice-agent WS error:', e.message);
    });
    
    voiceAgentWs.on('close', () => {
      console.log('[call-router] Voice-agent WS closed');
    });
  } catch (e) {
    console.error('[call-router] Error connecting to voice-agent:', e);
  }
  
  // Recibir audio del cliente WebSocket y enviar a voice-agent
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.event === 'media' && message.media && message.media.payload) {
        // Decodificar base64 μ-law a PCM16
        const mulawBuffer = Buffer.from(message.media.payload, 'base64');
        const pcm16Buffer = g711.decode(mulawBuffer, 'mulaw');
        
        // Enviar a voice-agent
        if (voiceAgentWs && voiceAgentWs.readyState === ws.OPEN) {
          voiceAgentWs.send(JSON.stringify({
            audio: {
              delta: pcm16Buffer.toString('base64'),
              sampleRate: 16000,
              format: 'pcm16'
            }
          }));
        }
      }
    } catch (e) {
      console.error('[call-router] Error processing client message:', e);
    }
  });
  
  ws.on('close', () => {
    console.log('[call-router] WebSocket /audio closed');
    if (voiceAgentWs) {
      voiceAgentWs.close();
    }
  });
});

app.get('/healthz', (_, res) => res.status(200).json({ ok: true, ts: Date.now() }));

// Endpoint para webhooks de Twilio Media Streams
app.post('/sip/incoming', async (req, res) => {
  console.log('[call-router] Incoming SIP/Twilio webhook:', req.body?.event);
  
  // Validar autenticación si está configurada
  if (TWILIO_AUTH_TOKEN) {
    const authHeader = req.headers['x-twilio-signature'] || req.headers.authorization;
    if (!authHeader || !authHeader.includes(TWILIO_AUTH_TOKEN)) {
      console.warn('[call-router] Unauthorized webhook request');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  
  const event = req.body;
  
  // Si es un evento de media stream con payload
  if (event.event === 'media' && event.media && event.media.payload) {
    try {
      // Decodificar base64 μ-law a PCM16 16kHz
      const mulawBuffer = Buffer.from(event.media.payload, 'base64');
      const pcm16Buffer = g711.decode(mulawBuffer, 'mulaw');
      
      // Enviar a voice-agent vía WebSocket
      // Nota: En producción, esto debería mantener una conexión persistente
      const voiceAgentWs = new ws(VOICE_AGENT_WS);
      
      voiceAgentWs.on('open', () => {
        voiceAgentWs.send(JSON.stringify({
          audio: {
            delta: pcm16Buffer.toString('base64'),
            sampleRate: 16000,
            format: 'pcm16',
            timestamp: event.timestamp
          }
        }));
      });
      
      voiceAgentWs.on('message', (data) => {
        try {
          const response = JSON.parse(data.toString());
          
          // Si recibimos audio del voice-agent, re-codificar a μ-law + base64
          if (response.audio && response.audio.delta) {
            const responsePcm16 = Buffer.from(response.audio.delta, 'base64');
            const responseMulaw = g711.encode(responsePcm16, 'mulaw');
            const responseBase64 = responseMulaw.toString('base64');
            
            // En producción, esto se enviaría de vuelta a Twilio vía /media endpoint
            console.log('[call-router] Audio response ready (would send to Twilio)');
          }
        } catch (e) {
          console.error('[call-router] Error processing voice-agent response:', e);
        }
      });
      
      voiceAgentWs.on('error', (e) => {
        console.error('[call-router] Voice-agent WS error:', e.message);
      });
      
    } catch (e) {
      console.error('[call-router] Error processing media payload:', e);
    }
  }
  
  res.status(200).json({ accepted: true });
});

app.listen(PORT, () => {
  console.log(`[call-router] HTTP on ${PORT}`);
  if (TWILIO_BACK_URL) {
    console.log(`[call-router] Twilio webhook URL: ${TWILIO_BACK_URL}/sip/incoming`);
  }
});

// Optionally open WS now to verify connectivity
try {
  const sock = new ws(VOICE_AGENT_WS);
  sock.on('open', () => {
    console.log('[call-router] Connected to voice-agent WS (test)');
    sock.close();
  });
  sock.on('error', (e) => {
    console.warn('[call-router] WS test error (voice-agent may not be running):', e.message);
  });
} catch (e) {
  // ignore
}
