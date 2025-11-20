/**
 * Test de health-check para Avatar Streamer
 */

const { spawn } = require('child_process');
const fetch = require('node-fetch');

let proc;

beforeAll(() => {
  // Iniciar avatar-streamer en puerto 5700
  proc = spawn('node', ['services/avatar-streamer/index.js'], {
    env: {
      ...process.env,
      AVATAR_STREAM_PORT: '5700',
      VOICE_AGENT_WS: 'ws://localhost:4747'
    },
    stdio: 'inherit'
  });
  
  // Esperar a que el servidor esté listo
  return new Promise((resolve) => {
    setTimeout(resolve, 2000); // Esperar 2 segundos para que el servidor inicie
  });
});

afterAll(() => {
  if (proc) {
    proc.kill();
  }
});

test('health endpoint returns 200', async () => {
  const res = await fetch('http://localhost:5700/avatar/healthz');
  expect(res.status).toBe(200);
  
  const data = await res.json();
  expect(data.ok).toBe(true);
  expect(data.ts).toBeDefined();
  expect(typeof data.voiceAgentConnected).toBe('boolean');
  expect(typeof data.avatarConnected).toBe('boolean');
});

test('health endpoint includes connection status', async () => {
  const res = await fetch('http://localhost:5700/avatar/healthz');
  const data = await res.json();
  
  // Verificar que incluye información de conexión
  expect(data).toHaveProperty('voiceAgentConnected');
  expect(data).toHaveProperty('avatarConnected');
});

