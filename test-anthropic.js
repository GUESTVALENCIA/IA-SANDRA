// ═══════════════════════════════════════════════════════
// TEST ANTHROPIC API - Sandra Professional
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

async function testAnthropicAPI() {
  console.log('🧪 INICIANDO TEST DE ANTHROPIC API...\n');

  // Verificar API Key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY no encontrada en .env');
    console.log('\n📝 SOLUCIÓN:');
    console.log('1. Abre el archivo .env');
    console.log('2. Reemplaza "TU_API_KEY_AQUI" con tu API key de Anthropic');
    console.log('3. Vuelve a ejecutar: node test-anthropic.js\n');
    return;
  }

  if (process.env.ANTHROPIC_API_KEY === 'TU_API_KEY_AQUI') {
    console.error('❌ ERROR: Debes configurar tu ANTHROPIC_API_KEY');
    console.log('\n📝 PASOS:');
    console.log('1. Ve a: https://console.anthropic.com/settings/keys');
    console.log('2. Crea una nueva API key');
    console.log('3. Copia la key y pégala en .env');
    console.log('4. Guarda el archivo y vuelve a ejecutar este test\n');
    return;
  }
  try {
    console.log('🔑 API Key detectada');
    console.log(`📦 Modelo: ${process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929'}`);
    console.log('⏳ Enviando mensaje de prueba...\n');

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
      max_tokens: 200,
      system: 'Eres Sandra, responde en español de forma breve.',
      messages: [
        {
          role: 'user',
          content: 'Hola Sandra, di "Antropic API conectada correctamente" si me recibes.'
        }
      ]
    });

    console.log('✅ RESPUESTA DE CLAUDE:');
    console.log('─'.repeat(50));
    console.log(message.content[0].text);
    console.log('─'.repeat(50));
    console.log('\n📊 INFORMACIÓN DE USO:');
    console.log(`   Input tokens: ${message.usage.input_tokens}`);
    console.log(`   Output tokens: ${message.usage.output_tokens}`);
    console.log(`   Modelo: ${message.model}`);
    console.log('\n✨ TEST COMPLETADO EXITOSAMENTE\n');
  } catch (error) {
    console.error('❌ ERROR EN LA CONEXIÓN:');
    console.error(`   ${error.message}\n`);
    
    if (error.status === 401) {
      console.log('🔧 SOLUCIÓN: Tu API key no es válida');
      console.log('   Verifica en: https://console.anthropic.com/settings/keys\n');
    }
  }
}

// Ejecutar test
testAnthropicAPI();
