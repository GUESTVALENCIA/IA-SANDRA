#!/usr/bin/env node
// Prueba rápida: importa DeepgramService y llama a connectLive()
const path = require('path');
const fs = require('fs');

// Intentar cargar DEEPGRAM_API_KEY desde .env.pro en C:\Sandra-IA-8.0-Pro\.env.pro si existe
try {
  const altEnv = 'C:\\Sandra-IA-8.0-Pro\\.env.pro';
  if (fs.existsSync(altEnv)) {
    const content = fs.readFileSync(altEnv, 'utf8');
    const lines = content.split(/\\r?\\n/);
    for (const l of lines) {
      if (l && l.indexOf('DEEPGRAM_API_KEY') >= 0) {
        const idx = l.indexOf('=');
        if (idx >= 0) {
          process.env.DEEPGRAM_API_KEY = l.substring(idx+1).trim().replace(/^['\\"]|['\\"]$/g,'');
          console.log('Loaded DEEPGRAM_API_KEY from', altEnv);
          break;
        }
      }
    }
  }
} catch (e) {}

// Requerir el servicio después de haber cargado posibles variables de entorno
console.log('DEBUG: DEEPGRAM_API_KEY=', !!process.env.DEEPGRAM_API_KEY);
try { console.log('DEBUG: .env.pro exists?', fs.existsSync('C:\\\\Sandra-IA-8.0-Pro\\\\.env.pro')); } catch(e){}
const DeepgramService = require(path.join(__dirname, '..', 'services', 'deepgram-service.js'));

(async () => {
  try {
    console.log('Test: instanciando DeepgramService...');
    const svc = new DeepgramService();
    console.log('Test: llamando connectLive({autoReconnect:false})...');
    const res = await svc.connectLive({ autoReconnect: false });
    console.log('Result:', res);
    // si devuelve objeto, intenta detener
    try {
      svc.stopLiveTranscription();
      console.log('stopLiveTranscription() llamado sin excepción');
    } catch (e) {
      console.warn('stopLiveTranscription fallo:', e && e.message);
    }
    process.exit(0);
  } catch (err) {
    console.error('EXCEPTION:', err && (err.stack || err.message || err));
    process.exit(2);
  }
})();


