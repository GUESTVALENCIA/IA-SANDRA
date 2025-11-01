/**
 * Sube Variables usando VERCEL_ACCESS_TOKEN
 * Token alternativo que puede tener más permisos
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
  log('\n🚀 SUBIENDO VARIABLES A VERCEL (ACCESS TOKEN)\n', 'cyan');

  // Intentar con ACCESS_TOKEN primero
  const tokenPath = path.join(__dirname, '..', '.vercel-tokens.env');
  let token = null;
  
  if (fs.existsSync(tokenPath)) {
    const content = fs.readFileSync(tokenPath, 'utf8');
    const accessTokenMatch = content.match(/VERCEL_ACCESS_TOKEN=([^\s\n]+)/);
    if (accessTokenMatch) {
      token = accessTokenMatch[1];
      log('✅ VERCEL_ACCESS_TOKEN encontrado', 'green');
    }
  }

  // Si no hay ACCESS_TOKEN, usar API_TOKEN
  if (!token) {
    token = 'vck_6vCzQIEaY91ookaipVZdp3ZEl8NlpaA5tabMJQhGLHOGGhehrF1HHRPW';
    log('✅ Usando VERCEL_API_TOKEN', 'green');
  }

  // Project ID - buscará automáticamente el proyecto correcto
  let projectId = 'prj_j0oMCNvOgiMauVLQrYIkaHFymn8o';

  const variables = [
    { key: 'TWILIO_ACCOUNT_SID', value: 'AC38300ea2b028ab4a55d6487f6451f69b' },
    { key: 'TWILIO_AUTH_TOKEN', value: '5502a7df0779ba9124318c4e0543d695' },
    { key: 'TWILIO_PHONE_NUMBER', value: '+18577608754' },
    { key: 'TWILIO_WHATSAPP_NUMBER', value: 'whatsapp:+18577608754' }
  ];

  log(`📋 Project ID: ${projectId}\n`, 'cyan');

  // Intentar obtener proyectos primero para verificar acceso
  log('📋 Verificando acceso a proyectos...', 'yellow');
  
  try {
    const projectsRes = await axios.get('https://api.vercel.com/v9/projects', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const projects = projectsRes.data?.projects || [];
    log(`✅ ${projects.length} proyecto(s) encontrado(s)`, 'green');

    if (projects.length > 0) {
      // Buscar proyecto por ID primero
      let targetProject = projects.find(p => p.id === projectId);
      
      // Si no lo encuentra por ID, buscar por nombre
      if (!targetProject) {
        targetProject = projects.find(p => 
          p.name?.toLowerCase().includes('sandra') ||
          p.name?.toLowerCase().includes('ia-sandra') ||
          p.name?.toLowerCase().includes('guestsvalencia')
        );
      }
      
      if (targetProject) {
        // Usar el Project ID real del proyecto encontrado
        projectId = targetProject.id;
        log(`✅ Proyecto objetivo encontrado: ${targetProject.name}`, 'green');
        log(`   ID: ${projectId}`, 'cyan');
        if (targetProject.teamId) {
          log(`   Team ID: ${targetProject.teamId}`, 'cyan');
        }
      } else {
        log(`⚠️  Project ID ${projectId} no encontrado en la lista`, 'yellow');
        log('   Proyectos disponibles:', 'cyan');
        projects.slice(0, 5).forEach(p => {
          log(`   - ${p.name} (${p.id})`, 'white');
        });
        log('\n   Usando Project ID proporcionado de todas formas...', 'yellow');
      }
    }
  } catch (error) {
    log(`⚠️  Error verificando proyectos: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`, 'yellow');
  }

  log('\n📋 Subiendo variables...\n', 'yellow');

  const environments = ['production', 'preview', 'development'];
  let success = 0;
  let errors = 0;

  // Intentar con diferentes combinaciones de URLs
  const urlVariants = [
    `https://api.vercel.com/v9/projects/${projectId}/env`,
    `https://api.vercel.com/v10/projects/${projectId}/env`,
  ];

  for (const { key, value } of variables) {
    for (const env of environments) {
      let uploaded = false;

      for (const baseUrl of urlVariants) {
        if (uploaded) break;

        try {
          await axios.post(
            baseUrl,
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
          
          log(`   ✅ ${key} (${env})`, 'green');
          success++;
          uploaded = true;
        } catch (error) {
          if (error.response?.status === 409 || error.response?.status === 400) {
            // Variable existe, intentar actualizar
            try {
              const envsRes = await axios.get(baseUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
              });

              const existingVar = envsRes.data?.envs?.find(e => 
                e.key === key && (e.target.includes(env) || e.target.length === 0)
              );

              if (existingVar) {
                await axios.patch(
                  `https://api.vercel.com/v1/projects/${projectId}/env/${existingVar.id}`,
                  { value: value, target: [env] },
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  }
                );
                
                log(`   ✅ ${key} (${env}) - Actualizado`, 'green');
                success++;
                uploaded = true;
              }
            } catch (updateError) {
              // Continuar con siguiente variant
            }
          } else if (error.response?.status !== 404) {
            // Si no es 404, puede ser otro error, continuar con siguiente variant
            continue;
          }
        }
      }

      if (!uploaded) {
        const errorMsg = 'Project not found o sin permisos';
        log(`   ❌ ${key} (${env}): ${errorMsg}`, 'red');
        errors++;
      }
    }
  }

  log(`\n✨ COMPLETADO: ${success} variables configuradas, ${errors} errores\n`, 
      success > 0 ? 'green' : 'yellow');

  if (success === 0) {
    log('⚠️  No se pudieron subir automáticamente', 'yellow');
    log('\n📝 Usa el archivo .env creado:', 'cyan');
    log('   1. Abre: env-para-vercel.env', 'white');
    log('   2. Copia todo el contenido', 'white');
    log('   3. Ve a Vercel Dashboard → Tu proyecto → Settings → Environment Variables', 'white');
    log('   4. Haz clic en "Create new" o pega el contenido del archivo .env', 'white');
    log('   5. Selecciona: Production, Preview, Development', 'white');
    log('   6. Save y Redeploy\n', 'white');
  } else {
    log('📝 Próximos pasos:', 'cyan');
    log('   1. Verifica en Vercel Dashboard', 'white');
    log('   2. Haz Redeploy', 'white');
    log('   3. Configura webhooks en Twilio', 'white');
    log('   4. ¡Prueba! 🎉', 'white');
  }
}

main();

