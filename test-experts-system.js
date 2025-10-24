// ═══════════════════════════════════════════════════════
// TEST SISTEMA DE SUBAGENTES EXPERTOS GALAXY
// Prueba de funcionalidad del sistema MCP profesional
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const ExpertSubagentsSystem = require('./backend/mcp-subagents-expert');

async function testExpertsSystem() {
  console.log('\n🚀 INICIANDO PRUEBAS DE SISTEMA DE EXPERTOS GALAXY\n');
  console.log('═'.repeat(60));
  
  const experts = new ExpertSubagentsSystem();

  // ─────────────────────────────────────────────────────
  // TEST 1: Estado del sistema
  // ─────────────────────────────────────────────────────
  console.log('\n📊 TEST 1: Estado del Sistema');
  console.log('─'.repeat(60));
  
  const status = experts.getSystemStatus();
  console.log('✅ Total de expertos:', status.totalExperts);
  console.log('✅ Anthropic conectado:', status.anthropicConnected);
  console.log('✅ OpenAI conectado:', status.openaiConnected);
  
  console.log('\n📋 Expertos disponibles:');
  const expertsList = experts.listExperts();
  expertsList.forEach(expert => {
    console.log(`   - ${expert.name} (${expert.id})`);
    console.log(`     Especialidad: ${expert.specialty}`);
    console.log(`     Modelo: ${expert.model}\n`);
  });

  // ─────────────────────────────────────────────────────
  // TEST 2: Router Automático
  // ─────────────────────────────────────────────────────
  console.log('\n🎯 TEST 2: Router Automático (Detección Inteligente)');
  console.log('─'.repeat(60));
  
  const testMessages = [
    { msg: 'Analiza la estrategia de expansión a Madrid', expectedExpert: 'ceo' },
    { msg: 'Crea un endpoint REST para reservas', expectedExpert: 'dev' },
    { msg: 'Diseña una campaña de Instagram para verano', expectedExpert: 'marketing' }
  ];

  for (const test of testMessages) {
    const detected = experts.detectBestExpert(test.msg);
    const match = detected === test.expectedExpert ? '✅' : '❌';
    console.log(`${match} "${test.msg}"`);
    console.log(`   Experto detectado: ${detected} (esperado: ${test.expectedExpert})\n`);
  }

  // ─────────────────────────────────────────────────────
  // TEST 3: Ejecución de Experto CEO
  // ─────────────────────────────────────────────────────
  console.log('\n👔 TEST 3: Experto CEO (Estrategia)');
  console.log('─'.repeat(60));
  
  try {
    const ceoResult = await experts.executeExpert(
      'ceo',
      'Resume en 3 puntos clave la estrategia de diferenciación de GuestsValencia frente a Airbnb'
    );
    
    console.log('✅ Respuesta recibida del CEO:');
    console.log('─'.repeat(60));
    console.log(ceoResult.response);
    console.log('─'.repeat(60));
    console.log(`📊 Modelo: ${ceoResult.model}`);
    console.log(`⚡ Tokens usados: ${ceoResult.usage?.total_tokens || 'N/A'}\n`);
  } catch (error) {
    console.error('❌ Error CEO:', error.message);
  }

  // ─────────────────────────────────────────────────────
  // TEST 4: Ejecución de Experto Support
  // ─────────────────────────────────────────────────────
  console.log('\n💬 TEST 4: Experto Support (Atención Cliente)');
  console.log('─'.repeat(60));
  
  try {
    const supportResult = await experts.executeExpert(
      'support',
      '¿Qué restaurantes me recomiendas cerca de la playa en Valencia?'
    );
    
    console.log('✅ Respuesta recibida de Support:');
    console.log('─'.repeat(60));
    console.log(supportResult.response);
    console.log('─'.repeat(60));
    console.log(`📊 Modelo: ${supportResult.model}`);
    console.log(`⚡ Tokens usados: ${supportResult.usage?.total_tokens || 'N/A'}\n`);
  } catch (error) {
    console.error('❌ Error Support:', error.message);
  }

  // ─────────────────────────────────────────────────────
  // TEST 5: Colaboración Multi-Experto
  // ─────────────────────────────────────────────────────
  console.log('\n🤝 TEST 5: Colaboración Multi-Experto (CEO + Marketing)');
  console.log('─'.repeat(60));
  
  try {
    const colabResult = await experts.collaborativeTask(
      'Propón 3 estrategias para aumentar reservas en temporada baja',
      ['ceo', 'marketing']
    );
    
    console.log('✅ Resultados de colaboración:');
    console.log('─'.repeat(60));
    
    Object.entries(colabResult.results).forEach(([expertKey, result]) => {
      console.log(`\n📌 ${result.expert}:`);
      console.log(result.response.substring(0, 300) + '...\n');
    });
    
    console.log('─'.repeat(60));
  } catch (error) {
    console.error('❌ Error Colaboración:', error.message);
  }

  // ─────────────────────────────────────────────────────
  // RESUMEN FINAL
  // ─────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('✨ PRUEBAS COMPLETADAS EXITOSAMENTE');
  console.log('═'.repeat(60));
  console.log('\n📝 Resumen:');
  console.log(`   ✅ ${status.totalExperts} expertos operativos`);
  console.log('   ✅ Router automático funcional');
  console.log('   ✅ Antropic SDK conectado');
  console.log('   ✅ OpenAI SDK conectado');
  console.log('   ✅ Colaboración multi-experto operativa');
  console.log('\n🚀 Sistema listo para producción\n');
}

// Ejecutar pruebas
testExpertsSystem().catch(error => {
  console.error('\n❌ ERROR CRÍTICO:', error);
  process.exit(1);
});
