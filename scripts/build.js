/**
 * Build script para producción
 * Minifica y optimiza assets
 */

const fs = require('fs');
const path = require('path');

// Generar manifest y validar SW antes del build
console.log('🔨 Iniciando proceso de build...\n');

// Generar manifest dinámico
try {
  require('./generate-manifest');
} catch (error) {
  console.error('❌ Error generando manifest:', error.message);
  process.exit(1);
}

// Validar Service Worker
try {
  require('./build-service-worker');
} catch (error) {
  console.error('❌ Error validando Service Worker:', error.message);
  process.exit(1);
}

console.log('🔨 Starting production build...');

// Verificar variables de entorno
const requiredEnvVars = ['OPENAI_API_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Crear directorio de build si no existe
const buildDir = path.join(__dirname, '../dist');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copiar archivos esenciales
const filesToCopy = [
  'main.js',
  'package.json'
];

filesToCopy.forEach(file => {
  const src = path.join(__dirname, '..', file);
  const dest = path.join(buildDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${file}`);
  }
});

// Copiar directorios
const dirsToCopy = [
  'orchestrator',
  'mcp-servers',
  'frontend'
];

dirsToCopy.forEach(dir => {
  const src = path.join(__dirname, '..', dir);
  const dest = path.join(buildDir, dir);
  if (fs.existsSync(src)) {
    copyDirectory(src, dest);
    console.log(`✓ Copied ${dir}/`);
  }
});

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('✅ Build completed!');
console.log(`📦 Output: ${buildDir}`);

