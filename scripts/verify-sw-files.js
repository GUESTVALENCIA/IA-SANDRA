/**
 * Verificador de archivos para Service Worker
 * Asegura que solo se cacheen archivos que realmente existen
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando archivos para Service Worker...\n');

const frontendDir = path.join(__dirname, '../frontend');
const swPath = path.join(frontendDir, 'sw.js');

if (!fs.existsSync(swPath)) {
  console.error('❌ sw.js no encontrado');
  process.exit(1);
}

// Leer sw.js
const swContent = fs.readFileSync(swPath, 'utf8');

// Extraer URLs de PRECACHE_URLS
const precacheMatch = swContent.match(/const PRECACHE_URLS = \[([\s\S]*?)\]/);
if (!precacheMatch) {
  console.error('❌ No se encontró PRECACHE_URLS en sw.js');
  process.exit(1);
}

// Parsear URLs
const urlsText = precacheMatch[1];
const urls = urlsText
  .split(',')
  .map(line => line.trim().replace(/['"]/g, '').replace(/\/\//g, '/'))
  .filter(url => url && !url.includes('localhost'));

console.log(`📋 URLs encontradas en PRECACHE_URLS: ${urls.length}\n`);

// Verificar cada archivo
const missingFiles = [];
const existingFiles = [];

urls.forEach(url => {
  // Normalizar path (remover leading slash para filesystem)
  const filePath = path.join(frontendDir, url.replace(/^\//, ''));
  
  if (fs.existsSync(filePath)) {
    existingFiles.push(url);
    console.log(`✅ ${url}`);
  } else {
    missingFiles.push(url);
    console.error(`❌ ${url} - NO EXISTE`);
  }
});

console.log(`\n📊 RESULTADOS:`);
console.log(`   ✅ Archivos existentes: ${existingFiles.length}`);
console.log(`   ❌ Archivos faltantes: ${missingFiles.length}\n`);

if (missingFiles.length > 0) {
  console.error('🚨 ADVERTENCIA: Los siguientes archivos están en PRECACHE_URLS pero no existen:');
  missingFiles.forEach(file => {
    console.error(`   - ${file}`);
  });
  console.error('\n⚠️ El Service Worker fallará al intentar cachearlos.\n');
  console.error('💡 Recomendación: Remover estos archivos de PRECACHE_URLS o crearlos.\n');
  process.exit(1);
} else {
  console.log('✅ Todos los archivos existen - Service Worker funcionará correctamente\n');
  process.exit(0);
}

