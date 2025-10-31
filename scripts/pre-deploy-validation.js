/**
 * Validación Pre-Deployment
 * Verifica que no haya URLs localhost, API keys expuestas, etc.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDANDO CONFIGURACIÓN PARA DEPLOYMENT...\n');

let errors = [];
let warnings = [];

// ============================================================================
// 1. VERIFICAR MANIFEST.JSON
// ============================================================================
console.log('📋 Verificando manifest.json...');
const manifestPath = path.join(__dirname, '../frontend/manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Verificar start_url
    if (manifest.start_url && manifest.start_url.includes('localhost')) {
      errors.push('❌ manifest.json: start_url contiene "localhost"');
    }
    
    // Verificar shortcuts
    if (manifest.shortcuts) {
      manifest.shortcuts.forEach((shortcut, i) => {
        if (shortcut.url && shortcut.url.includes('localhost')) {
          errors.push(`❌ manifest.json: shortcuts[${i}].url contiene "localhost"`);
        }
      });
    }
    
    // Verificar share_target
    if (manifest.share_target && manifest.share_target.action) {
      if (manifest.share_target.action.includes('localhost')) {
        errors.push('❌ manifest.json: share_target.action contiene "localhost"');
      }
    }
    
    if (!manifest.start_url || manifest.start_url === '/') {
      console.log('✅ manifest.json: start_url correcto (relativo)');
    }
  } catch (error) {
    errors.push(`❌ Error leyendo manifest.json: ${error.message}`);
  }
} else {
  warnings.push('⚠️ manifest.json no encontrado');
}

// ============================================================================
// 2. VERIFICAR SERVICE WORKER
// ============================================================================
console.log('⚙️ Verificando sw.js...');
const swPath = path.join(__dirname, '../frontend/sw.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  // Buscar URLs hardcodeadas a localhost
  const localhostPatterns = [
    /localhost:8080/g,
    /localhost:3000/g,
    /http:\/\/localhost/g,
    /const DOMAIN = ['"]localhost/g,
    /const BASE_URL = ['"]http:\/\/localhost/g
  ];
  
  localhostPatterns.forEach(pattern => {
    if (pattern.test(swContent)) {
      errors.push('❌ sw.js: Contiene URLs localhost hardcodeadas');
    }
  });
  
  // Verificar que use detección automática
  if (swContent.includes('self.location.origin') || swContent.includes('self.location.host')) {
    console.log('✅ sw.js: Usa detección automática de entorno');
  } else {
    warnings.push('⚠️ sw.js: Podría no tener detección automática de entorno');
  }
} else {
  warnings.push('⚠️ sw.js no encontrado');
}

// ============================================================================
// 3. VERIFICAR API KEYS EN FRONTEND
// ============================================================================
console.log('🔑 Verificando API keys en frontend...');
const frontendDir = path.join(__dirname, '../frontend');
const htmlFiles = [];

function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      findHtmlFiles(fullPath);
    } else if (file.name.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  });
}

findHtmlFiles(frontendDir);

htmlFiles.forEach(htmlFile => {
  const content = fs.readFileSync(htmlFile, 'utf8');
  
  // Buscar patrones de API keys
  const apiKeyPatterns = [
    /OPENAI_API_KEY/g,
    /sk-[a-zA-Z0-9]{32,}/g,
    /apiKey.*=.*process\.env/g,
    /Authorization.*Bearer.*undefined/g
  ];
  
  apiKeyPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      warnings.push(`⚠️ ${path.relative(frontendDir, htmlFile)}: Posible API key hardcodeada o undefined`);
    }
  });
  
  // Verificar llamadas directas a OpenAI
  if (content.includes('api.openai.com/v1/chat/completions') && !content.includes('/.netlify/functions/')) {
    errors.push(`❌ ${path.relative(frontendDir, htmlFile)}: Llamadas directas a OpenAI (debe usar Netlify Functions)`);
  }
});

// ============================================================================
// 4. VERIFICAR NETLIFY.TOML
// ============================================================================
console.log('🌐 Verificando netlify.toml...');
const netlifyTomlPath = path.join(__dirname, '../netlify.toml');
if (fs.existsSync(netlifyTomlPath)) {
  const tomlContent = fs.readFileSync(netlifyTomlPath, 'utf8');
  
  // Verificar que tenga redirects de API
  if (!tomlContent.includes('/api/*') || !tomlContent.includes('/.netlify/functions/')) {
    errors.push('❌ netlify.toml: Falta redirect de /api/* a Netlify Functions');
  }
  
  // Verificar headers de seguridad
  if (!tomlContent.includes('X-Frame-Options') || !tomlContent.includes('CSP')) {
    warnings.push('⚠️ netlify.toml: Podría necesitar más headers de seguridad');
  }
  
  // Verificar CORS no sea "*"
  if (tomlContent.includes('Access-Control-Allow-Origin = "*"')) {
    errors.push('❌ netlify.toml: CORS está configurado como "*" (inseguro)');
  }
  
  console.log('✅ netlify.toml: Existe y configurado');
} else {
  errors.push('❌ netlify.toml: No existe (requerido para deployment)');
}

// ============================================================================
// 5. VERIFICAR NETLIFY FUNCTIONS
// ============================================================================
console.log('🔧 Verificando Netlify Functions...');
const functionsDir = path.join(__dirname, '../netlify/functions');
if (fs.existsSync(functionsDir)) {
  const functions = fs.readdirSync(functionsDir);
  if (functions.length === 0) {
    warnings.push('⚠️ No hay Netlify Functions definidas');
  } else {
    console.log(`✅ Netlify Functions encontradas: ${functions.join(', ')}`);
    
    // Verificar que las functions tengan rate limiting
    functions.forEach(func => {
      const funcFile = path.join(functionsDir, func);
      if (fs.statSync(funcFile).isFile() && func.endsWith('.js')) {
        const funcContent = fs.readFileSync(funcFile, 'utf8');
        if (!funcContent.includes('rateLimit') && !funcContent.includes('rate limit')) {
          warnings.push(`⚠️ ${func}: Podría necesitar rate limiting`);
        }
      }
    });
  }
} else {
  warnings.push('⚠️ Directorio netlify/functions no existe');
}

// ============================================================================
// RESULTADOS
// ============================================================================
console.log('\n📊 RESULTADOS:\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ ¡TODAS LAS VALIDACIONES PASARON!\n');
  console.log('🚀 Listo para deployment en producción\n');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.error('🔴 ERRORES CRÍTICOS (deben corregirse antes del deployment):');
    errors.forEach(error => console.error(`   ${error}`));
    console.error('');
  }
  
  if (warnings.length > 0) {
    console.warn('🟡 ADVERTENCIAS (recomendadas de corregir):');
    warnings.forEach(warning => console.warn(`   ${warning}`));
    console.warn('');
  }
  
  if (errors.length > 0) {
    console.error('❌ DEPLOYMENT BLOQUEADO - Corrige los errores críticos antes de continuar\n');
    process.exit(1);
  } else {
    console.warn('⚠️ Deployment posible pero con advertencias\n');
    process.exit(0);
  }
}

