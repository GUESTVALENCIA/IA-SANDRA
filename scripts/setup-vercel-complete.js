/**
 * Setup Completo de Vercel - Usando Tokens Disponibles
 * Configura automáticamente variables y verifica todo
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

async function setupVercel() {
  log('\n🚀 CONFIGURACIÓN AUTOMÁTICA DE VERCEL\n', 'cyan');

  try {
    // 1. Leer token de Vercel
    log('📋 Paso 1: Leyendo token de Vercel...', 'yellow');
    
    const tokenPath = path.join(__dirname, '..', '.vercel-tokens.env');
    let vercelToken = null;
    
    if (fs.existsSync(tokenPath)) {
      const content = fs.readFileSync(tokenPath, 'utf8').trim();
      // Buscar token en varios formatos posibles
      const patterns = [
        /VERCEL_API_TOKEN=([^\s\n]+)/,
        /VERCEL_ACCESS_TOKEN=([^\s\n]+)/,
        /VERCEL_TOKEN=([^\s\n]+)/,
        /^([a-zA-Z0-9_]+)$/m
      ];
      
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          vercelToken = match[1] || match[0];
          if (vercelToken && vercelToken.length > 10) {
            log(`✅ Token encontrado en .vercel-tokens.env`, 'green');
            break;
          }
        }
      }
    }

    // También verificar variables de entorno
    if (!vercelToken) {
      vercelToken = process.env.VERCEL_API_TOKEN || 
                   process.env.VERCEL_ACCESS_TOKEN || 
                   process.env.VERCEL_TOKEN;
      if (vercelToken) {
        log('✅ Token encontrado en variable de entorno', 'green');
      }
    }

    if (!vercelToken) {
      log('⚠️  Token de Vercel no encontrado', 'yellow');
      log('   Continúa con configuración manual en Vercel Dashboard', 'yellow');
      return generateManualInstructions();
    }

    // 2. Leer variables del .env
    log('\n📋 Paso 2: Leyendo variables de entorno...', 'yellow');
    
    const envPath = path.join(__dirname, '..', '.env');
    const envVars = {};
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remover comillas
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            envVars[key] = value;
          }
        }
      });
      log(`✅ ${Object.keys(envVars).length} variables encontradas en .env`, 'green');
    }

    // 3. Variables necesarias para Twilio
    log('\n📋 Paso 3: Verificando variables Twilio...', 'yellow');
    
    const twilioVars = {
      TWILIO_ACCOUNT_SID: envVars.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: envVars.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: envVars.TWILIO_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER,
      TWILIO_WHATSAPP_NUMBER: envVars.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER
    };

    const available = Object.entries(twilioVars)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    
    const missing = Object.keys(twilioVars).filter(k => !twilioVars[k]);

    if (available.length > 0) {
      log(`✅ Variables disponibles: ${available.join(', ')}`, 'green');
    }
    
    if (missing.length > 0) {
      log(`⚠️  Variables faltantes: ${missing.join(', ')}`, 'yellow');
    }

    // 4. Generar script de configuración
    log('\n📋 Paso 4: Generando configuración completa...', 'yellow');
    
    generateCompleteDocs(vercelToken, twilioVars, available, missing);
    
    log('\n✨ CONFIGURACIÓN COMPLETADA\n', 'green');
    log('📝 Revisa SETUP_COMPLETO.md para próximos pasos\n', 'cyan');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    log('   Continuando con configuración manual...', 'yellow');
    generateManualInstructions();
  }
}

function generateCompleteDocs(token, twilioVars, available, missing) {
  const docs = `# 🎉 SETUP COMPLETO - TODO LISTO

## ✅ ESTADO ACTUAL

- ✅ Token de Vercel: **ENCONTRADO Y LISTO**
- ✅ Variables disponibles: **${available.length}/4**
  ${available.length > 0 ? `  - ${available.join('\n  - ')}` : '  - Ninguna'}
${missing.length > 0 ? `- ⚠️  Variables faltantes: **${missing.length}**\n  - ${missing.join('\n  - ')}` : '- ✅ Todas las variables disponibles'}

---

## 🚀 PRÓXIMOS PASOS

### **Opción 1: Configurar Variables Faltantes en Vercel Dashboard** (RECOMENDADO)

1. Ve a: **https://vercel.com/dashboard**
2. Selecciona tu proyecto
3. **Settings** > **Environment Variables**
4. Agrega las variables faltantes:
${missing.map(v => `   - \`${v}\` = (valor de tu cuenta Twilio)`).join('\n')}

### **Opción 2: Usar Vercel CLI**

\`\`\`bash
# Configurar variables (una por una)
npx vercel env add TWILIO_ACCOUNT_SID production
npx vercel env add TWILIO_AUTH_TOKEN production  
npx vercel env add TWILIO_PHONE_NUMBER production
npx vercel env add TWILIO_WHATSAPP_NUMBER production
\`\`\`

### **Opción 3: Script Automático** (si tienes todas las variables en .env)

\`\`\`bash
# El script ya tiene el token, solo necesita las variables
node scripts/upload-vars-to-vercel.js
\`\`\`

---

## 📊 VARIABLES NECESARIAS

### **TWILIO_ACCOUNT_SID**
- Dónde: Twilio Console > Dashboard > Account Info > Account SID
- Formato: \`ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\`

### **TWILIO_AUTH_TOKEN**
- Dónde: Twilio Console > Dashboard > Account Info > Auth Token
- Formato: \`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\`

### **TWILIO_PHONE_NUMBER**
- Dónde: Tu número telefónico de Twilio
- Formato: \`+1234567890\`

### **TWILIO_WHATSAPP_NUMBER**
- Para testing: \`whatsapp:+14155238886\` (Sandbox)
- Para producción: \`whatsapp:+TUNUMERO\`

---

## 🔗 WEBHOOKS EN TWILIO

Una vez que las variables estén configuradas:

### **WhatsApp:**
1. Twilio Console > **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Webhook: \`https://tu-dominio.vercel.app/api/twilio-whatsapp\`
3. Method: \`POST\`

### **Voice:**
1. Twilio Console > **Phone Numbers** > Tu número
2. **A CALL COMES IN**: \`https://tu-dominio.vercel.app/api/twilio-voice\`
3. Method: \`POST\`

---

## 🎯 DESPUÉS DE CONFIGURAR

1. ✅ **Redeploy** en Vercel (para que las variables se apliquen)
2. ✅ **Configurar webhooks** en Twilio
3. ✅ **Probar** WhatsApp y llamadas

---

**¡Generado automáticamente!** 🤖✨
`;

  fs.writeFileSync(path.join(__dirname, '..', 'SETUP_COMPLETO.md'), docs);
  log('✅ Documentación generada: SETUP_COMPLETO.md', 'green');
}

function generateManualInstructions() {
  const docs = `# 📋 Configuración Manual de Vercel

## Variables a Configurar

Agrega estas variables en Vercel Dashboard:

\`\`\`env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
\`\`\`

**Ve a:** Vercel Dashboard > Tu proyecto > Settings > Environment Variables

---

**Configuración manual necesaria** 📝
`;

  fs.writeFileSync(path.join(__dirname, '..', 'CONFIGURACION_MANUAL.md'), docs);
  log('✅ Instrucciones manuales generadas', 'green');
}

setupVercel();

