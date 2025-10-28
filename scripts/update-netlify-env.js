/**
 * Script para actualizar environment variables en Netlify
 * Usando Netlify API directamente
 */

const https = require('https');

const NETLIFY_TOKEN = 'nfp_BguXWY1a87dAj2hLJvB2wy5ndvvkkCkm0b60';
const SITE_ID = 'grand-pasca-a584d5';

// Las 6 API keys críticas
const envVars = {
  'ANTHROPIC_API_KEY': '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',
  'OPENAI_API_KEY': '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',
  'GROQ_API_KEY': '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',
  'CARTESIA_API_KEY': 'sk_car_67c5Tg8LMpR9G6unHvsvnw',
  'CARTESIA_VOICE_ID': 'a34aec03-0f17-4fff-903f-d9458a8a92a6',
  'DEEPGRAM_API_KEY': '30e9dbaec29dcde1b23a8bd9de31438c74f23522'
};

async function updateEnvVar(key, value) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify([{
      key: key,
      scopes: ['builds', 'functions', 'runtime', 'post_processing'],
      values: [{
        context: 'all',
        value: value
      }]
    }]);

    const options = {
      hostname: 'api.netlify.com',
      port: 443,
      path: `/api/v1/accounts/claytomsystems/env`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${NETLIFY_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, key });
        } else {
          reject({ success: false, key, error: body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 Actualizando API Keys en Netlify...\n');

  for (const [key, value] of Object.entries(envVars)) {
    try {
      await updateEnvVar(key, value);
      console.log(`✅ ${key} actualizada`);
    } catch (error) {
      console.error(`❌ Error con ${key}:`, error.error || error.message);
    }
  }

  console.log('\n✅ Proceso completado');
}

main().catch(console.error);
