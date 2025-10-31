/**
 * Script de Build Automatizado
 * Previene errores de producción ejecutando validaciones antes del build
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BUILD AUTOMATIZADO - PREVENCIÓN DE ERRORES\n');

const env = process.env.NODE_ENV || 'development';
console.log(`📦 Entorno: ${env}\n`);

// Lista de validaciones a ejecutar antes del build
const validations = [
  {
    name: 'Validar archivos para SW',
    command: 'node scripts/verify-sw-files.js',
    critical: true
  },
  {
    name: 'Generar manifest.json',
    command: 'node scripts/generate-manifest.js',
    critical: true
  },
  {
    name: 'Validar Service Worker',
    command: 'node scripts/build-service-worker.js',
    critical: true
  },
  {
    name: 'Validación pre-deployment',
    command: 'node scripts/pre-deploy-validation.js',
    critical: env === 'production'
  },
  {
    name: 'Security check',
    command: 'node scripts/security-check.js',
    critical: false
  }
];

let errors = [];

// Ejecutar validaciones
console.log('🔍 Ejecutando validaciones pre-build...\n');

validations.forEach((validation, index) => {
  console.log(`[${index + 1}/${validations.length}] ${validation.name}...`);
  
  try {
    execSync(validation.command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log(`✅ ${validation.name} - OK\n`);
  } catch (error) {
    console.error(`❌ ${validation.name} - FALLÓ\n`);
    
    if (validation.critical) {
      errors.push({
        name: validation.name,
        error: error.message
      });
    } else {
      console.warn(`⚠️ ${validation.name} - Advertencia (no crítico)\n`);
    }
  }
});

// Si hay errores críticos, bloquear build
if (errors.length > 0 && env === 'production') {
  console.error('\n🔴 ERRORES CRÍTICOS DETECTADOS - BUILD BLOQUEADO\n');
  errors.forEach(err => {
    console.error(`   ❌ ${err.name}: ${err.error}`);
  });
  console.error('\n💡 Corrige los errores antes de continuar.\n');
  process.exit(1);
}

// Build normal
console.log('🔨 Iniciando build...\n');

try {
  execSync('node scripts/build.js', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('\n✅ BUILD COMPLETADO EXITOSAMENTE\n');
  console.log('📦 Archivos listos para deployment\n');
  
} catch (error) {
  console.error('\n❌ BUILD FALLÓ\n');
  process.exit(1);
}

