/**
 * Configuración Automática de Vercel
 * Usa tokens y variables disponibles para configurar todo
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para console
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
  log('\n🚀 Configurando Vercel automáticamente...\n', 'cyan');

  try {
    // 1. Verificar tokens disponibles
    log('📋 Paso 1: Verificando tokens...', 'yellow');
    
    const tokenPaths = [
      '.vercel-tokens.env',
      '.vercel/token',
      'vercel-token.txt',
      path.join(process.env.HOME || process.env.USERPROFILE, '.vercel-token')
    ];

    let vercelToken = null;
    for (const tokenPath of tokenPaths) {
      if (fs.existsSync(tokenPath)) {
        const content = fs.readFileSync(tokenPath, 'utf8').trim();
        if (content && content.length > 10) {
          vercelToken = content;
          log(`✅ Token encontrado en: ${tokenPath}`, 'green');
          break;
        }
      }
    }

    // Verificar variable de entorno
    if (!vercelToken && process.env.VERCEL_TOKEN) {
      vercelToken = process.env.VERCEL_TOKEN;
      log('✅ Token encontrado en variable de entorno', 'green');
    }

    if (!vercelToken) {
      log('⚠️  No se encontró token de Vercel', 'yellow');
      log('   Continuando con configuración manual...', 'yellow');
      return;
    }

    // 2. Verificar proyecto
    log('\n📋 Paso 2: Verificando proyecto Vercel...', 'yellow');
    
    let projectInfo;
    try {
      const output = execSync(`npx vercel --token=${vercelToken} ls --json`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      projectInfo = JSON.parse(output);
      log('✅ Proyecto verificado', 'green');
    } catch (error) {
      log('⚠️  No se pudo verificar proyecto automáticamente', 'yellow');
      log('   Necesitarás configurar manualmente', 'yellow');
      return;
    }

    // 3. Leer variables necesarias
    log('\n📋 Paso 3: Verificando variables de entorno...', 'yellow');
    
    const envFile = path.join(__dirname, '..', '.env');
    let envVars = {};
    
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          envVars[key] = value;
        }
      });
    }

    // Variables necesarias para Twilio
    const requiredVars = {
      TWILIO_ACCOUNT_SID: envVars.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: envVars.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: envVars.TWILIO_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER,
      TWILIO_WHATSAPP_NUMBER: envVars.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER,
    };

    const missingVars = Object.entries(requiredVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      log(`\n⚠️  Variables faltantes: ${missingVars.join(', ')}`, 'yellow');
      log('   Estas variables necesitan configurarse manualmente en Vercel Dashboard', 'yellow');
    } else {
      log('✅ Todas las variables Twilio encontradas', 'green');
    }

    // 4. Generar script de configuración
    log('\n📋 Paso 4: Generando scripts de configuración...', 'yellow');
    
    const configScript = `#!/bin/bash
# Script generado automáticamente para configurar Vercel

echo "🔧 Configurando variables de entorno en Vercel..."

# Configurar variables Twilio
if [ ! -z "$TWILIO_ACCOUNT_SID" ]; then
  npx vercel env add TWILIO_ACCOUNT_SID production <<< "$TWILIO_ACCOUNT_SID"
fi

if [ ! -z "$TWILIO_AUTH_TOKEN" ]; then
  npx vercel env add TWILIO_AUTH_TOKEN production <<< "$TWILIO_AUTH_TOKEN"
fi

if [ ! -z "$TWILIO_PHONE_NUMBER" ]; then
  npx vercel env add TWILIO_PHONE_NUMBER production <<< "$TWILIO_PHONE_NUMBER"
fi

if [ ! -z "$TWILIO_WHATSAPP_NUMBER" ]; then
  npx vercel env add TWILIO_WHATSAPP_NUMBER production <<< "$TWILIO_WHATSAPP_NUMBER"
fi

echo "✅ Variables configuradas"
`;

    const scriptPath = path.join(__dirname, 'configure-vercel-vars.sh');
    fs.writeFileSync(scriptPath, configScript);
    fs.chmodSync(scriptPath, '755');
    
    log(`✅ Script generado: ${scriptPath}`, 'green');

    // 5. Generar documentación
    log('\n📋 Paso 5: Generando documentación...', 'yellow');
    
    const docs = `# 🚀 Configuración Automática Completada

## ✅ Estado

- Token de Vercel: ${vercelToken ? '✅ Encontrado' : '❌ No encontrado'}
- Variables Twilio: ${missingVars.length === 0 ? '✅ Todas disponibles' : `⚠️  Faltan: ${missingVars.join(', ')}`}

## 📋 Próximos Pasos

### Opción 1: Usar Script Automático

\`\`\`bash
chmod +x scripts/configure-vercel-vars.sh
./scripts/configure-vercel-vars.sh
\`\`\`

### Opción 2: Configurar Manualmente en Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Settings > Environment Variables
4. Agrega las variables que faltan:
${missingVars.map(v => `   - ${v}`).join('\n')}

### Opción 3: Usar Vercel CLI

\`\`\`bash
npx vercel env add TWILIO_ACCOUNT_SID production
npx vercel env add TWILIO_AUTH_TOKEN production
npx vercel env add TWILIO_PHONE_NUMBER production
npx vercel env add TWILIO_WHATSAPP_NUMBER production
\`\`\`

## 🎯 Después de Configurar

1. **Redeploy** en Vercel para que las variables se apliquen
2. **Configurar webhooks** en Twilio Dashboard
3. **Probar** WhatsApp y llamadas

---

**Generado automáticamente** 🤖
`;

    fs.writeFileSync(path.join(__dirname, '..', 'CONFIGURACION_AUTOMATICA.md'), docs);
    log('✅ Documentación generada', 'green');

    log('\n✨ Configuración automática completada!\n', 'green');
    log('📝 Revisa CONFIGURACION_AUTOMATICA.md para próximos pasos\n', 'cyan');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    log('   Continuando con configuración manual...', 'yellow');
  }
}

main();

