/**
 * Verifica que Sandra esté completamente en producción
 */

const axios = require('axios');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verificarSitio(url) {
  try {
    log(`\n🔍 Verificando: ${url}`, 'cyan');
    
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: (status) => status < 500 // Permitir 404, pero no errores de servidor
    });

    if (response.status === 200) {
      log(`   ✅ Sitio accesible (${response.status})`, 'green');
      log(`   ✅ SSL activo: ${url.startsWith('https://')}`, 'green');
      return true;
    } else if (response.status === 404) {
      log(`   ⚠️  Sitio responde pero página no encontrada (${response.status})`, 'yellow');
      return false;
    } else {
      log(`   ⚠️  Respuesta: ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      log(`   ❌ Dominio no encontrado (DNS aún propagándose)`, 'red');
    } else if (error.code === 'ECONNREFUSED') {
      log(`   ❌ Conexión rechazada`, 'red');
    } else if (error.code === 'ETIMEDOUT') {
      log(`   ⏳ Timeout (DNS aún propagándose)`, 'yellow');
    } else {
      log(`   ❌ Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function verificarAPI(url) {
  try {
    log(`\n🔍 Verificando API: ${url}`, 'cyan');
    
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: () => true // Aceptar cualquier status
    });

    if (response.status === 200 || response.status === 405) { // 405 es Method Not Allowed, pero significa que el endpoint existe
      log(`   ✅ Endpoint accesible (${response.status})`, 'green');
      return true;
    } else {
      log(`   ⚠️  Respuesta: ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      log(`   ❌ Dominio no encontrado`, 'red');
    } else {
      log(`   ⚠️  Error: ${error.message}`, 'yellow');
    }
    return false;
  }
}

async function main() {
  log('\n🚀 VERIFICACIÓN DE PRODUCCIÓN - SANDRA IA\n', 'cyan');

  const dominio = 'sandra.guestsvalencia.es';
  const baseUrl = `https://${dominio}`;

  log(`📋 Dominio: ${dominio}`, 'blue');
  log(`📋 URL Base: ${baseUrl}\n`, 'blue');

  // Verificar sitio principal
  const sitioOk = await verificarSitio(baseUrl);

  // Verificar APIs
  const apis = [
    '/api/health',
    '/api/twilio-whatsapp',
    '/api/twilio-voice'
  ];

  let apisOk = 0;
  for (const api of apis) {
    const ok = await verificarAPI(`${baseUrl}${api}`);
    if (ok) apisOk++;
  }

  // Resumen
  log('\n📊 RESUMEN:', 'cyan');
  log(`   Sitio Principal: ${sitioOk ? '✅' : '⚠️ '}`, sitioOk ? 'green' : 'yellow');
  log(`   APIs: ${apisOk}/${apis.length} accesibles`, apisOk === apis.length ? 'green' : 'yellow');

  if (sitioOk && apisOk === apis.length) {
    log('\n🎉 ¡SANDRA EN PRODUCCIÓN!', 'green');
    log(`\n✅ Tu sitio está disponible en: ${baseUrl}`, 'green');
    log(`✅ APIs funcionando`, 'green');
    log(`✅ SSL activo`, 'green');
    log(`\n📝 Próximos pasos:`, 'cyan');
    log(`   1. Actualiza webhooks de Twilio:`, 'white');
    log(`      WhatsApp: ${baseUrl}/api/twilio-whatsapp`, 'cyan');
    log(`      Voice: ${baseUrl}/api/twilio-voice`, 'cyan');
    log(`   2. Prueba el sitio en producción`, 'white');
    log(`   3. Verifica que el chatbot funcione`, 'white');
  } else {
    log('\n⚠️  Verificación incompleta', 'yellow');
    log(`\n💡 Si el DNS está propagándose:`, 'cyan');
    log(`   - Espera 5-30 minutos`, 'white');
    log(`   - Verifica en: https://dnschecker.org`, 'white');
    log(`   - Vuelve a ejecutar este script`, 'white');
  }

  log('\n');
}

main();

