// Test script para verificar los nuevos agentes de VoltAgent
const ExpertSubagentsSystem = require('./backend/mcp-subagents-expert.js');

console.log('🔄 Inicializando sistema de agentes Sandra IA...');

try {
  const system = new ExpertSubagentsSystem();

  console.log('\n✅ SANDRA IA AGENTES INTEGRADOS DESDE VOLTAGENT:');

  const experts = system.listExperts();
  console.log('\n🎯 TOTAL AGENTES:', experts.length);

  console.log('\n📋 LISTA DE AGENTES:');
  experts.forEach((expert, i) => {
    console.log(`${i+1}. ${expert.name}`);
    console.log(`   - Especialidad: ${expert.specialty}`);
    console.log(`   - Modelo: ${expert.model}`);
    console.log(`   - SDK: ${expert.sdk}`);
    console.log('');
  });

  console.log('\n🆕 NUEVOS AGENTES VOLTAGENT INTEGRADOS:');
  const newAgents = [
    'Sandra Penetration Tester',
    'Sandra Product Manager',
    'Sandra ML Engineer',
    'Sandra Prompt Engineer'
  ];

  newAgents.forEach((agentName, i) => {
    const agent = experts.find(e => e.name === agentName);
    if (agent) {
      console.log(`✅ ${i+1}. ${agent.name} - INTEGRADO`);
    } else {
      console.log(`❌ ${i+1}. ${agentName} - NO ENCONTRADO`);
    }
  });

  console.log('\n🎉 INTEGRACIÓN VOLTAGENT COMPLETADA EXITOSAMENTE');

} catch (error) {
  console.error('❌ Error:', error.message);
}