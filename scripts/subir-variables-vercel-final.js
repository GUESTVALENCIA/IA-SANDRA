/**
 * Script Final para Subir Variables Twilio a Vercel
 * Lee del archivo VARIABLESWEB.txt y sube usando tokens de Vercel
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');

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

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function uploadToVercel(token, projectId, teamId, variables) {
  const environments = ['production', 'preview', 'development'];
  let success = 0;
  let errors = 0;

  log('\n📋 Subiendo variables a Vercel...', 'yellow');

  for (const [key, value] of Object.entries(variables)) {
    if (!key.includes('TWILIO')) continue;
    
    for (const env of environments) {
      try {
        await axios.post(
          `https://api.vercel.com/v9/projects/${projectId}/env${teamId ? `?teamId=${teamId}` : ''}`,
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
      } catch (error) {
        if (error.response?.status === 409 || error.response?.status === 400) {
          try {
            const envsRes = await axios.get(
              `https://api.vercel.com/v9/projects/${projectId}/env${teamId ? `?teamId=${teamId}` : ''}`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const existingVar = envsRes.data?.envs?.find(e => 
              e.key === key && (e.target.includes(env) || e.target.length === 0)
            );

            if (existingVar) {
              await axios.patch(
                `https://api.vercel.com/v1/projects/${projectId}/env/${existingVar.id}${teamId ? `?teamId=${teamId}` : ''}`,
                { value: value, target: [env] },
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              log(`   ✅ ${key} (${env}) - Actualizado`, 'green');
              success++;
            }
          } catch (updateError) {
            log(`   ⚠️  ${key} (${env}): ${updateError.response?.data?.error?.message || updateError.message}`, 'yellow');
            errors++;
          }
        } else {
          log(`   ❌ ${key} (${env}): ${error.response?.data?.error?.message || error.message}`, 'red');
          errors++;
        }
      }
    }
  }

  return { success, errors };
}

async function main() {
  log('\n🚀 SUBIENDO VARIABLES TWILIO A VERCEL\n', 'cyan');

  try {
    // 1. Leer token
    const tokenPath = path.join(__dirname, '..', '.vercel-tokens.env');
    let token = 'vck_6vCzQIEaY91ookaipVZdp3ZEl8NlpaA5tabMJQhGLHOGGhehrF1HHRPW';
    
    if (fs.existsSync(tokenPath)) {
      const content = fs.readFileSync(tokenPath, 'utf8');
      const match = content.match(/VERCEL_API_TOKEN=([^\s\n]+)/);
      if (match) token = match[1];
    }

    log('✅ Token de Vercel encontrado', 'green');

    // 2. Variables Twilio del archivo
    const twilioVars = {
      'TWILIO_ACCOUNT_SID': 'AC38300ea2b028ab4a55d6487f6451f69b',
      'TWILIO_PHONE_NUMBER': '+18577608754',
      'TWILIO_WHATSAPP_NUMBER': 'whatsapp:+18577608754'
    };

    log('\n📋 Variables Twilio encontradas:', 'yellow');
    Object.entries(twilioVars).forEach(([key, val]) => {
      log(`   ${key} = ${val.substring(0, 20)}...`, 'cyan');
    });

    // 3. Pedir TWILIO_AUTH_TOKEN si falta
    if (!twilioVars['TWILIO_AUTH_TOKEN']) {
      log('\n⚠️  Falta TWILIO_AUTH_TOKEN', 'yellow');
      const authToken = await askQuestion('   Ingresa el TWILIO_AUTH_TOKEN (o presiona Enter para saltar): ');
      if (authToken.trim()) {
        twilioVars['TWILIO_AUTH_TOKEN'] = authToken.trim();
      } else {
        log('   ⚠️  Continuando sin AUTH_TOKEN (necesario para funcionar)', 'yellow');
      }
    }

    // 4. Obtener Project ID
    log('\n📋 Obteniendo proyectos...', 'yellow');
    
    let projects = [];
    try {
      const projectsRes = await axios.get('https://api.vercel.com/v9/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      projects = projectsRes.data?.projects || [];
    } catch (error) {
      log(`⚠️  Error: ${error.message}`, 'yellow');
    }

    let projectId = null;
    let teamId = null;

    if (projects.length > 0) {
      log(`✅ ${projects.length} proyecto(s) encontrado(s)`, 'green');
      const project = projects.find(p => 
        p.name?.toLowerCase().includes('sandra') || 
        p.name?.toLowerCase().includes('ia-sandra')
      ) || projects[0];
      
      projectId = project.id;
      teamId = project.teamId;
      log(`✅ Proyecto seleccionado: ${project.name}`, 'green');
    } else {
      log('⚠️  No se encontraron proyectos automáticamente', 'yellow');
      const manualId = await askQuestion('   Ingresa el Project ID manualmente (o presiona Enter para saltar): ');
      if (manualId.trim()) {
        projectId = manualId.trim();
      }
    }

    if (!projectId) {
      log('\n❌ No se pudo obtener Project ID', 'red');
      log('\n📝 Variables listas para configurar manualmente en Vercel Dashboard:', 'cyan');
      Object.entries(twilioVars).forEach(([key, val]) => {
        log(`   ${key}=${val}`, 'green');
      });
      return;
    }

    // 5. Subir variables
    const result = await uploadToVercel(token, projectId, teamId, twilioVars);

    log(`\n✨ COMPLETADO: ${result.success} variables configuradas, ${result.errors} errores\n`, 
        result.success > 0 ? 'green' : 'yellow');
    
    log('📝 Próximos pasos:', 'cyan');
    log('   1. Verifica en Vercel Dashboard > Settings > Environment Variables', 'white');
    log('   2. Haz Redeploy del proyecto', 'white');
    log('   3. Configura webhooks en Twilio Dashboard', 'white');
    log('   4. ¡Prueba el chatbot! 🎉', 'white');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
    }
  }
}

main();

