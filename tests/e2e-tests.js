/**
 * End-to-End Tests
 * Validación completa de flujos críticos después de deployment
 */

const https = require('https');
const http = require('http');

console.log('🧪 E2E TESTS - Validación post-deployment\n');

const DEPLOY_URL = process.env.DEPLOY_URL || 'https://sandra.guestsvalencia.es';
let errors = [];
let warnings = [];

/**
 * Hacer request HTTP/HTTPS
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

/**
 * Test 1: Verificar que el sitio está online
 */
async function testSiteOnline() {
  console.log('[1/5] Verificando que el sitio está online...');
  
  try {
    const response = await makeRequest(DEPLOY_URL);
    
    if (response.statusCode === 200) {
      console.log(`  ✅ Sitio online (HTTP ${response.statusCode})`);
      return true;
    } else {
      errors.push(`Sitio devuelve HTTP ${response.statusCode}`);
      console.error(`  ❌ Sitio devuelve HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    errors.push(`No se puede conectar al sitio: ${error.message}`);
    console.error(`  ❌ Error de conexión: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: Verificar manifest.json accesible
 */
async function testManifest() {
  console.log('\n[2/5] Verificando manifest.json...');
  
  try {
    const response = await makeRequest(`${DEPLOY_URL}/manifest.json`);
    
    if (response.statusCode === 200) {
      const manifest = JSON.parse(response.body);
      
      if (!JSON.stringify(manifest).includes('localhost')) {
        console.log('  ✅ manifest.json accesible y sin localhost');
        return true;
      } else {
        errors.push('manifest.json contiene localhost');
        console.error('  ❌ manifest.json contiene localhost');
        return false;
      }
    } else {
      errors.push(`manifest.json devuelve HTTP ${response.statusCode}`);
      console.error(`  ❌ manifest.json devuelve HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    errors.push(`Error verificando manifest: ${error.message}`);
    console.error(`  ❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Verificar Service Worker accesible
 */
async function testServiceWorker() {
  console.log('\n[3/5] Verificando Service Worker...');
  
  try {
    const response = await makeRequest(`${DEPLOY_URL}/sw.js`);
    
    if (response.statusCode === 200) {
      if (!response.body.includes('localhost:8080') && !response.body.includes('localhost:3000')) {
        console.log('  ✅ sw.js accesible y sin localhost hardcodeado');
        return true;
      } else {
        errors.push('sw.js contiene localhost hardcodeado');
        console.error('  ❌ sw.js contiene localhost');
        return false;
      }
    } else {
      errors.push(`sw.js devuelve HTTP ${response.statusCode}`);
      console.error(`  ❌ sw.js devuelve HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    errors.push(`Error verificando SW: ${error.message}`);
    console.error(`  ❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Test 4: Verificar CORS preflight
 */
async function testCORSPreflight() {
  console.log('\n[4/5] Verificando CORS preflight...');
  
  try {
    const response = await makeRequest(`${DEPLOY_URL}/.netlify/functions/chat`, {
      method: 'OPTIONS',
      headers: {
        'Origin': DEPLOY_URL,
        'Access-Control-Request-Method': 'POST'
      }
    });
    
    if (response.statusCode === 200) {
      const hasCORSHeaders = response.headers['access-control-allow-origin'] &&
                             response.headers['access-control-allow-methods'];
      
      if (hasCORSHeaders) {
        console.log('  ✅ CORS preflight funciona correctamente');
        return true;
      } else {
        warnings.push('CORS preflight no devuelve headers correctos');
        console.warn('  ⚠️ CORS headers podrían estar incompletos');
        return true; // No crítico
      }
    } else {
      warnings.push(`CORS preflight devuelve HTTP ${response.statusCode}`);
      console.warn(`  ⚠️ CORS preflight devuelve HTTP ${response.statusCode}`);
      return true; // No crítico, puede ser configuración de Netlify
    }
  } catch (error) {
    warnings.push(`Error verificando CORS: ${error.message}`);
    console.warn(`  ⚠️ Error: ${error.message}`);
    return true; // No crítico
  }
}

/**
 * Test 5: Verificar API Client Wrapper accesible
 */
async function testAPIClientWrapper() {
  console.log('\n[5/5] Verificando API Client Wrapper...');
  
  try {
    const response = await makeRequest(`${DEPLOY_URL}/js/api-client-wrapper.js`);
    
    if (response.statusCode === 200) {
      if (response.body.includes('SandraAPIClient')) {
        console.log('  ✅ api-client-wrapper.js accesible');
        return true;
      } else {
        warnings.push('api-client-wrapper.js podría estar incompleto');
        console.warn('  ⚠️ api-client-wrapper.js podría estar incompleto');
        return true;
      }
    } else {
      warnings.push(`api-client-wrapper.js devuelve HTTP ${response.statusCode}`);
      console.warn(`  ⚠️ api-client-wrapper.js devuelve HTTP ${response.statusCode}`);
      return true;
    }
  } catch (error) {
    warnings.push(`Error verificando API Client: ${error.message}`);
    console.warn(`  ⚠️ Error: ${error.message}`);
    return true;
  }
}

/**
 * Ejecutar todos los tests
 */
async function runTests() {
  console.log(`🌐 Testing deployment en: ${DEPLOY_URL}\n`);
  
  await testSiteOnline();
  await testManifest();
  await testServiceWorker();
  await testCORSPreflight();
  await testAPIClientWrapper();
  
  // Resultados
  console.log('\n📊 RESULTADOS:\n');
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ TODOS LOS E2E TESTS PASARON\n');
    console.log('🚀 Deployment validado exitosamente\n');
    process.exit(0);
  } else {
    if (errors.length > 0) {
      console.error('🔴 ERRORES CRÍTICOS:');
      errors.forEach(error => console.error(`   ❌ ${error}`));
      console.error('');
    }
    
    if (warnings.length > 0) {
      console.warn('🟡 ADVERTENCIAS:');
      warnings.forEach(warning => console.warn(`   ⚠️ ${warning}`));
      console.warn('');
    }
    
    if (errors.length > 0) {
      console.error('❌ E2E TESTS FALLARON\n');
      process.exit(1);
    } else {
      console.warn('⚠️ E2E tests pasaron con advertencias\n');
      process.exit(0);
    }
  }
}

// Ejecutar
runTests().catch(error => {
  console.error('❌ Error ejecutando E2E tests:', error);
  process.exit(1);
});

