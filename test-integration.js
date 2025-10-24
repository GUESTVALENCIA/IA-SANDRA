// ═══════════════════════════════════════════════════════
// SANDRA PROFESSIONAL - TEST DE INTEGRACIÓN COMPLETO
// Verificación de todas las SDKs y APIs reales
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     🧪 SANDRA PROFESSIONAL - TEST DE SISTEMA         ║
║                                                       ║
║     Verificando todas las integraciones SDK          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`);

// ══════════════════════════════════════════════════════
// FUNCIONES DE TESTING
// ══════════════════════════════════════════════════════

async function testEndpoint(name, method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 30000
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    if (response.data.success || response.status === 200) {
      console.log(`${colors.green}✅ ${name}${colors.reset}`);
      return { success: true, data: response.data };
    } else {
      console.log(`${colors.yellow}⚠️  ${name} - Respuesta inesperada${colors.reset}`);
      return { success: false, error: 'Respuesta inesperada' };
    }
  } catch (error) {
    console.log(`${colors.red}❌ ${name} - ${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

// ══════════════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════════════

async function runTests() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  };

  console.log(`\n${colors.cyan}═══ VERIFICACIÓN DE CONFIGURACIÓN ═══${colors.reset}\n`);

  // Verificar variables de entorno críticas
  const criticalVars = {
    'Anthropic API': process.env.ANTHROPIC_API_KEY,
    'OpenAI API': process.env.OPENAI_API_KEY,
    'Groq API': process.env.GROQ_API_KEY,
    'HeyGen API': process.env.HEYGEN_API_KEY,
    'ElevenLabs API': process.env.ELEVENLABS_API_KEY,
    'Cartesia API': process.env.CARTESIA_API_KEY,
    'Deepgram API': process.env.DEEPGRAM_API_KEY
  };

  for (const [name, value] of Object.entries(criticalVars)) {
    if (value) {
      console.log(`${colors.green}✅ ${name} configurada${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ ${name} NO configurada${colors.reset}`);
      results.warnings++;
    }
  }

  console.log(`\n${colors.cyan}═══ 1. HEALTH CHECK ═══${colors.reset}\n`);
  results.total++;
  const health = await testEndpoint('Health Check', 'get', '/health');
  if (health.success) {
    results.passed++;
    console.log(`\n📊 Estado de servicios:`);
    console.log(JSON.stringify(health.data.services, null, 2));
  } else {
    results.failed++;
  }

  console.log(`\n${colors.cyan}═══ 2. SERVICIOS DE IA ═══${colors.reset}\n`);
  
  // Test Claude
  results.total++;
  const claude = await testEndpoint(
    'Claude Sonnet 4.5',
    'post',
    '/api/claude',
    {
      message: 'Hola Sandra, preséntate brevemente',
      context: [],
      mode: 'professional'
    }
  );
  if (claude.success) {
    results.passed++;
    console.log(`   Respuesta: ${claude.data.response.substring(0, 100)}...`);
  } else {
    results.failed++;
  }

  // Test GPT-4o
  results.total++;
  const gpt = await testEndpoint(
    'GPT-4o',
    'post',
    '/api/gpt',
    {
      message: 'Hola, preséntate como Sandra',
      context: []
    }
  );
  if (gpt.success) {
    results.passed++;
    console.log(`   Respuesta: ${gpt.data.response.substring(0, 100)}...`);
  } else {
    results.failed++;
  }

  // Test Groq
  results.total++;
  const groq = await testEndpoint(
    'Groq (Llama)',
    'post',
    '/api/groq',
    {
      message: 'Di "Test exitoso" en español',
      context: []
    }
  );
  if (groq.success) {
    results.passed++;
    console.log(`   Respuesta: ${groq.data.response.substring(0, 100)}...`);
  } else {
    results.failed++;
  }

  console.log(`\n${colors.cyan}═══ 3. SERVICIOS DE VOZ ═══${colors.reset}\n`);

  // Test ElevenLabs TTS
  results.total++;
  const elevenlabs = await testEndpoint(
    'ElevenLabs TTS',
    'post',
    '/api/voice/elevenlabs/speak',
    {
      text: 'Hola, soy Sandra de GuestsValencia',
      voiceId: process.env.ELEVENLABS_VOICE_ID
    }
  );
  if (elevenlabs.success) {
    results.passed++;
    console.log(`   Audio generado correctamente`);
  } else {
    results.failed++;
  }

  // Test Cartesia TTS
  results.total++;
  const cartesia = await testEndpoint(
    'Cartesia TTS',
    'post',
    '/api/voice/cartesia/speak',
    {
      text: 'Test de voz Cartesia'
    }
  );
  if (cartesia.success) {
    results.passed++;
    console.log(`   Audio generado correctamente`);
  } else {
    results.failed++;
  }

  // Test HeyGen
  results.total++;
  const heygen = await testEndpoint(
    'HeyGen Video',
    'post',
    '/api/voice/heygen/generate',
    {
      text: 'Hola, soy Sandra',
      avatarId: process.env.HEYGEN_AVATAR_ID
    }
  );
  if (heygen.success) {
    results.passed++;
    console.log(`   Video ID: ${heygen.data.video_id}`);
  } else {
    results.failed++;
  }

  console.log(`\n${colors.cyan}═══ 4. RESUMEN DE PRUEBAS ═══${colors.reset}\n`);
  
  console.log(`Total de pruebas: ${results.total}`);
  console.log(`${colors.green}✅ Exitosas: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Fallidas: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Advertencias: ${results.warnings}${colors.reset}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\n📈 Tasa de éxito: ${successRate}%`);

  if (successRate >= 80) {
    console.log(`\n${colors.green}🎉 Sistema operacional y listo para producción${colors.reset}\n`);
  } else if (successRate >= 50) {
    console.log(`\n${colors.yellow}⚠️  Sistema parcialmente operacional - revisar configuración${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}❌ Sistema requiere configuración adicional${colors.reset}\n`);
  }
}

// ══════════════════════════════════════════════════════
// EJECUCIÓN
// ══════════════════════════════════════════════════════

console.log(`${colors.blue}🔄 Esperando que el servidor esté activo en ${BASE_URL}...${colors.reset}\n`);
console.log(`${colors.yellow}⚠️  Asegúrate de que el servidor esté corriendo con: npm run backend${colors.reset}\n`);

setTimeout(async () => {
  try {
    await runTests();
  } catch (error) {
    console.error(`\n${colors.red}Error fatal: ${error.message}${colors.reset}`);
    console.log(`\n${colors.yellow}Asegúrate de:${colors.reset}`);
    console.log(`1. El servidor está corriendo (npm run backend)`);
    console.log(`2. Todas las variables de entorno están configuradas`);
    console.log(`3. Las dependencias están instaladas (npm install)\n`);
  }
}, 2000);
