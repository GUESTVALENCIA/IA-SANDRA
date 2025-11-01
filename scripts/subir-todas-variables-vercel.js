/**
 * Sube TODAS las variables a Vercel automáticamente
 * Usa tokens de acceso personal de Vercel
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

async function main() {
  log('\n🚀 SUBIENDO TODAS LAS VARIABLES A VERCEL AUTOMÁTICAMENTE...\n', 'cyan');

  try {
    // 1. Leer token de Vercel
    const tokenPath = path.join(__dirname, '..', '.vercel-tokens.env');
    let token = null;
    
    if (fs.existsSync(tokenPath)) {
      const content = fs.readFileSync(tokenPath, 'utf8');
      const match = content.match(/VERCEL_API_TOKEN=([^\s\n]+)/);
      if (match) token = match[1];
    }

    // También del mensaje del usuario
    if (!token) {
      token = 'vck_6vCzQIEaY91ookaipVZdp3ZEl8NlpaA5tabMJQhGLHOGGhehrF1HHRPW';
    }

    if (!token) {
      log('❌ Token de Vercel no encontrado', 'red');
      return;
    }

    log('✅ Token de Vercel encontrado', 'green');

    // 2. Leer variables del archivo VARIABLESWEB.txt
    const variablesWebPath = 'C:\\Users\\clayt\\CLEANUP_TEMP\\DESKTOP_REMOVED\\VARIABLESWEB.txt';
    const allVars = {};

    if (fs.existsSync(variablesWebPath)) {
      log('📋 Leyendo VARIABLESWEB.txt...', 'yellow');
      const content = fs.readFileSync(variablesWebPath, 'utf8');
      
      // Extraer variables usando múltiples patrones
      const patterns = [
        /TWILIO[^\s=]+[\s=]+([^\s\n]+)/gi,
        /SID\s+TWILIO[\s=]+([^\s\n]+)/gi,
        /NUMERO\s+TWILIO[\s=]+([^\s\n]+)/gi,
        /TOKEN.*TWILIO[\s=]+([^\s\n]+)/gi,
        /TWILIO_AUTH_TOKEN[\s=]+([^\s\n]+)/gi,
        /TWILIO_ACCOUNT_SID[\s=]+([^\s\n]+)/gi,
        /TWILIO_PHONE_NUMBER[\s=]+([^\s\n]+)/gi,
        /TWILIO_WHATSAPP_NUMBER[\s=]+([^\s\n]+)/gi,
      ];

      // Extraer manualmente de las variables que el usuario proporcionó
      allVars['TWILIO_ACCOUNT_SID'] = 'AC38300ea2b028ab4a55d6487f6451f69b';
      allVars['TWILIO_PHONE_NUMBER'] = '+18577608754';
      allVars['TWILIO_WHATSAPP_NUMBER'] = 'whatsapp:+18577608754'; // Formato Twilio
      
      // Buscar AUTH_TOKEN de Twilio en múltiples formatos
      const authTokenPatterns = [
        /TWILIO.*AUTH.*TOKEN[\s=:]+([^\s\n]+)/i,
        /AUTH.*TOKEN.*TWILIO[\s=:]+([^\s\n]+)/i,
        /TWILIO_TOKEN[\s=:]+([^\s\n]+)/i,
        /TOKEN.*TWILIO[\s=:]+([a-zA-Z0-9_]+)/i,
      ];
      
      let authTokenFound = false;
      for (const pattern of authTokenPatterns) {
        const match = content.match(pattern);
        if (match && match[1] && match[1].length > 10) {
          allVars['TWILIO_AUTH_TOKEN'] = match[1].trim();
          authTokenFound = true;
          break;
        }
      }
      
      if (!authTokenFound) {
        log('⚠️  TWILIO_AUTH_TOKEN no encontrado en el archivo', 'yellow');
        log('   Lo puedes encontrar en: https://console.twilio.com/us1/account/keys-credentials/api-keys', 'cyan');
        log('   O proporciona el token manualmente y actualiza el script', 'cyan');
        log('   Continuando con las otras variables...', 'yellow');
      }

      log(`✅ Variables Twilio extraídas: ${Object.keys(allVars).filter(k => k.includes('TWILIO')).length}`, 'green');
    }

    // Si no se encontró TWILIO_AUTH_TOKEN, intentar del .env
    if (!allVars['TWILIO_AUTH_TOKEN']) {
      const envPath = path.join(__dirname, '..', '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envMatch = envContent.match(/TWILIO_AUTH_TOKEN[\s=]+([^\s\n]+)/i);
        if (envMatch) {
          allVars['TWILIO_AUTH_TOKEN'] = envMatch[1].trim();
          log('✅ TWILIO_AUTH_TOKEN encontrado en .env', 'green');
        }
      }
    }

    // Verificar que tenemos las variables mínimas
    const requiredTwilioVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
    const missing = requiredTwilioVars.filter(v => !allVars[v]);

    if (missing.length > 0) {
      log(`\n⚠️  Variables faltantes: ${missing.join(', ')}`, 'yellow');
      if (missing.includes('TWILIO_AUTH_TOKEN')) {
        log('\n📝 Para obtener TWILIO_AUTH_TOKEN:', 'cyan');
        log('   1. Ve a: https://console.twilio.com/us1/develop/api-keys/api-keys', 'white');
        log('   2. Crea o copia el Auth Token', 'white');
        log('   3. Agrégala al archivo VARIABLESWEB.txt', 'white');
      }
    }

    if (Object.keys(allVars).filter(k => k.includes('TWILIO')).length === 0) {
      log('❌ No se encontraron variables Twilio', 'red');
      return;
    }

    log('\n📋 Variables Twilio encontradas:', 'yellow');
    Object.keys(allVars).filter(k => k.includes('TWILIO')).forEach(key => {
      const val = allVars[key];
      const display = val.length > 20 ? `${val.substring(0, 20)}...` : val;
      log(`   ${key} = ${display}`, 'cyan');
    });

    // 3. Obtener proyectos de Vercel
    log('\n📋 Obteniendo proyectos de Vercel...', 'yellow');
    
    let projects = [];
    try {
      const projectsRes = await axios.get('https://api.vercel.com/v9/projects', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      projects = projectsRes.data?.projects || [];
      
      if (projects.length === 0) {
        log('⚠️  No se encontraron proyectos con ese token', 'yellow');
        log('   Intentando obtener proyectos con diferentes endpoint...', 'cyan');
        
        // Intentar con endpoint alternativo
        try {
          const altRes = await axios.get('https://api.vercel.com/v2/projects', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          projects = altRes.data?.projects || altRes.data || [];
        } catch (altError) {
          // Continuar sin proyectos
        }
      }
    } catch (error) {
      log(`⚠️  Error obteniendo proyectos: ${error.message}`, 'yellow');
      log('   Continuando sin proyecto específico...', 'cyan');
      
      // Usar un project ID hardcodeado si el usuario lo conoce
      // Por ahora, pediremos al usuario que lo proporcione
    }
    
    if (projects.length === 0) {
      log('\n⚠️  No se pudo obtener proyectos automáticamente', 'yellow');
      log('   Opciones:', 'cyan');
      log('   1. Ejecuta: npx vercel ls (para ver proyectos)', 'white');
      log('   2. Obtén el Project ID desde Vercel Dashboard', 'white');
      log('   3. Modifica el script con el Project ID', 'white');
      log('\n   Por ahora, no se pueden subir las variables automáticamente', 'yellow');
      log('   Pero las variables están listas para configurar manualmente:\n', 'cyan');
      
      Object.keys(allVars).filter(k => k.includes('TWILIO')).forEach(key => {
        const val = allVars[key];
        log(`   ${key}=${val}`, 'green');
      });
      
      return;
    }

    const project = projects.find(p => 
      p.name?.toLowerCase().includes('sandra') || 
      p.name?.toLowerCase().includes('ia-sandra') ||
      p.name?.toLowerCase().includes('guestsvalencia')
    ) || projects[0];

    log(`✅ Proyecto seleccionado: ${project.name} (${project.id})`, 'green');

    // 4. Subir variables
    log('\n📋 Subiendo variables a Vercel...', 'yellow');

    const environments = ['production', 'preview', 'development'];
    let success = 0;
    let errors = 0;

    for (const [key, value] of Object.entries(allVars)) {
      if (!key.includes('TWILIO')) continue; // Solo subir variables Twilio por ahora
      
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
          // Si ya existe (409), actualizar
          if (error.response?.status === 409 || error.response?.status === 400) {
            try {
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
              } else {
                log(`   ⚠️  ${key} (${env}): Variable existe pero no se pudo actualizar`, 'yellow');
                errors++;
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
    
    if (missing.includes('TWILIO_AUTH_TOKEN')) {
      log('⚠️  IMPORTANTE: Falta TWILIO_AUTH_TOKEN', 'yellow');
      log('   Obtén el token de Twilio Console y vuelve a ejecutar este script\n', 'cyan');
    } else {
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

