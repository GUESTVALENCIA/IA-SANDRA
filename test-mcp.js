// ═══════════════════════════════════════════════════════
// TEST SANDRA MCP - Sistema de Subagentes
// Prueba completa de la arquitectura profesional
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const MCPSystem = require('./backend/mcp-system');

async function testMCPSystem() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║     SANDRA IA - TEST SISTEMA MCP PROFESIONAL         ║');
  console.log('║     GuestsValencia.es - Arquitectura Galaxy          ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  try {
    console.log('⚙️  Inicializando Sistema MCP...');
    const mcp = new MCPSystem();
    
    const status = mcp.getStatus();
    console.log('✅ Sistema MCP inicializado');
    console.log(`   📊 Subagentes: ${status.subagentsAvailable}`);
    console.log(`   🔗 Anthropic: ${status.anthropicConnected ? '✓' : '✗'}`);
    console.log(`   🔗 OpenAI: ${status.openaiConnected ? '✓' : '✗'}\n`);

    // Test 1: Conversación
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 1: SUBAGENTE CONVERSACIONAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const test1 = await mcp.routeTask(
      "Hola Sandra, ¿cómo puedes ayudarme con la gestión de apartamentos?",
      'conversacion'
    );
    
    console.log(`SUBAGENTE: ${test1.subagent.toUpperCase()}`);
    console.log(`RESPUESTA: ${test1.response}\n`);
    console.log(`Modelo: ${test1.model}`);
    console.log(`Tokens: ${JSON.stringify(test1.usage)}\n`);

    // Test 2: Razonamiento
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 2: CEREBRO PRINCIPAL (Razonamiento)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const test2 = await mcp.routeTask(
      "Analiza la mejor estrategia para automatizar check-in/check-out en GuestsValencia",
      'razonamiento'
    );
    
    console.log(`SUBAGENTE: ${test2.subagent.toUpperCase()}`);
    console.log(`RESPUESTA: ${test2.response.substring(0, 800)}...\n`);
    console.log(`Modelo: ${test2.model}\n`);

    // Test 3: Desarrollo
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 3: DESARROLLADOR GALAXY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const test3 = await mcp.executeWithDesarrollador(
      "Crea función para validar reserva antes de check-in",
      { framework: 'Node.js', database: 'PostgreSQL' }
    );
    
    console.log(`SUBAGENTE: ${test3.subagent.toUpperCase()}`);
    console.log(`RESPUESTA: ${test3.response.substring(0, 600)}...\n`);

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║           ✅ TODOS LOS TESTS COMPLETADOS              ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    
    const finalStatus = mcp.getStatus();
    console.log('📊 ESTADÍSTICAS FINALES:');
    console.log(`   • Conversaciones: ${finalStatus.conversationLength}`);
    console.log(`   • Memoria: ${finalStatus.memorySize} items`);
    console.log(`   • Subagentes: ${finalStatus.subagentsAvailable}\n`);
    console.log('🚀 SISTEMA MCP OPERATIVO\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  testMCPSystem()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error fatal:', err);
      process.exit(1);
    });
}

module.exports = { testMCPSystem };
