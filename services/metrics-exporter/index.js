const express = require('express');
const client = require('prom-client');
const fs = require('fs');
const { globSync } = require('glob');
const path = require('path');

const app = express();
const PORT = process.env.METRICS_PORT || 9100;

// Gauges
const latencyG = new client.Gauge({ name: 'sandra_latency_ms', help: 'Avg latency' });
const costG = new client.Gauge({ name: 'sandra_cost_usd', help: 'Cost last 24h' });

client.collectDefaultMetrics({ timeout: 5000 });

app.get('/metrics', async (_, res) => {
  // parse last 24h JSONL logs
  const logsDir = path.join(__dirname, '../../logs');
  const files = globSync(path.join(logsDir, 'costs-*.jsonl'));
  
  let sumCost = 0;
  let arrLat = [];
  
  files.forEach(f => {
    try {
      const content = fs.readFileSync(f, 'utf8');
      const lines = content.trim().split('\n').filter(l => l.trim());
      
      lines.forEach(l => {
        try {
          const j = JSON.parse(l);
          const logTime = new Date(j.ts).getTime();
          const now = Date.now();
          
          if (now - logTime < 24 * 3600 * 1000) {
            sumCost += j.cost_usd || 0;
            arrLat.push(j.latency_ms || 0);
          }
        } catch (e) {
          // Ignore invalid JSON lines
        }
      });
    } catch (e) {
      // Ignore file read errors
    }
  });
  
  if (arrLat.length > 0) {
    const avgLatency = arrLat.reduce((a, b) => a + b, 0) / arrLat.length;
    latencyG.set(avgLatency);
  } else {
    latencyG.set(0);
  }
  
  costG.set(parseFloat(sumCost.toFixed(4)));
  
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.get('/healthz', (_, res) => {
  res.status(200).json({ ok: true, ts: Date.now() });
});

app.listen(PORT, () => console.log('[metrics] on', PORT));

