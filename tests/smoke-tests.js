/**
 * Smoke Tests - Validación básica de funcionalidad crítica
 * Ejecutar después de cada build antes de deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 SMOKE TESTS - Validación de funcionalidad crítica\n');

let errors = [];
let warnings = [];

// ============================================================================
// Test 1: Verificar que el build generó los archivos esenciales
// ============================================================================
console.log('[1/6] Verificando archivos de build...');

const essentialFiles = [
  'frontend/index.html',
  'frontend/manifest.json',
  'frontend/sw.js',
  'frontend/js/app.js',
  'frontend/js/api.js',
  'frontend/js/api-client-wrapper.js'
];

essentialFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    errors.push(`Archivo faltante: ${file}`);
    console.error(`  ❌ ${file} - NO EXISTE`);
  }
});

// ============================================================================
// Test 2: Verificar que manifest.json no tiene localhost
// ============================================================================
console.log('\n[2/6] Verificando manifest.json...');

const manifestPath = path.join(__dirname, '..', 'frontend', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  const manifestStr = JSON.stringify(manifest);
  if (manifestStr.includes('localhost')) {
    errors.push('manifest.json contiene "localhost"');
    console.error('  ❌ manifest.json contiene "localhost"');
  } else {
    console.log('  ✅ manifest.json sin localhost');
  }
} else {
  errors.push('manifest.json no existe');
}

// ============================================================================
// Test 3: Verificar que sw.js no tiene localhost hardcodeado
// ============================================================================
console.log('\n[3/6] Verificando sw.js...');

const swPath = path.join(__dirname, '..', 'frontend', 'sw.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  const localhostPatterns = [
    /localhost:8080/,
    /localhost:3000/,
    /http:\/\/localhost/
  ];
  
  let hasLocalhost = false;
  localhostPatterns.forEach(pattern => {
    if (pattern.test(swContent)) {
      hasLocalhost = true;
    }
  });
  
  if (hasLocalhost) {
    errors.push('sw.js contiene URLs localhost hardcodeadas');
    console.error('  ❌ sw.js contiene localhost');
  } else {
    console.log('  ✅ sw.js sin localhost hardcodeado');
  }
} else {
  errors.push('sw.js no existe');
}

// ============================================================================
// Test 4: Verificar que api-client-wrapper.js existe
// ============================================================================
console.log('\n[4/6] Verificando API Client Wrapper...');

const apiWrapperPath = path.join(__dirname, '..', 'frontend', 'js', 'api-client-wrapper.js');
if (fs.existsSync(apiWrapperPath)) {
  const wrapperContent = fs.readFileSync(apiWrapperPath, 'utf8');
  
  if (wrapperContent.includes('SandraAPIClient')) {
    console.log('  ✅ API Client Wrapper existe y tiene SandraAPIClient');
  } else {
    warnings.push('api-client-wrapper.js podría estar incompleto');
    console.warn('  ⚠️ API Client Wrapper podría estar incompleto');
  }
} else {
  errors.push('api-client-wrapper.js no existe');
  console.error('  ❌ api-client-wrapper.js NO EXISTE');
}

// ============================================================================
// Test 5: Verificar netlify.toml tiene configuración correcta
// ============================================================================
console.log('\n[5/6] Verificando netlify.toml...');

const netlifyTomlPath = path.join(__dirname, '..', 'netlify.toml');
if (fs.existsSync(netlifyTomlPath)) {
  const tomlContent = fs.readFileSync(netlifyTomlPath, 'utf8');
  
  if (!tomlContent.includes('publish = "frontend"')) {
    warnings.push('netlify.toml podría no tener publish directory correcto');
    console.warn('  ⚠️ Verificar publish directory en netlify.toml');
  } else {
    console.log('  ✅ netlify.toml tiene publish directory correcto');
  }
  
  if (!tomlContent.includes('NODE_ENV=production')) {
    warnings.push('netlify.toml podría no forzar NODE_ENV=production');
    console.warn('  ⚠️ Verificar que build command force NODE_ENV=production');
  } else {
    console.log('  ✅ netlify.toml fuerza NODE_ENV=production');
  }
} else {
  errors.push('netlify.toml no existe');
  console.error('  ❌ netlify.toml NO EXISTE');
}

// ============================================================================
// Test 6: Verificar Netlify Functions existen
// ============================================================================
console.log('\n[6/6] Verificando Netlify Functions...');

const functionsDir = path.join(__dirname, '..', 'netlify', 'functions');
if (fs.existsSync(functionsDir)) {
  const functions = fs.readdirSync(functionsDir).filter(f => f.endsWith('.js'));
  
  if (functions.length === 0) {
    errors.push('No hay Netlify Functions');
    console.error('  ❌ No hay Netlify Functions');
  } else {
    console.log(`  ✅ ${functions.length} Netlify Function(s) encontrada(s): ${functions.join(', ')}`);
    
    // Verificar que chat.js tiene CORS preflight
    const chatFunctionPath = path.join(functionsDir, 'chat.js');
    if (fs.existsSync(chatFunctionPath)) {
      const chatContent = fs.readFileSync(chatFunctionPath, 'utf8');
      if (chatContent.includes('OPTIONS') && chatContent.includes('Access-Control-Allow-Origin')) {
        console.log('  ✅ chat.js tiene CORS preflight handler');
      } else {
        warnings.push('chat.js podría no tener CORS preflight completo');
        console.warn('  ⚠️ Verificar CORS preflight en chat.js');
      }
    }
  }
} else {
  errors.push('Directorio netlify/functions no existe');
  console.error('  ❌ netlify/functions NO EXISTE');
}

// ============================================================================
// RESULTADOS
// ============================================================================
console.log('\n📊 RESULTADOS:\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ TODOS LOS SMOKE TESTS PASARON\n');
  console.log('🚀 Sistema listo para deployment\n');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.error('🔴 ERRORES CRÍTICOS (bloquean deployment):');
    errors.forEach(error => console.error(`   ❌ ${error}`));
    console.error('');
  }
  
  if (warnings.length > 0) {
    console.warn('🟡 ADVERTENCIAS:');
    warnings.forEach(warning => console.warn(`   ⚠️ ${warning}`));
    console.warn('');
  }
  
  if (errors.length > 0) {
    console.error('❌ SMOKE TESTS FALLARON - Deployment bloqueado\n');
    process.exit(1);
  } else {
    console.warn('⚠️ Smoke tests pasaron con advertencias\n');
    process.exit(0);
  }
}

