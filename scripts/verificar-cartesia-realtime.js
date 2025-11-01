/**
 * Verifica conexión en tiempo real con Cartesia TTS
 */

const axios = require('axios');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verificarCartesia() {
  log('\n🎙️ VERIFICANDO CONEXIÓN EN TIEMPO REAL CON CARTESIA\n', 'cyan');

  const apiKey = process.env.CARTESIA_API_KEY || 'sk_car_67c5Tg8LMpR9G6unHvsvnw';
  const testText = 'Hola, esta es una prueba de conexión en tiempo real con Cartesia.';

  log(`📋 API Key: ${apiKey.substring(0, 10)}...`, 'cyan');
  log(`📋 Texto de prueba: "${testText}"\n`, 'cyan');

  try {
    log('🔄 Intentando conexión con Cartesia...', 'yellow');

    const startTime = Date.now();

    const response = await axios.post(
      'https://api.cartesia.com/tts/v1/generate',
      {
        text: testText,
        model_id: 'sonic-english',
        voice_id: 'sonic-english',
        output_format: 'mp3',
        sample_rate: 22050
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );

    const endTime = Date.now();
    const latency = endTime - startTime;
    const audioSize = response.data.byteLength;

    log(`\n✅ Conexión exitosa!`, 'green');
    log(`   Latencia: ${latency}ms`, 'green');
    log(`   Tamaño del audio: ${(audioSize / 1024).toFixed(2)} KB`, 'green');
    log(`   Status: ${response.status}`, 'green');
    log(`   Content-Type: ${response.headers['content-type'] || 'audio/mpeg'}`, 'green');

    if (latency < 2000) {
      log(`\n🚀 Excelente latencia! (< 2 segundos)`, 'green');
    } else if (latency < 5000) {
      log(`\n⚠️  Latencia aceptable (< 5 segundos)`, 'yellow');
    } else {
      log(`\n❌ Latencia alta (> 5 segundos)`, 'red');
    }

    return {
      success: true,
      latency,
      audioSize,
      status: response.status
    };

  } catch (error) {
    log(`\n❌ Error en la conexión:`, 'red');
    
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Error: ${JSON.stringify(error.response.data)}`, 'red');
    } else if (error.request) {
      log(`   Error: Sin respuesta del servidor`, 'red');
      log(`   Timeout o problema de red`, 'yellow');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }

    return {
      success: false,
      error: error.message
    };
  }
}

async function verificarEndpoint() {
  log('\n🌐 VERIFICANDO ENDPOINT /api/cartesia-tts\n', 'cyan');

  const baseUrl = process.env.BASE_URL || 'https://sandra.guestsvalencia.es';
  const endpoint = `${baseUrl}/api/cartesia-tts`;

  try {
    log(`📋 Endpoint: ${endpoint}`, 'cyan');

    const startTime = Date.now();

    const response = await axios.post(
      endpoint,
      {
        text: 'Prueba de endpoint en tiempo real',
        voice: 'sandra',
        format: 'mp3'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );

    const endTime = Date.now();
    const latency = endTime - startTime;

    log(`\n✅ Endpoint funcionando!`, 'green');
    log(`   Latencia: ${latency}ms`, 'green');
    log(`   Status: ${response.status}`, 'green');

    return {
      success: true,
      latency
    };

  } catch (error) {
    log(`\n❌ Error en endpoint:`, 'red');
    log(`   ${error.message}`, 'red');

    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  // Verificar conexión directa
  const directResult = await verificarCartesia();

  // Verificar endpoint
  const endpointResult = await verificarEndpoint();

  // Resumen
  log('\n📊 RESUMEN:', 'cyan');
  log(`   Conexión directa: ${directResult.success ? '✅' : '❌'}`, directResult.success ? 'green' : 'red');
  if (directResult.success) {
    log(`   Latencia: ${directResult.latency}ms`, 'cyan');
  }
  log(`   Endpoint API: ${endpointResult.success ? '✅' : '❌'}`, endpointResult.success ? 'green' : 'red');
  if (endpointResult.success) {
    log(`   Latencia: ${endpointResult.latency}ms`, 'cyan');
  }

  if (directResult.success && endpointResult.success) {
    log('\n🎉 ¡Cartesia está funcionando en tiempo real!', 'green');
  } else {
    log('\n⚠️  Hay problemas con la conexión', 'yellow');
  }

  log('\n');
}

main();

