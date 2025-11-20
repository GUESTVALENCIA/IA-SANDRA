/**
 * Test para Metrics Exporter
 */

const fetch = require('node-fetch');
const { spawn } = require('child_process');

let p;

beforeAll(() => {
  p = spawn('node', ['services/metrics-exporter/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, METRICS_PORT: '9105' }
  });
  
  // Esperar a que el servidor esté listo
  return new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
});

afterAll(() => {
  if (p) {
    p.kill();
  }
});

test('metrics endpoint returns 200', async () => {
  const r = await fetch('http://localhost:9105/metrics');
  expect(r.status).toBe(200);
  
  const text = await r.text();
  expect(text).toContain('sandra_latency_ms');
  expect(text).toContain('sandra_cost_usd');
});

test('healthz endpoint returns 200', async () => {
  const r = await fetch('http://localhost:9105/healthz');
  expect(r.status).toBe(200);
  
  const data = await r.json();
  expect(data.ok).toBe(true);
  expect(data.ts).toBeDefined();
});

