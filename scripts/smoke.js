// scripts/smoke.js
const http = require('http');
const { spawn } = require('child_process');

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function ping(url, tries = 10) {
  for (let i = 0; i < tries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, res => {
          res.resume();
          res.statusCode && res.statusCode < 500 ? resolve() : reject(new Error('Bad status ' + res.statusCode));
        });
        req.on('error', reject);
      });
      return true;
    } catch { await wait(500); }
  }
  return false;
}

(async () => {
  const srv = spawn('node', ['backend/server.js'], { env: process.env, stdio: 'inherit' });

  const ok = await ping('http://127.0.0.1:' + (process.env.PORT || 3000), 20);
  srv.kill('SIGINT');

  if (!ok) {
    console.error('[SMOKE] No respondió el servidor');
    process.exit(1);
  } else {
    console.log('[SMOKE] OK');
  }
})();
