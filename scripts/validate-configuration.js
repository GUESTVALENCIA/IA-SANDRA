/**
 * Script de Validación de Configuración Pre-Deploy
 * TIER 1: Valida que no hay URLs localhost y que todo está configurado
 */

const fs = require('fs');
const path = require('path');

const ERRORS = [];
const WARNINGS = [];

console.log('🔍 VALIDACIÓN DE CONFIGURACIÓN PRE-DEPLOY\n');

/**
 * Validar manifest.json
 */
function validateManifest() {
  console.log('[1/5] Validando manifest.json...');
  
  try {
    const manifestPath = path.join(__dirname, '../frontend/manifest.json');
    if (!fs.existsSync(manifestPath)) {
      ERRORS.push('manifest.json no existe');
      return;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Verificar start_url no tiene localhost
    if (manifest.start_url && 
        (manifest.start_url.includes('localhost') || manifest.start_url.includes('127.0.0.1'))) {
      ERRORS.push('manifest.json: start_url contiene localhost');
    }

    // Verificar que start_url sea relativo o producción
    if (manifest.start_url && !manifest.start_url.startsWith('/') && 
        !manifest.start_url.startsWith('https://sandra.guestsvalencia.es')) {
      WARNINGS.push('manifest.json: start_url debería ser relativo o producción');
    }

    console.log('  ✅ manifest.json válido');
  } catch (error) {
    ERRORS.push(`manifest.json: ${error.message}`);
  }
}

/**
 * Validar sw.js
 */
function validateServiceWorker() {
  console.log('[2/5] Validando sw.js...');
  
  try {
    const swPath = path.join(__dirname, '../frontend/sw.js');
    if (!fs.existsSync(swPath)) {
      ERRORS.push('sw.js no existe');
      return;
    }

    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Verificar que no hay localhost hardcodeado
    if (swContent.includes('localhost:') || swContent.includes('127.0.0.1:')) {
      // Permitir solo en detección de entorno
      if (!swContent.includes('self.location.hostname') && 
          !swContent.includes('location.hostname ===')) {
        ERRORS.push('sw.js: localhost hardcodeado (debe usar detección automática)');
      }
    }

    // Verificar que usa detección automática
    if (!swContent.includes('location.hostname') && !swContent.includes('self.location.hostname')) {
      WARNINGS.push('sw.js: No detecta entorno automáticamente');
    }

    console.log('  ✅ sw.js válido');
  } catch (error) {
    ERRORS.push(`sw.js: ${error.message}`);
  }
}

/**
 * Validar netlify.toml
 */
function validateNetlifyToml() {
  console.log('[3/5] Validando netlify.toml...');
  
  try {
    const tomlPath = path.join(__dirname, '../netlify.toml');
    if (!fs.existsSync(tomlPath)) {
      ERRORS.push('netlify.toml no existe');
      return;
    }

    const tomlContent = fs.readFileSync(tomlPath, 'utf8');
    
    // Verificar publish directory
    if (!tomlContent.includes('publish = "frontend"')) {
      ERRORS.push('netlify.toml: publish directory no es "frontend"');
    }

    // Verificar que functions directory está configurado
    if (!tomlContent.includes('functions = "netlify/functions"')) {
      ERRORS.push('netlify.toml: functions directory no configurado');
    }

    // Verificar que build command fuerza NODE_ENV
    if (!tomlContent.includes('NODE_ENV=production')) {
      WARNINGS.push('netlify.toml: build command no fuerza NODE_ENV=production');
    }

    console.log('  ✅ netlify.toml válido');
  } catch (error) {
    ERRORS.push(`netlify.toml: ${error.message}`);
  }
}

/**
 * Validar frontend no tiene llamadas directas a APIs
 */
function validateFrontendAPICalls() {
  console.log('[4/5] Validando frontend API calls...');
  
  try {
    const frontendPath = path.join(__dirname, '../frontend/js');
    const jsFiles = fs.readdirSync(frontendPath).filter(f => f.endsWith('.js'));

    let directAPICalls = 0;
    
    for (const file of jsFiles) {
      const content = fs.readFileSync(path.join(frontendPath, file), 'utf8');
      
      // Buscar llamadas directas a APIs externas
      if (content.includes('api.openai.com') && !content.includes('// FALLBACK') && 
          !content.includes('// Intentional')) {
        directAPICalls++;
        WARNINGS.push(`${file}: Llamada directa a api.openai.com detectada`);
      }

      if (content.includes('api.deepgram.com') && !content.includes('// FALLBACK')) {
        directAPICalls++;
        WARNINGS.push(`${file}: Llamada directa a api.deepgram.com detectada`);
      }
    }

    // Verificar que existe resilient-ai-client.js
    const resilientClientPath = path.join(frontendPath, 'resilient-ai-client.js');
    if (!fs.existsSync(resilientClientPath)) {
      ERRORS.push('resilient-ai-client.js no existe');
    }

    // Verificar que index.html incluye resilient-ai-client
    const indexPath = path.join(__dirname, '../frontend/index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    if (!indexContent.includes('resilient-ai-client.js')) {
      WARNINGS.push('index.html: No incluye resilient-ai-client.js');
    }

    if (directAPICalls === 0) {
      console.log('  ✅ No hay llamadas directas a APIs');
    } else {
      console.log(`  ⚠️  ${directAPICalls} llamada(s) directa(s) detectada(s)`);
    }
  } catch (error) {
    ERRORS.push(`Validación frontend: ${error.message}`);
  }
}

/**
 * Validar GitHub Actions workflow
 */
function validateGitHubWorkflow() {
  console.log('[5/5] Validando GitHub Actions workflow...');
  
  try {
    const workflowPath = path.join(__dirname, '../.github/workflows/deploy.yml');
    if (!fs.existsSync(workflowPath)) {
      WARNINGS.push('GitHub Actions workflow no existe');
      return;
    }

    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // Verificar que fuerza NODE_ENV=production
    if (!workflowContent.includes('NODE_ENV: production')) {
      ERRORS.push('GitHub Actions: No fuerza NODE_ENV=production');
    }

    // Verificar que ejecuta build:prod
    if (!workflowContent.includes('build:prod')) {
      ERRORS.push('GitHub Actions: No ejecuta build:prod');
    }

    console.log('  ✅ GitHub Actions workflow válido');
  } catch (error) {
    WARNINGS.push(`GitHub Actions: ${error.message}`);
  }
}

/**
 * Main
 */
function main() {
  validateManifest();
  validateServiceWorker();
  validateNetlifyToml();
  validateFrontendAPICalls();
  validateGitHubWorkflow();

  console.log('\n📊 RESULTADOS:\n');

  if (ERRORS.length > 0) {
    console.log('❌ ERRORES ENCONTRADOS:');
    ERRORS.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
    console.log('');
  }

  if (WARNINGS.length > 0) {
    console.log('⚠️  ADVERTENCIAS:');
    WARNINGS.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`);
    });
    console.log('');
  }

  if (ERRORS.length === 0 && WARNINGS.length === 0) {
    console.log('✅ TODAS LAS VALIDACIONES PASARON');
    process.exit(0);
  } else if (ERRORS.length === 0) {
    console.log('⚠️  Validación pasó con advertencias');
    process.exit(0);
  } else {
    console.log('❌ Validación falló - Corrige los errores antes de deploy');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateManifest, validateServiceWorker, validateNetlifyToml };

