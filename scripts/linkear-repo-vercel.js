/**
 * Linkea el repositorio de GitHub con Vercel
 * Conecta el repo para deploys automáticos
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n🔗 LINKEANDO REPOSITORIO CON VERCEL\n', 'cyan');

  // Leer token
  const tokenPath = path.join(__dirname, '..', '.vercel-tokens.env');
  let token = null;
  
  if (fs.existsSync(tokenPath)) {
    const content = fs.readFileSync(tokenPath, 'utf8');
    const accessTokenMatch = content.match(/VERCEL_ACCESS_TOKEN=([^\s\n]+)/);
    if (accessTokenMatch) {
      token = accessTokenMatch[1];
    }
  }

  if (!token) {
    token = 'vck_6vCzQIEaY91ookaipVZdp3ZEl8NlpaA5tabMJQhGLHOGGhehrF1HHRPW';
  }

  const projectId = 'prj_j0oMCNvOgiMauVLQrYIkaHFymn8o';
  const repoUrl = 'https://github.com/GUESTVALENCIA/IA-SANDRA';
  const repoName = 'GUESTVALENCIA/IA-SANDRA';

  log('✅ Token configurado', 'green');
  log(`📋 Project ID: ${projectId}`, 'cyan');
  log(`📋 Repositorio: ${repoUrl}\n`, 'cyan');

  // Obtener información del proyecto
  log('📋 Obteniendo información del proyecto...', 'yellow');
  
  let teamId = null;
  let projectName = null;

  try {
    const projectRes = await axios.get(`https://api.vercel.com/v9/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (projectRes.data) {
      projectName = projectRes.data.name;
      teamId = projectRes.data.teamId;
      log(`✅ Proyecto: ${projectName}`, 'green');
      if (teamId) {
        log(`✅ Team ID: ${teamId}`, 'green');
      }
      
      // Verificar si ya está linkeado
      if (projectRes.data.link) {
        log(`\n📋 Repositorio ya linkeado:`, 'yellow');
        log(`   Tipo: ${projectRes.data.link.type}`, 'cyan');
        log(`   Repo: ${projectRes.data.link.repo}`, 'cyan');
        log(`   Org: ${projectRes.data.link.org}`, 'cyan');
        
        if (projectRes.data.link.repo === repoName) {
          log(`\n✅ El repositorio ya está correctamente linkeado!`, 'green');
          return;
        }
      }
    }
  } catch (error) {
    log(`⚠️  Error obteniendo proyecto: ${error.message}`, 'yellow');
    if (error.response?.data) {
      log(`   Detalles: ${JSON.stringify(error.response.data)}`, 'yellow');
    }
  }

  // Linkear el repositorio
  log('\n📋 Linkeando repositorio...', 'yellow');

  try {
    const linkUrl = teamId
      ? `https://api.vercel.com/v10/projects/${projectId}/link?teamId=${teamId}`
      : `https://api.vercel.com/v10/projects/${projectId}/link`;

    log(`   URL: ${linkUrl}`, 'cyan');
    log(`   Repo: ${repoName}`, 'cyan');

    const response = await axios.patch(
      linkUrl,
      {
        type: 'github',
        repo: repoName,
        repoId: null // Vercel lo detectará automáticamente
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data) {
      log(`\n✅ Repositorio linkeado exitosamente!`, 'green');
      log(`\n📋 Detalles:`, 'cyan');
      log(`   Tipo: ${response.data.type || 'github'}`, 'white');
      log(`   Repo: ${response.data.repo || repoName}`, 'white');
      if (response.data.org) {
        log(`   Org: ${response.data.org}`, 'white');
      }
      
      log(`\n✨ Ahora los deploys serán automáticos desde GitHub!`, 'green');
      log(`   - Cada push a main desplegará automáticamente`, 'white');
      log(`   - Pull requests generarán previews`, 'white');
      log(`   - Todo gratis desde GitHub 🎉`, 'white');
    }

  } catch (error) {
    if (error.response?.status === 400) {
      const errorMsg = error.response.data?.error?.message || 'Bad Request';
      log(`\n⚠️  Error: ${errorMsg}`, 'yellow');
      
      if (errorMsg.includes('already linked')) {
        log(`\n✅ El repositorio ya está linkeado`, 'green');
      } else if (errorMsg.includes('repository') || errorMsg.includes('repo')) {
        log(`\n💡 Intenta linkear desde Vercel Dashboard:`, 'cyan');
        log(`   1. Ve a: https://vercel.com/dashboard`, 'white');
        log(`   2. Selecciona tu proyecto: ${projectName || projectId}`, 'white');
        log(`   3. Settings → Git`, 'white');
        log(`   4. Conecta tu repositorio de GitHub`, 'white');
      }
    } else if (error.response?.status === 401) {
      log(`\n❌ Error de autenticación`, 'red');
      log(`   Verifica que el token sea válido`, 'yellow');
    } else if (error.response?.status === 403) {
      log(`\n❌ Permisos insuficientes`, 'red');
      log(`   El token puede no tener permisos para linkear repositorios`, 'yellow');
      log(`\n💡 Solución: Linkea manualmente desde Vercel Dashboard`, 'cyan');
      log(`   1. Ve a: https://vercel.com/dashboard`, 'white');
      log(`   2. Settings → Git → Connect Git Repository`, 'white');
      log(`   3. Selecciona: ${repoName}`, 'white');
    } else {
      log(`\n❌ Error: ${error.response?.status || error.message}`, 'red');
      if (error.response?.data) {
        log(`   Detalles: ${JSON.stringify(error.response.data, null, 2)}`, 'yellow');
      }
      
      log(`\n💡 Linkea manualmente desde Vercel Dashboard:`, 'cyan');
      log(`   1. Ve a: https://vercel.com/dashboard`, 'white');
      log(`   2. Settings → Git`, 'white');
      log(`   3. Connect Git Repository`, 'white');
      log(`   4. Selecciona: ${repoName}`, 'white');
    }
  }

  log('\n');
}

main();

