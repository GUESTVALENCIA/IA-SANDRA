/**
 * Verifica conexión en tiempo real con OpenAI API
 * Motor principal de Sandra IA
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

async function verificarOpenAI() {
  log('\n🤖 VERIFICANDO CONEXIÓN EN TIEMPO REAL CON OPENAI\n', 'cyan');

  const apiKey = process.env.OPENAI_API_KEY || 
    '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';

  if (!apiKey || apiKey.trim() === '') {
    log('❌ OPENAI_API_KEY no configurada', 'red');
    return { success: false, error: 'API Key no configurada' };
  }

  log(`📋 API Key: ${apiKey.substring(0, 20)}...`, 'cyan');
  log(`📋 Modelo: gpt-4o\n`, 'cyan');

  const testMessage = 'Hola, responde solo con "OK" si me escuchas.';
  
  log('🔄 Enviando mensaje de prueba a OpenAI...', 'yellow');

  try {
    const startTime = Date.now();

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: testMessage
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos
      }
    );

    const endTime = Date.now();
    const latency = endTime - startTime;

    const responseText = response.data?.choices?.[0]?.message?.content?.trim() || '';
    const model = response.data?.model || 'unknown';
    const tokens = response.data?.usage || {};

    log(`\n✅ Conexión exitosa!`, 'green');
    log(`   Latencia: ${latency}ms`, 'green');
    log(`   Modelo usado: ${model}`, 'green');
    log(`   Respuesta: "${responseText}"`, 'green');
    log(`   Tokens usados: ${JSON.stringify(tokens)}`, 'green');
    log(`   Status: ${response.status}`, 'green');

    if (latency < 2000) {
      log(`\n🚀 Excelente latencia! (< 2 segundos)`, 'green');
    } else if (latency < 5000) {
      log(`\n⚠️  Latencia aceptable (< 5 segundos)`, 'yellow');
    } else {
      log(`\n❌ Latencia alta (> 5 segundos)`, 'red');
    }

    // Validar que la respuesta sea real
    if (!responseText || responseText.length === 0) {
      log(`\n⚠️  Respuesta vacía recibida`, 'yellow');
      return { success: false, error: 'Respuesta vacía' };
    }

    return {
      success: true,
      latency,
      responseText,
      model,
      tokens
    };

  } catch (error) {
    log(`\n❌ Error en la conexión:`, 'red');
    
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Error: ${JSON.stringify(error.response.data)}`, 'red');
      
      if (error.response.status === 401) {
        log(`   ⚠️  API Key inválida o expirada`, 'yellow');
      } else if (error.response.status === 429) {
        log(`   ⚠️  Límite de rate limit alcanzado`, 'yellow');
      } else if (error.response.status === 500) {
        log(`   ⚠️  Error del servidor de OpenAI`, 'yellow');
      }
    } else if (error.request) {
      log(`   Error: Sin respuesta del servidor`, 'red');
      log(`   Timeout o problema de red`, 'yellow');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }

    return {
      success: false,
      error: error.message,
      status: error.response?.status
    };
  }
}

async function verificarEndpoint() {
  log('\n🌐 VERIFICANDO ENDPOINT /api/chat\n', 'cyan');

  const baseUrl = process.env.BASE_URL || 'https://sandra.guestsvalencia.es';
  const endpoint = `${baseUrl}/api/chat`;

  try {
    log(`📋 Endpoint: ${endpoint}`, 'cyan');

    const startTime = Date.now();

    const response = await axios.post(
      endpoint,
      {
        message: 'Prueba de conexión',
        conversationId: 'test-' + Date.now()
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const endTime = Date.now();
    const latency = endTime - startTime;

    log(`\n✅ Endpoint funcionando!`, 'green');
    log(`   Latencia: ${latency}ms`, 'green');
    log(`   Status: ${response.status}`, 'green');
    
    if (response.data) {
      log(`   Respuesta recibida: ${JSON.stringify(response.data).substring(0, 100)}...`, 'cyan');
    }

    return {
      success: true,
      latency
    };

  } catch (error) {
    log(`\n❌ Error en endpoint:`, 'red');
    log(`   ${error.message}`, 'red');
    
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data)}`, 'red');
    }

    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  // Verificar conexión directa con OpenAI
  const openaiResult = await verificarOpenAI();

  // Verificar endpoint de chat
  const endpointResult = await verificarEndpoint();

  // Resumen
  log('\n📊 RESUMEN:', 'cyan');
  log(`   OpenAI API: ${openaiResult.success ? '✅' : '❌'}`, openaiResult.success ? 'green' : 'red');
  if (openaiResult.success) {
    log(`   Latencia: ${openaiResult.latency}ms`, 'cyan');
    log(`   Modelo: ${openaiResult.model}`, 'cyan');
  } else {
    log(`   Error: ${openaiResult.error}`, 'red');
  }
  
  log(`   Endpoint /api/chat: ${endpointResult.success ? '✅' : '❌'}`, endpointResult.success ? 'green' : 'red');
  if (endpointResult.success) {
    log(`   Latencia: ${endpointResult.latency}ms`, 'cyan');
  }

  if (openaiResult.success && endpointResult.success) {
    log('\n🎉 ¡OpenAI está funcionando en tiempo real!', 'green');
    log('   Motor de Sandra IA operativo', 'green');
  } else {
    log('\n⚠️  Hay problemas con la conexión', 'yellow');
    if (!openaiResult.success) {
      log('   ⚠️  Verifica la API key de OpenAI', 'yellow');
      log('   ⚠️  Verifica que no haya rate limits', 'yellow');
    }
  }

  log('\n');
}

main();

