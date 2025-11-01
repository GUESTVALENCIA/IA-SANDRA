/**
 * Sube Variables Twilio usando Vercel CLI
 * Método alternativo más confiable
 */

const { execSync } = require('child_process');
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
  log('\n🚀 SUBIENDO VARIABLES TWILIO A VERCEL (Vía CLI)\n', 'cyan');

  const twilioVars = {
    'TWILIO_ACCOUNT_SID': 'AC38300ea2b028ab4a55d6487f6451f69b',
    'TWILIO_AUTH_TOKEN': '5502a7df0779ba9124318c4e0543d695',
    'TWILIO_PHONE_NUMBER': '+18577608754',
    'TWILIO_WHATSAPP_NUMBER': 'whatsapp:+18577608754'
  };

  log('📋 Variables Twilio listas:', 'yellow');
  Object.entries(twilioVars).forEach(([key, val]) => {
    log(`   ${key} = ${val.substring(0, 20)}...`, 'cyan');
  });

  log('\n📋 Configurando variables usando Vercel CLI...', 'yellow');
  log('   Esto requiere que tengas Vercel CLI instalado y autenticado\n', 'cyan');

  const environments = ['production', 'preview', 'development'];
  let success = 0;
  let errors = 0;

  for (const [key, value] of Object.entries(twilioVars)) {
    for (const env of environments) {
      try {
        log(`   Configurando ${key} (${env})...`, 'cyan');
        
        // Usar echo para pasar el valor al comando vercel env add
        const command = `echo ${value} | npx vercel env add ${key} ${env}`;
        
        execSync(command, {
          stdio: 'pipe',
          shell: true,
          encoding: 'utf8'
        });
        
        log(`   ✅ ${key} (${env})`, 'green');
        success++;
      } catch (error) {
        // Si ya existe, intentar actualizar
        if (error.message.includes('already exists') || error.stdout?.includes('already exists')) {
          try {
            log(`   Actualizando ${key} (${env})...`, 'cyan');
            // Para actualizar, primero eliminar y luego crear
            execSync(`npx vercel env rm ${key} ${env} --yes`, { stdio: 'pipe' });
            execSync(`echo ${value} | npx vercel env add ${key} ${env}`, { stdio: 'pipe' });
            log(`   ✅ ${key} (${env}) - Actualizado`, 'green');
            success++;
          } catch (updateError) {
            log(`   ⚠️  ${key} (${env}): ${updateError.message}`, 'yellow');
            errors++;
          }
        } else {
          log(`   ⚠️  ${key} (${env}): ${error.message}`, 'yellow');
          errors++;
        }
      }
    }
  }

  log(`\n✨ COMPLETADO: ${success} variables configuradas, ${errors} errores\n`, 
      success > 0 ? 'green' : 'yellow');

  if (errors > 0) {
    log('📝 Si hubo errores, puedes configurar manualmente:', 'cyan');
    log('   Ve a: https://vercel.com/dashboard → Tu proyecto → Settings → Environment Variables\n', 'white');
    
    Object.entries(twilioVars).forEach(([key, val]) => {
      log(`   ${key}=${val}`, 'green');
    });
  } else {
    log('📝 Próximos pasos:', 'cyan');
    log('   1. Verifica en Vercel Dashboard > Settings > Environment Variables', 'white');
    log('   2. Haz Redeploy del proyecto', 'white');
    log('   3. Configura webhooks en Twilio Dashboard', 'white');
    log('   4. ¡Prueba el chatbot! 🎉', 'white');
  }
}

main();

