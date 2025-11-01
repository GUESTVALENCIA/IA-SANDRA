/**
 * Sube Variables a Vercel Automáticamente
 * Usa el token de .vercel-tokens.env
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

async function uploadVarsToVercel() {
  log('\n🚀 Subiendo variables a Vercel automáticamente...\n', 'cyan');

  try {
    // 1. Leer token
    const tokenPath = path.join(__dirname, '..', '.vercel-tokens.env');
    let token = null;
    
    if (fs.existsSync(tokenPath)) {
      const content = fs.readFileSync(tokenPath, 'utf8');
      const apiTokenMatch = content.match(/VERCEL_API_TOKEN=([^\s\n]+)/);
      const accessTokenMatch = content.match(/VERCEL_ACCESS_TOKEN=([^\s\n]+)/);
      
      token = apiTokenMatch ? apiTokenMatch[1] : (accessTokenMatch ? accessTokenMatch[1] : null);
    }

    if (!token) {
      token = process.env.VERCEL_API_TOKEN || process.env.VERCEL_ACCESS_TOKEN;
    }

    if (!token) {
      log('❌ Token de Vercel no encontrado', 'red');
      log('   Configura manualmente en Vercel Dashboard', 'yellow');
      return;
    }

    log('✅ Token de Vercel encontrado', 'green');

    // 2. Leer variables del .env
    const envPath = path.join(__dirname, '..', '.env');
    const twilioVars = {};

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#') && line.includes('TWILIO')) {
          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            if (key.includes('TWILIO')) {
              twilioVars[key] = value;
            }
          }
        }
      });
    }

    // También leer de variables de entorno del sistema
    ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER', 'TWILIO_WHATSAPP_NUMBER'].forEach(key => {
      if (!twilioVars[key] && process.env[key]) {
        twilioVars[key] = process.env[key];
      }
    });

    if (Object.keys(twilioVars).length === 0) {
      log('⚠️  No se encontraron variables Twilio en .env', 'yellow');
      log('   Agrégalas manualmente en Vercel Dashboard', 'yellow');
      return;
    }

    log(`✅ ${Object.keys(twilioVars).length} variables Twilio encontradas`, 'green');

    // 3. Obtener project ID de Vercel
    log('\n📋 Obteniendo información del proyecto...', 'yellow');
    
    // Primero intentar obtener proyectos
    let projectId = null;
    let teamId = null;
    
    try {
      // Para obtener project ID, necesitamos listar proyectos
      // Por ahora, usar método manual
      log('⚠️  Necesitamos el Project ID de Vercel', 'yellow');
      log('   Opción 1: Ejecuta: npx vercel env ls', 'cyan');
      log('   Opción 2: Configura manualmente en Dashboard', 'cyan');
      log('\n📝 Variables listas para configurar:', 'yellow');
      Object.entries(twilioVars).forEach(([key, value]) => {
        log(`   ${key} = ${value.substring(0, 10)}...`, 'cyan');
      });
      
      log('\n✨ Ejecuta manualmente:', 'green');
      log('   npx vercel env add TWILIO_ACCOUNT_SID production', 'cyan');
      log('   npx vercel env add TWILIO_AUTH_TOKEN production', 'cyan');
      log('   npx vercel env add TWILIO_PHONE_NUMBER production', 'cyan');
      log('   npx vercel env add TWILIO_WHATSAPP_NUMBER production', 'cyan');
      
    } catch (error) {
      log(`❌ Error: ${error.message}`, 'red');
      log('   Configura manualmente en Vercel Dashboard', 'yellow');
    }

    log('\n✨ Variables listas para configurar\n', 'green');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  }
}

uploadVarsToVercel();

