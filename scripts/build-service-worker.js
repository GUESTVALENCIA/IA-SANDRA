/**
 * Generador dinámico de Service Worker
 * Detecta entorno y genera SW sin localhost
 */

const fs = require('fs');
const path = require('path');

// Detectar entorno
const env = process.env.NODE_ENV || 'development';

// Leer template base
const swTemplatePath = path.join(__dirname, '..', 'frontend', 'sw.js');
if (!fs.existsSync(swTemplatePath)) {
  console.error('❌ sw.js no encontrado');
  process.exit(1);
}

let swContent = fs.readFileSync(swTemplatePath, 'utf8');

// Verificar que ya use detección automática
if (!swContent.includes('self.location.origin') && !swContent.includes('self.location.host')) {
  console.warn('⚠️ sw.js podría necesitar detección automática de entorno');
}

// Validar que no tenga localhost hardcodeado
const localhostPatterns = [
  /localhost:8080/g,
  /localhost:3000/g,
  /http:\/\/localhost/g
];

let hasLocalhost = false;
localhostPatterns.forEach(pattern => {
  if (pattern.test(swContent)) {
    hasLocalhost = true;
    console.error(`❌ ERROR: sw.js contiene "${pattern.source}"!`);
  }
});

if (hasLocalhost) {
  console.error('❌ ERROR: Service Worker contiene URLs localhost hardcodeadas!');
  console.error('   Usa detección automática: self.location.origin');
  process.exit(1);
}

console.log(`✅ Service Worker validado: sw.js`);
console.log(`   Entorno: ${env}`);
console.log(`   Sin URLs localhost hardcodeadas`);

