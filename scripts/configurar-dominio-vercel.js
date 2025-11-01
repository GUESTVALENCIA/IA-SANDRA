/**
 * Configura Dominio en Vercel para Producción
 * Conecta el dominio personalizado con el proyecto
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
  log('\n🚀 CONFIGURANDO DOMINIO EN VERCEL PARA PRODUCCIÓN\n', 'cyan');

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

  log('✅ Token configurado', 'green');
  log(`📋 Project ID: ${projectId}\n`, 'cyan');

  // Obtener información del proyecto
  log('📋 Obteniendo información del proyecto...', 'yellow');
  
  let projectName = null;
  let teamId = null;
  let currentDomains = [];

  try {
    const projectRes = await axios.get(`https://api.vercel.com/v9/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (projectRes.data) {
      projectName = projectRes.data.name;
      teamId = projectRes.data.teamId;
      log(`✅ Proyecto: ${projectName}`, 'green');
    }
  } catch (error) {
    log(`⚠️  Error obteniendo proyecto: ${error.message}`, 'yellow');
  }

  // Obtener dominios actuales
  try {
    const domainsUrl = teamId 
      ? `https://api.vercel.com/v9/projects/${projectId}/domains?teamId=${teamId}`
      : `https://api.vercel.com/v9/projects/${projectId}/domains`;

    const domainsRes = await axios.get(domainsUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    currentDomains = domainsRes.data?.domains || [];
    
    if (currentDomains.length > 0) {
      log(`\n📋 Dominios actuales:`, 'yellow');
      currentDomains.forEach(domain => {
        log(`   - ${domain.name} (${domain.verified ? '✅ Verificado' : '⚠️  No verificado'})`, 'cyan');
      });
    } else {
      log('\n📋 No hay dominios configurados aún', 'yellow');
    }
  } catch (error) {
    log(`⚠️  Error obteniendo dominios: ${error.message}`, 'yellow');
  }

  log('\n📝 Para agregar un dominio:', 'cyan');
  log('   1. Ve a: https://vercel.com/dashboard → Tu proyecto → Settings → Domains', 'white');
  log('   2. Haz clic en "Add" o "Add Domain"', 'white');
  log('   3. Ingresa tu dominio (ej: sandra.guestsvalencia.es)', 'white');
  log('   4. Verifica las instrucciones de DNS que Vercel te dará', 'white');
  
  log('\n📋 Instrucciones de DNS que necesitarás:', 'cyan');
  log('   Vercel te dará registros DNS específicos como:', 'white');
  log('   - Tipo A: apunta a una IP de Vercel', 'cyan');
  log('   - Tipo CNAME: apunta a cname.vercel-dns.com', 'cyan');
  log('   - Tipo TXT: para verificación', 'cyan');
  
  log('\n💡 Dominio recomendado:', 'cyan');
  log('   sandra.guestsvalencia.es', 'green');
  log('   o', 'white');
  log('   www.sandra.guestsvalencia.es', 'green');

  log('\n✨ Después de configurar el dominio:', 'cyan');
  log('   1. Espera a que se verifique (puede tardar unos minutos)', 'white');
  log('   2. Vercel emitirá un certificado SSL automáticamente', 'white');
  log('   3. Tu sitio estará disponible en tu dominio personalizado', 'white');
  log('   4. ¡Sandra estará en producción! 🎉', 'white');
}

main();

