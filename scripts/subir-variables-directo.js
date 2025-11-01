/**
 * Script Directo - Sube Variables usando la API de Vercel con Project ID correcto
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

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
  log('\n🚀 SUBIENDO VARIABLES TWILIO A VERCEL (DIRECTO)\n', 'cyan');

  const token = 'vck_6vCzQIEaY91ookaipVZdp3ZEl8NlpaA5tabMJQhGLHOGGhehrF1HHRPW';
  const projectId = 'prj_j0oMCNvOgiMauVLQrYIkaHFymn8o';

  const twilioVars = {
    'TWILIO_ACCOUNT_SID': 'AC38300ea2b028ab4a55d6487f6451f69b',
    'TWILIO_AUTH_TOKEN': '5502a7df0779ba9124318c4e0543d695',
    'TWILIO_PHONE_NUMBER': '+18577608754',
    'TWILIO_WHATSAPP_NUMBER': 'whatsapp:+18577608754'
  };

  log('✅ Token y Project ID configurados', 'green');
  log(`📋 Project ID: ${projectId}\n`, 'cyan');

  const environments = ['production', 'preview', 'development'];
  let success = 0;
  let errors = 0;

  log('📋 Subiendo variables...\n', 'yellow');

  // Intentar sin teamId primero
  for (const [key, value] of Object.entries(twilioVars)) {
    for (const env of environments) {
      try {
        // Intentar crear sin teamId
        await axios.post(
          `https://api.vercel.com/v9/projects/${projectId}/env`,
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
        // Si da 404, puede ser que necesite teamId o que el proyecto no exista
        if (error.response?.status === 404) {
          log(`   ⚠️  ${key} (${env}): Project not found - verifica el Project ID`, 'yellow');
          errors++;
        } else if (error.response?.status === 409 || error.response?.status === 400) {
          // Variable ya existe, intentar actualizar
          try {
            const envsRes = await axios.get(
              `https://api.vercel.com/v9/projects/${projectId}/env`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const existingVar = envsRes.data?.envs?.find(e => 
              e.key === key && (e.target.includes(env) || e.target.length === 0)
            );

            if (existingVar) {
              await axios.patch(
                `https://api.vercel.com/v1/projects/${projectId}/env/${existingVar.id}`,
                { value: value, target: [env] },
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              log(`   ✅ ${key} (${env}) - Actualizado`, 'green');
              success++;
            } else {
              log(`   ⚠️  ${key} (${env}): Variable existe pero no se pudo actualizar`, 'yellow');
              errors++;
            }
          } catch (updateError) {
            log(`   ⚠️  ${key} (${env}): ${updateError.message}`, 'yellow');
            errors++;
          }
        } else {
          log(`   ❌ ${key} (${env}): ${error.response?.data?.error?.message || error.message}`, 'red');
          errors++;
        }
      }
    }
  }

  log(`\n✨ COMPLETADO: ${success} variables configuradas, ${errors} errores\n`, 
      success > 0 ? 'green' : 'yellow');

  if (errors > 0 && success === 0) {
    log('⚠️  No se pudieron subir las variables automáticamente', 'yellow');
    log('   Posibles causas:', 'cyan');
    log('   1. El Project ID puede estar incorrecto', 'white');
    log('   2. El token puede no tener permisos', 'white');
    log('   3. El proyecto puede estar en un team diferente', 'white');
    log('\n📝 Configura manualmente en Vercel Dashboard:', 'cyan');
    log('   https://vercel.com/dashboard → Tu proyecto → Settings → Environment Variables\n', 'white');
    
    Object.entries(twilioVars).forEach(([key, val]) => {
      log(`   ${key}=${val}`, 'green');
    });
  } else if (success > 0) {
    log('📝 Próximos pasos:', 'cyan');
    log('   1. Verifica en Vercel Dashboard > Settings > Environment Variables', 'white');
    log('   2. Haz Redeploy del proyecto', 'white');
    log('   3. Configura webhooks en Twilio Dashboard', 'white');
    log('   4. ¡Prueba el chatbot! 🎉', 'white');
  }
}

main();
