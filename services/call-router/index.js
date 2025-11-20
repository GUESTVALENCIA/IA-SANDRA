const express = require('express');
const ws = require('ws');

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.CALL_ROUTER_PORT || 4600;
const VOICE_AGENT_WS = process.env.VOICE_AGENT_WS || 'ws://localhost:4747';

app.get('/healthz', (_, res) => res.status(200).json({ ok: true, ts: Date.now() }));

// Stub endpoint – recibiría notificaciones SIP/Twilio en el futuro
app.post('/sip/incoming', async (req, res) => {
  console.log('[call-router] Incoming SIP (stub):', req.body?.from);
  res.status(202).json({ accepted: true });
  
  // TODO: en el futuro abrir WS a VOICE_AGENT_WS y pipe audio
});

app.listen(PORT, () => console.log(`[call-router] HTTP on ${PORT}`));

// Optionally open WS now to verify connectivity
try {
  const sock = new ws(VOICE_AGENT_WS);
  sock.on('open', () => {
    console.log('[call-router] Connected to voice-agent WS');
    sock.close();
  });
  sock.on('error', (e) => console.error('[call-router] WS error', e.message));
} catch (e) {
  // ignore
}

