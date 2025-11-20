const { Client } = require('pg');
const fs = require('fs');
const { globSync } = require('glob');
const path = require('path');

const CONN = process.env.NEON_DATABASE_URL;

if (!CONN) {
  console.error('[log-ingestor] NEON_DATABASE_URL missing');
  process.exit(0);
}

const OFFSET_FILE = path.join(__dirname, '.offset');
let offset = fs.existsSync(OFFSET_FILE) ? parseInt(fs.readFileSync(OFFSET_FILE, 'utf8')) : 0;

(async () => {
  const client = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS cost_logs (
      ts BIGINT PRIMARY KEY,
      session_id TEXT,
      model TEXT,
      latency INT,
      tokens_in INT,
      tokens_out INT,
      cost FLOAT
    );
  `);

  const files = globSync('logs/costs-*.jsonl').sort();
  let count = 0;

  for (const f of files) {
    const lines = fs.readFileSync(f, 'utf8').trim().split('\n');
    for (const line of lines) {
      if (offset-- > 0) continue;

      const j = JSON.parse(line);
      await client.query(
        'INSERT INTO cost_logs VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING',
        [j.ts, j.sessionId || '', j.model || '', j.latency_ms || 0, j.tokens_in || 0, j.tokens_out || 0, j.cost_usd || 0]
      );
      count++;
    }
  }

  console.log('[log-ingestor] inserted', count, 'rows');
  fs.writeFileSync(OFFSET_FILE, String(linesTotal(files)));

  await client.end();
  process.exit(0);
})();

function linesTotal(fls) {
  return fls.reduce((n, f) => n + fs.readFileSync(f, 'utf8').trim().split('\n').length, 0);
}
