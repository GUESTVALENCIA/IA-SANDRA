/**
 * Script de Diagnóstico para Sandra IA
 * Identifica problemas de configuración y conectividad
 */

const path = require('path');
const fs = require('fs');

console.log('\n🔍 DIAGNÓSTICO DE SANDRA IA\n');
console.log('='.repeat(60));

// 1. Verificar archivo .env
console.log('\n📁 1. Verificando archivo .env...');
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '../.env'),
  path.join(process.cwd(), '.env'),
  path.join(process.resourcesPath || __dirname, '.env')
];

let envFound = false;
let envPath = null;

for (const envPathCheck of envPaths) {
  if (fs.existsSync(envPathCheck)) {
    console.log(`   ✅ Encontrado en: ${envPathCheck}`);
    envFound = true;
    envPath = envPathCheck;
    break;
  }
}

if (!envFound) {
  console.log('   ❌ Archivo .env NO encontrado en ninguna ubicación');
  console.log('   📝 Buscado en:');
  envPaths.forEach(p => console.log(`      - ${p}`));
} else {
  // Cargar .env
  require('dotenv').config({ path: envPath });
  console.log('   ✅ Variables de entorno cargadas');
}

// 2. Verificar OPENAI_API_KEY
console.log('\n🔑 2. Verificando OPENAI_API_KEY...');
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey || apiKey.trim() === '') {
  console.log('   ❌ OPENAI_API_KEY NO configurada');
  console.log('   📝 Solución: Agrega OPENAI_API_KEY=tu_key_aqui en el archivo .env');
} else {
  console.log('   ✅ OPENAI_API_KEY encontrada');
  console.log(`   🔐 Key: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`   📏 Longitud: ${apiKey.length} caracteres`);
  
  // Validar formato básico
  if (apiKey.startsWith('sk-')) {
    console.log('   ✅ Formato válido (comienza con sk-)');
  } else {
    console.log('   ⚠️  Formato inusual (no comienza con sk-)');
  }
}

// 3. Verificar otros servicios
console.log('\n🎤 3. Verificando servicios adicionales...');

const cartesiaKey = process.env.CARTESIA_API_KEY;
if (!cartesiaKey || cartesiaKey.trim() === '') {
  console.log('   ⚠️  CARTESIA_API_KEY no configurada (voz deshabilitada)');
} else {
  console.log('   ✅ CARTESIA_API_KEY configurada (voz habilitada)');
}

const deepgramKey = process.env.DEEPGRAM_API_KEY;
if (!deepgramKey || deepgramKey.trim() === '') {
  console.log('   ⚠️  DEEPGRAM_API_KEY no configurada (STT deshabilitado)');
} else {
  console.log('   ✅ DEEPGRAM_API_KEY configurada (STT habilitado)');
}

// 4. Verificar Nucleus Core
console.log('\n🧠 4. Verificando Sandra Nucleus Core...');
try {
  const SandraNucleus = require('./orchestrator/sandra-nucleus-core');
  console.log('   ✅ Nucleus Core cargado');
  console.log(`   📦 Versión: ${SandraNucleus.version}`);
  console.log(`   🎯 Modo: ${SandraNucleus.mode}`);
  
  if (SandraNucleus.config && SandraNucleus.config.api) {
    const nucleusApiKey = SandraNucleus.config.api.openai;
    if (nucleusApiKey && nucleusApiKey.trim() !== '') {
      console.log('   ✅ Nucleus tiene API key configurada');
    } else {
      console.log('   ⚠️  Nucleus NO tiene API key configurada (usará process.env)');
    }
  }
} catch (error) {
  console.log(`   ❌ Error cargando Nucleus Core: ${error.message}`);
}

// 5. Resumen y recomendaciones
console.log('\n📋 RESUMEN Y RECOMENDACIONES');
console.log('='.repeat(60));

const issues = [];

if (!envFound) {
  issues.push('Crear archivo .env en la raíz del proyecto');
}

if (!apiKey || apiKey.trim() === '') {
  issues.push('Configurar OPENAI_API_KEY en el archivo .env');
}

if (issues.length === 0) {
  console.log('\n✅ Todas las verificaciones pasaron');
  console.log('   Si Sandra aún muestra "dificultades técnicas":');
  console.log('   1. Verifica tu conexión a internet');
  console.log('   2. Verifica que tu API key tenga créditos disponibles');
  console.log('   3. Revisa los logs de la consola de Electron para más detalles');
} else {
  console.log('\n❌ Problemas encontrados:');
  issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
  
  console.log('\n📝 Ejemplo de archivo .env:');
  console.log('   OPENAI_API_KEY=sk-tu_api_key_aqui');
  console.log('   OPENAI_MODEL_DEFAULT=gpt-4o');
  console.log('   CARTESIA_API_KEY=tu_cartesia_key (opcional)');
  console.log('   DEEPGRAM_API_KEY=tu_deepgram_key (opcional)');
}

console.log('\n' + '='.repeat(60));
console.log('✅ Diagnóstico completado\n');

