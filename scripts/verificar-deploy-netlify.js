/**
 * Script para verificar deploy en Netlify
 * Usa la API de Netlify para verificar estado del último deploy
 */

const https = require('https');
const { execSync } = require('child_process');

// Configuración
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID || 'grand-pasca-a584d5';
const NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN || '';
const BASE_URL = 'https://sandra.guestsvalencia.es';

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Verificar último commit en GitHub
 */
function getLastCommit() {
  try {
    const commit = execSync('git log -1 --oneline', { encoding: 'utf-8' }).trim();
    return commit;
  } catch (error) {
    log('Error obteniendo último commit', 'red');
    return null;
  }
}

/**
 * Verificar sitio público
 */
function verifySite() {
  return new Promise((resolve) => {
    const url = new URL('/.netlify/functions/health', BASE_URL);
    
    https.get(url, { timeout: 5000 }, (res) => {
      const statusCode = res.statusCode;
      resolve({
        online: statusCode === 200,
        statusCode,
        url: BASE_URL
      });
    }).on('error', () => {
      resolve({
        online: false,
        statusCode: 0,
        url: BASE_URL
      });
    });
  });
}

/**
 * Verificar deploy en Netlify API
 */
function verifyNetlifyDeploy() {
  if (!NETLIFY_AUTH_TOKEN) {
    log('⚠️  NETLIFY_AUTH_TOKEN no configurado - verificación manual requerida', 'yellow');
    return verifySite();
  }

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.netlify.com',
      path: `/api/v1/sites/${NETLIFY_SITE_ID}/deploys?per_page=1`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
        'User-Agent': 'Sandra-Deploy-Verifier'
      }
    };

    https.get(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const deploys = JSON.parse(data);
          if (Array.isArray(deploys) && deploys.length > 0) {
            const latestDeploy = deploys[0];
            resolve({
              id: latestDeploy.id,
              state: latestDeploy.state,
              created_at: latestDeploy.created_at,
              published_at: latestDeploy.published_at,
              commit_ref: latestDeploy.commit_ref,
              branch: latestDeploy.branch
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          log('Error parsing Netlify API response', 'red');
          resolve(null);
        }
      });
    }).on('error', (error) => {
      log('Error connecting to Netlify API', 'red');
      resolve(null);
    });
  });
}

/**
 * Main verification function
 */
async function verifyDeploy() {
  log('\n🔍 VERIFICANDO DEPLOY EN NETLIFY...\n', 'cyan');

  // 1. Verificar último commit
  const lastCommit = getLastCommit();
  if (lastCommit) {
    log(`📝 Último commit: ${lastCommit}`, 'cyan');
  }

  // 2. Esperar 6-8 segundos (tiempo normal de deploy)
  log('⏳ Esperando 6 segundos para que Netlify procese el deploy...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 6000));

  // 3. Verificar sitio público
  log('\n🌐 Verificando sitio público...', 'cyan');
  const siteStatus = await verifySite();
  
  if (siteStatus.online) {
    log(`✅ Sitio online: ${siteStatus.url} (${siteStatus.statusCode})`, 'green');
  } else {
    log(`❌ Sitio no responde: ${siteStatus.url}`, 'red');
  }

  // 4. Verificar deploy en Netlify API (si token disponible)
  log('\n📊 Verificando deploy en Netlify API...', 'cyan');
  const deployInfo = await verifyNetlifyDeploy();
  
  if (deployInfo) {
    log(`✅ Último deploy:`, 'green');
    log(`   ID: ${deployInfo.id}`, 'cyan');
    log(`   Estado: ${deployInfo.state}`, deployInfo.state === 'ready' ? 'green' : 'yellow');
    log(`   Branch: ${deployInfo.branch}`, 'cyan');
    log(`   Commit: ${deployInfo.commit_ref?.substring(0, 7) || 'N/A'}`, 'cyan');
    log(`   Creado: ${deployInfo.created_at}`, 'cyan');
    if (deployInfo.published_at) {
      log(`   Publicado: ${deployInfo.published_at}`, 'green');
    }
    
    if (deployInfo.state === 'ready' || deployInfo.state === 'published') {
      log('\n✅ DEPLOY COMPLETADO Y PUBLICADO', 'green');
      return true;
    } else if (deployInfo.state === 'building') {
      log('\n⏳ DEPLOY EN PROGRESO (building)', 'yellow');
      log('   Espera unos segundos más...', 'yellow');
      return false;
    } else {
      log(`\n⚠️  DEPLOY EN ESTADO: ${deployInfo.state}`, 'yellow');
      return false;
    }
  } else {
    log('⚠️  No se pudo verificar via API (usar verificación manual)', 'yellow');
    // Si el sitio está online, considerar deploy exitoso
    if (siteStatus.online) {
      log('✅ Sitio está online - deploy probablemente exitoso', 'green');
      return true;
    }
    return false;
  }
}

// Ejecutar verificación
if (require.main === module) {
  verifyDeploy()
    .then(success => {
      if (success) {
        log('\n✅ VERIFICACIÓN COMPLETA - DEPLOY EXITOSO\n', 'green');
        process.exit(0);
      } else {
        log('\n⚠️  VERIFICACIÓN: Deploy puede estar en progreso\n', 'yellow');
        log('   Verifica manualmente en Netlify Dashboard:', 'yellow');
        log('   https://app.netlify.com/\n', 'cyan');
        process.exit(1);
      }
    })
    .catch(error => {
      log('\n❌ Error durante verificación:', 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { verifyDeploy, verifySite, verifyNetlifyDeploy };

