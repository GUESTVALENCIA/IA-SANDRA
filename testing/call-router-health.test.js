/**
 * Test de health-check para Call-Router
 */

const { spawn } = require('child_process');
const fetch = require('node-fetch');

let proc;

beforeAll(() => {
  proc = spawn('node', ['services/call-router/index.js'], {
    env: { ...process.env, CALL_ROUTER_PORT: '5600' },
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

test('health endpoint', async () => {
  const res = await fetch('http://localhost:5600/healthz');
  expect(res.status).toBe(200);
  
  const data = await res.json();
  expect(data.ok).toBe(true);
  expect(data.ts).toBeDefined();
});

