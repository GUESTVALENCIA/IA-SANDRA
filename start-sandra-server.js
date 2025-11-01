/**
 * Script para iniciar Sandra Nucleus como servidor HTTP directo
 * (Sin Electron, solo el backend)
 */

const SandraNucleus = require('./orchestrator/sandra-nucleus-core');

async function startServer() {
  try {
    console.log('🚀 Iniciando Sandra Nucleus Server...');
    console.log('📁 Directorio:', __dirname);
    
    await SandraNucleus.initialize();
    
    const port = SandraNucleus.config.server.port || 7777;
    console.log(`\n✅ Sandra Nucleus está corriendo en http://localhost:${port}`);
    console.log(`\n📊 Endpoints disponibles:`);
    console.log(`   - GET  /health`);
    console.log(`   - POST /api/chat`);
    console.log(`   - POST /api/voice-command`);
    console.log(`   - POST /api/tts`);
    console.log(`   - POST /api/stt`);
    console.log(`   - GET  /metrics\n`);
    
  } catch (error) {
    console.error('❌ Error al iniciar Sandra Nucleus:', error);
    process.exit(1);
  }
}

startServer();

