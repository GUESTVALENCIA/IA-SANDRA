/**
 * Agrega Dominio a Vercel Automáticamente
 * Usa la API de Vercel para agregar el dominio
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n🚀 AGREGANDO DOMINIO A VERCEL AUTOMÁTICAMENTE\n', 'cyan');

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

  // Dominios a agregar (ajusta según tu necesidad)
  const dominios = [
    'sandra.guestsvalencia.es',
    'www.sandra.guestsvalencia.es'
  ];

  log('✅ Token configurado', 'green');
  log(`📋 Project ID: ${projectId}`, 'cyan');
  log(`📋 Dominios a agregar: ${dominios.join(', ')}\n`, 'cyan');

  // Obtener teamId si existe
  let teamId = null;
  try {
    const projectRes = await axios.get(`https://api.vercel.com/v9/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (projectRes.data) {
      teamId = projectRes.data.teamId;
      if (teamId) {
        log(`✅ Team ID: ${teamId}\n`, 'green');
      }
    }
  } catch (error) {
    // Continuar sin teamId
  }

  log('📋 Agregando dominios...\n', 'yellow');

  for (const dominio of dominios) {
    try {
      const addUrl = teamId
        ? `https://api.vercel.com/v9/projects/${projectId}/domains?teamId=${teamId}`
        : `https://api.vercel.com/v9/projects/${projectId}/domains`;

      const response = await axios.post(
        addUrl,
        { name: dominio },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      log(`   ✅ ${dominio} agregado`, 'green');
      
      // Si hay instrucciones de verificación
      if (response.data?.verification) {
        log(`   📋 Instrucciones de verificación:`, 'cyan');
        if (response.data.verification.type === 'dns') {
          log(`      Tipo: ${response.data.verification.type}`, 'white');
          log(`      Registro DNS necesario:`, 'white');
          if (response.data.verification.domain) {
            log(`         ${response.data.verification.domain}`, 'cyan');
          }
        }
      }

    } catch (error) {
      if (error.response?.status === 409) {
        log(`   ⚠️  ${dominio} ya existe`, 'yellow');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error?.message || 'Invalid domain';
        log(`   ❌ ${dominio}: ${errorMsg}`, 'red');
      } else {
        log(`   ❌ ${dominio}: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`, 'red');
      }
    }
  }

  log('\n📝 Próximos pasos:', 'cyan');
  log('   1. Ve a Vercel Dashboard → Settings → Domains', 'white');
  log('   2. Verifica que los dominios aparezcan', 'white');
  log('   3. Sigue las instrucciones de verificación DNS', 'white');
  log('   4. Configura los registros DNS en tu proveedor de dominio', 'white');
  log('   5. Espera la verificación (puede tardar unos minutos)', 'white');
  log('   6. ¡Tu dominio estará en producción! 🎉', 'white');
}

main();

