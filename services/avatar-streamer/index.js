const express = require('express');
const ws = require('ws');
const axios = require('axios');

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.AVATAR_STREAM_PORT || 4700;
const VOICE_AGENT_WS = process.env.VOICE_AGENT_WS || 'ws://localhost:4747';
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_STREAM_API_URL = process.env.HEYGEN_STREAM_API_URL || 'https://api.heygen.com/v1/streams';
const HEYGEN_VOICE_ID = process.env.HEYGEN_VOICE_ID || 'a34aec03-0f17-4fff-903f-d9458a8a92a6';

let voiceAgentConnection = null;
let avatarPeer = null;
let audioTrack = null;
let streamSession = null;

// Health check endpoint
app.get('/avatar/healthz', (_, res) => {
  res.status(200).json({
    ok: true,
    ts: Date.now(),
    voiceAgentConnected: voiceAgentConnection?.readyState === ws.OPEN,
    avatarConnected: streamSession !== null
  });
});

// Conectar a voice-agent
function connectToVoiceAgent() {
  try {
    voiceAgentConnection = new ws(VOICE_AGENT_WS);
    
    voiceAgentConnection.on('open', () => {
      console.log('[avatar-streamer] Connected to voice-agent WS');
    });
    
    voiceAgentConnection.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Si recibimos audio del voice-agent, reenviarlo al avatar
        if (message.audio && message.audio.delta) {
          await forwardAudioToAvatar(message.audio.delta);
        }
      } catch (e) {
        console.error('[avatar-streamer] Error processing voice-agent message:', e);
      }
    });
    
    voiceAgentConnection.on('error', (e) => {
      console.error('[avatar-streamer] Voice-agent WS error:', e.message);
    });
    
    voiceAgentConnection.on('close', () => {
      console.log('[avatar-streamer] Voice-agent WS closed, reconnecting...');
      setTimeout(connectToVoiceAgent, 3000);
    });
  } catch (e) {
    console.error('[avatar-streamer] Error connecting to voice-agent:', e);
    setTimeout(connectToVoiceAgent, 3000);
  }
}

// Inicializar conexión WebRTC con HeyGen (stub)
async function initializeAvatarConnection() {
  if (!HEYGEN_API_KEY) {
    console.warn('[avatar-streamer] HeyGen API Key no configurada, usando modo mock');
    streamSession = { mock: true };
    return;
  }
  
  try {
    // POST a HeyGen para crear stream
    const response = await axios.post(
      HEYGEN_STREAM_API_URL,
      {
        voice: HEYGEN_VOICE_ID
      },
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // En producción, aquí se configuraría RTCPeerConnection con el SDP
    streamSession = {
      sessionId: response.data?.session_id || 'mock-session',
      sdp: response.data?.sdp,
      iceServers: response.data?.ice_servers
    };
    
    console.log('[avatar-streamer] Avatar stream session created:', streamSession.sessionId);
    
    // En producción, aquí se configuraría el audio track
    // avatarPeer = new RTCPeerConnection({ iceServers: streamSession.iceServers });
    // audioTrack = ... (configurar track de audio)
    
  } catch (e) {
    console.error('[avatar-streamer] Error initializing avatar connection:', e.message);
    // Usar modo mock si falla
    streamSession = { mock: true };
  }
}

// Reenviar audio al avatar
async function forwardAudioToAvatar(audioDelta) {
  if (!streamSession) {
    console.warn('[avatar-streamer] No avatar session, skipping audio');
    return;
  }
  
  try {
    // Decodificar base64 a buffer
    const audioBuffer = Buffer.from(audioDelta, 'base64');
    
    if (streamSession.mock) {
      // Modo mock: solo imprimir
      console.log(`📡 audio chunk ${audioBuffer.length} B`);
    } else {
      // En producción, aquí se enviaría el audio al track WebRTC
      // if (audioTrack && audioTrack.readyState === 'live') {
      //   audioTrack.enqueue(audioBuffer);
      // }
      console.log(`📡 audio chunk ${audioBuffer.length} B → avatar`);
    }
  } catch (e) {
    console.error('[avatar-streamer] Error forwarding audio:', e);
  }
}

// Inicializar
async function start() {
  console.log(`[avatar-streamer] Starting on port ${PORT}`);
  
  // Conectar a voice-agent
  connectToVoiceAgent();
  
  // Inicializar avatar (con retry si falla)
  await initializeAvatarConnection();
  
  app.listen(PORT, () => {
    console.log(`[avatar-streamer] HTTP server on ${PORT}`);
    console.log(`[avatar-streamer] Health check: http://localhost:${PORT}/avatar/healthz`);
  });
}

// Manejar cierre limpio
process.on('SIGINT', () => {
  console.log('[avatar-streamer] Shutting down...');
  if (voiceAgentConnection) {
    voiceAgentConnection.close();
  }
  if (avatarPeer) {
    avatarPeer.close();
  }
  process.exit(0);
});

// Iniciar
start().catch(console.error);

