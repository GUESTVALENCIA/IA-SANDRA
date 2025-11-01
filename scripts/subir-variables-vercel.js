/**
 * Sube Variables Twilio a Vercel
 * Lee del .env y usa tokens de acceso personal
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

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
  log('\n🚀 SUBIENDO VARIABLES TWILIO A VERCEL\n', 'cyan');

  try {
    // 1. Leer token de Vercel
    const tokenPath = path.join(__dirname, '..', '.vercel-tokens.env');
    let token = null;
    
    if (fs.existsSync(tokenPath)) {
      const content = fs.readFileSync(tokenPath, 'utf8');
      const match = content.match(/VERCEL_API_TOKEN=([^\s\n]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      log('❌ Token de Vercel no encontrado', 'red');
      return;
    }

    log('✅ Token de Vercel encontrado', 'green');

    // 2. Leer variables del .env
    const envPath = path.join(__dirname, '..', '.env');
    const twilioVars = {};

    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#') && line.toUpperCase().includes('TWILIO')) {
          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim().toUpperCase();
            let value = match[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            twilioVars[key] = value;
          }
        }
      });
    }

    if (Object.keys(twilioVars).length === 0) {
      log('❌ No se encontraron variables Twilio en .env', 'red');
      log('   Asegúrate de tener estas variables:', 'yellow');
      log('   - TWILIO_ACCOUNT_SID', 'cyan');
      log('   - TWILIO_AUTH_TOKEN', 'cyan');
      log('   - TWILIO_PHONE_NUMBER', 'cyan');
      log('   - TWILIO_WHATSAPP_NUMBER', 'cyan');
      return;
    }

    log(`✅ ${Object.keys(twilioVars).length} variables Twilio encontradas:`, 'green');
    Object.keys(twilioVars).forEach(key => {
      const val = twilioVars[key];
      log(`   ${key} = ${val.substring(0, 15)}...`, 'cyan');
    });

    // 3. Obtener proyectos
    log('\n📋 Obteniendo proyectos de Vercel...', 'yellow');
    
    const projectsRes = await axios.get('https://api.vercel.com/v9/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const projects = projectsRes.data?.projects || [];
    if (projects.length === 0) {
      log('❌ No se encontraron proyectos', 'red');
      return;
    }

    const project = projects.find(p => 
      p.name?.toLowerCase().includes('sandra') || 
      p.name?.toLowerCase().includes('ia-sandra')
    ) || projects[0];

    log(`✅ Proyecto seleccionado: ${project.name} (${project.id})`, 'green');

    // 4. Subir variables
    log('\n📋 Subiendo variables a Vercel...', 'yellow');

    const environments = ['production', 'preview', 'development'];
    let success = 0;
    let errors = 0;

    for (const [key, value] of Object.entries(twilioVars)) {
      for (const env of environments) {
        try {
          await axios.post(
            `https://api.vercel.com/v9/projects/${project.id}/env${project.teamId ? `?teamId=${project.teamId}` : ''}`,
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
          // Si ya existe, actualizar
          if (error.response?.status === 409 || error.response?.status === 400) {
            try {
              // Obtener variable existente
              const envsRes = await axios.get(
                `https://api.vercel.com/v9/projects/${project.id}/env${project.teamId ? `?teamId=${project.teamId}` : ''}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
              );

              const existingVar = envsRes.data?.envs?.find(e => 
                e.key === key && (e.target.includes(env) || e.target.length === 0)
              );

              if (existingVar) {
                await axios.patch(
                  `https://api.vercel.com/v1/projects/${project.id}/env/${existingVar.id}${project.teamId ? `?teamId=${project.teamId}` : ''}`,
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

    log(`\n✨ COMPLETADO: ${success} variables configuradas, ${errors} errores\n`, success > 0 ? 'green' : 'yellow');
    log('📝 Próximos pasos:', 'cyan');
    log('   1. Verifica en Vercel Dashboard > Settings > Environment Variables', 'white');
    log('   2. Haz Redeploy del proyecto', 'white');
    log('   3. Configura webhooks en Twilio', 'white');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

main();

