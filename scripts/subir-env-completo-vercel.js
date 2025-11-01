/**
 * Sube TODAS las variables del .env.vercel a Vercel
 * Usa la API directamente con el Project ID y Token
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

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

async function uploadVariable(token, projectId, teamId, key, value, env) {
  try {
    // Crear variable
    const createUrl = teamId 
      ? `https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`
      : `https://api.vercel.com/v9/projects/${projectId}/env`;
    
    await axios.post(
      createUrl,
      {
        key: key,
        value: value,
        target: [env],
        type: 'encrypted'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { success: true, action: 'created' };
  } catch (error) {
    // Si ya existe (409), actualizar
    if (error.response?.status === 409 || error.response?.status === 400) {
      try {
        // Obtener variable existente
        const listUrl = teamId
          ? `https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`
          : `https://api.vercel.com/v9/projects/${projectId}/env`;
        
        const envsRes = await axios.get(listUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const existingVar = envsRes.data?.envs?.find(e => 
          e.key === key && (e.target.includes(env) || e.target.length === 0)
        );

        if (existingVar) {
          // Actualizar
          const updateUrl = teamId
            ? `https://api.vercel.com/v1/projects/${projectId}/env/${existingVar.id}?teamId=${teamId}`
            : `https://api.vercel.com/v1/projects/${projectId}/env/${existingVar.id}`;
          
          await axios.patch(
            updateUrl,
            { 
              value: value,
              target: [env]
            },
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          
          return { success: true, action: 'updated' };
        }
      } catch (updateError) {
        return { 
          success: false, 
          error: updateError.response?.data?.error?.message || updateError.message 
        };
      }
    }
    
    return { 
      success: false, 
      error: error.response?.data?.error?.message || error.message 
    };
  }
}

async function main() {
  log('\n🚀 SUBIENDO TODAS LAS VARIABLES A VERCEL\n', 'cyan');

  try {
    // 1. Token
    const tokenPath = path.join(__dirname, '..', '.vercel-tokens.env');
    let token = 'vck_6vCzQIEaY91ookaipVZdp3ZEl8NlpaA5tabMJQhGLHOGGhehrF1HHRPW';
    
    if (fs.existsSync(tokenPath)) {
      const content = fs.readFileSync(tokenPath, 'utf8');
      const match = content.match(/VERCEL_API_TOKEN=([^\s\n]+)/);
      if (match) token = match[1];
    }

    log('✅ Token de Vercel configurado', 'green');

    // 2. Project ID
    const projectId = 'prj_j0oMCNvOgiMauVLQrYIkaHFymn8o';
    log(`✅ Project ID: ${projectId}`, 'green');

    // 3. Leer variables del archivo env-para-vercel.txt o VARIABLESWEB.txt
    const possiblePaths = [
      path.join(__dirname, '..', 'env-para-vercel.txt'),
      path.join(__dirname, '..', '.env.vercel'),
      'C:\\Users\\clayt\\CLEANUP_TEMP\\DESKTOP_REMOVED\\VARIABLESWEB.txt'
    ];
    
    let envPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        envPath = p;
        break;
      }
    }
    
    if (!envPath) {
      log(`❌ No se encontró archivo de variables en:`, 'red');
      possiblePaths.forEach(p => log(`   ${p}`, 'yellow'));
      return;
    }

    log('\n📋 Leyendo variables del archivo .env.vercel...', 'yellow');
    
    const content = fs.readFileSync(envPath, 'utf8');
    const variables = {};
    
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          // Remover comillas
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          variables[key] = value;
        }
      }
    });

    log(`✅ ${Object.keys(variables).length} variables encontradas`, 'green');

    // 4. Obtener teamId si es necesario
    let teamId = null;
    
    try {
      // Intentar obtener info del proyecto
      const projectRes = await axios.get(
        `https://api.vercel.com/v9/projects/${projectId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (projectRes.data) {
        teamId = projectRes.data.teamId || projectRes.data.team?.id || null;
        if (teamId) {
          log(`✅ Team ID: ${teamId}`, 'green');
        } else {
          log('✅ Proyecto personal (sin team)', 'green');
        }
      }
    } catch (error) {
      // Si falla, intentar obtener teams
      if (error.response?.status === 404 || error.response?.status === 403) {
        try {
          const teamsRes = await axios.get('https://api.vercel.com/v2/teams', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const teams = teamsRes.data?.teams || [];
          if (teams.length > 0) {
            // Intentar con el primer team
            for (const team of teams) {
              try {
                const testRes = await axios.get(
                  `https://api.vercel.com/v9/projects/${projectId}?teamId=${team.id}`,
                  { headers: { 'Authorization': `Bearer ${token}` } }
                );
                if (testRes.data) {
                  teamId = team.id;
                  log(`✅ Team ID encontrado: ${team.name || team.slug}`, 'green');
                  break;
                }
              } catch (teamErr) {
                // Continuar
              }
            }
          }
        } catch (teamsErr) {
          // Continuar sin teamId
        }
      }
    }

    // 5. Subir variables
    log('\n📋 Subiendo variables a Vercel...\n', 'yellow');

    const environments = ['production', 'preview', 'development'];
    let totalSuccess = 0;
    let totalErrors = 0;
    const results = [];

    for (const [key, value] of Object.entries(variables)) {
      log(`📦 ${key}`, 'cyan');
      
      for (const env of environments) {
        const result = await uploadVariable(token, projectId, teamId, key, value, env);
        
        if (result.success) {
          log(`   ✅ ${env} - ${result.action}`, 'green');
          totalSuccess++;
        } else {
          log(`   ❌ ${env} - ${result.error}`, 'red');
          totalErrors++;
          results.push({ key, env, error: result.error });
        }
      }
      
      log('', 'reset'); // Línea vacía
    }

    // 6. Resumen
    log('\n' + '='.repeat(60) + '\n', 'cyan');
    log(`✨ RESUMEN FINAL\n`, 'cyan');
    log(`✅ Variables configuradas: ${totalSuccess}`, 'green');
    
    if (totalErrors > 0) {
      log(`⚠️  Errores: ${totalErrors}`, 'yellow');
      
      if (results.length > 0 && results[0].error.includes('Project not found')) {
        log('\n⚠️  El Project ID parece incorrecto o el token no tiene permisos', 'yellow');
        log('   Configura manualmente en Vercel Dashboard:\n', 'cyan');
        log('   https://vercel.com/dashboard → Tu proyecto → Settings → Environment Variables\n', 'white');
        
        log('   Copia y pega estas variables:\n', 'cyan');
        Object.entries(variables).forEach(([key, val]) => {
          log(`   ${key}=${val}`, 'green');
        });
      }
    } else {
      log('\n🎉 ¡Todas las variables configuradas exitosamente!\n', 'green');
      log('📝 Próximos pasos:', 'cyan');
      log('   1. Verifica en Vercel Dashboard > Settings > Environment Variables', 'white');
      log('   2. Haz Redeploy del proyecto', 'white');
      log('   3. Configura webhooks en Twilio Dashboard', 'white');
      log('   4. ¡Prueba el chatbot! 🎉', 'white');
    }

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

main();

