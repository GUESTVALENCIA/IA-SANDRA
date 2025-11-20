const cron = require('node-cron');
const fs = require('fs');
const { globSync } = require('glob');
const nodemailer = require('nodemailer');

const LIMIT = parseFloat(process.env.COST_LIMIT || '5');   // USD
const EMAIL_TO = process.env.ALERT_EMAIL_TO;
const SMTP_URL = process.env.SMTP_URL; // ej: smtp://user:pass@smtp.mailgun.org:587

if (!EMAIL_TO || !SMTP_URL) {
  console.error('[cost-alert] set SMTP_URL y ALERT_EMAIL_TO');
  process.exit(0);
}

const tx = nodemailer.createTransport(SMTP_URL, { tls: { rejectUnauthorized: false } });

async function checkCost() {
  const start = Date.now() - 24 * 3600e3;
  const files = globSync('logs/costs-*.jsonl');
  let sum = 0;

  files.forEach(f => {
    fs.readFileSync(f, 'utf8').trim().split('\n').forEach(l => {
      try {
        const j = JSON.parse(l);
        if (j.ts >= start) sum += j.cost_usd || 0;
      } catch {}
    });
  });

  if (sum > LIMIT) {
    await tx.sendMail({
      from: '"Sandra Cost Alert" <alert@guestsvalencia.es>',
      to: EMAIL_TO,
      subject: `⚠️ Coste alto: $${sum.toFixed(2)} (últimas 24 h)`,
      text: `El gasto acumulado de OpenAI en las últimas 24 horas es $${sum.toFixed(2)} USD.\n\nUmbral: $${LIMIT}\nHora: ${new Date().toLocaleString()}`
    });
    console.log('[cost-alert] correo enviado');
  } else {
    console.log('[cost-alert] coste OK ($' + sum.toFixed(2) + ')');
  }
}

// programa cron: todos los días 06:05
cron.schedule('5 6 * * *', checkCost, { timezone: 'Europe/Madrid' });

console.log('[cost-alert] scheduled 06:05 Europe/Madrid – límite $' + LIMIT);
checkCost(); // ejecuta al arrancar

