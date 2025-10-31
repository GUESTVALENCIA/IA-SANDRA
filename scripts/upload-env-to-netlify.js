/**
 * Script para Subir Variables de Entorno a Netlify
 * Automatiza la configuración de API keys en Netlify Dashboard
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

// Configuración
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID || 'grand-pasca-a584d5';
const NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN;

// Variables requeridas
const REQUIRED_VARS = [
  'OPENAI_API_KEY',
  'DEEPGRAM_API_KEY',
  'CARTESIA_API_KEY',
  'HEYGEN_API_KEY'
];

// Variables opcionales
const OPTIONAL_VARS = [
  'ANTHROPIC_API_KEY',
  'GROQ_API_KEY',
  'NODE_ENV',
  'ALLOWED_ORIGIN',
  'BASE_URL',
  'REQUIRE_AUTH'
];

// Leer .env file
function loadEnvFile() {
  const envPaths = [
    path.join(__dirname, '..', '.env.production'),
    path.join(__dirname, '..', '.env'),
    path.join(process.cwd(), '.env.production'),
    path.join(process.cwd(), '.env')
  ];

  const envVars = {};

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      console.log(`📋 Cargando variables desde: ${envPath}`);
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        }
      }
      break;
    }
  }

  return envVars;
}

// Netlify API: Obtener variables existentes
function getExistingEnvVars() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.netlify.com',
      path: `/api/v1/sites/${NETLIFY_SITE_ID}/env`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const envVars = JSON.parse(data);
            resolve(envVars);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(new Error(`API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Netlify API: Crear/Actualizar variable
function setEnvVar(key, value, context = 'all') {
  return new Promise((resolve, reject) => {
    const existing = getExistingEnvVars()
      .then(existingVars => {
        const existingVar = existingVars.find(v => v.key === key);

        // Si existe, actualizar
        if (existingVar) {
          return updateEnvVar(existingVar.id, key, value, context);
        } else {
          // Si no existe, crear
          return createEnvVar(key, value, context);
        }
      })
      .then(resolve)
      .catch(reject);
  });
}

// Crear nueva variable
function createEnvVar(key, value, context = 'all') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      key: key,
      values: [
        {
          value: value,
          context: context // 'all', 'production', 'deploy-preview', 'branch-deploy'
        }
      ]
    });

    const options = {
      hostname: 'api.netlify.com',
      path: `/api/v1/sites/${NETLIFY_SITE_ID}/env`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          resolve({ success: true, message: `Created ${key}` });
        } else {
          reject(new Error(`Failed to create ${key}: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Actualizar variable existente
function updateEnvVar(varId, key, value, context = 'all') {
  return new Promise((resolve, reject) => {
    const putData = JSON.stringify({
      key: key,
      values: [
        {
          value: value,
          context: context
        }
      ]
    });

    const options = {
      hostname: 'api.netlify.com',
      path: `/api/v1/sites/${NETLIFY_SITE_ID}/env/${varId}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ success: true, message: `Updated ${key}` });
        } else {
          reject(new Error(`Failed to update ${key}: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(putData);
    req.end();
  });
}

// Obtener token de autenticación interactivo
function getAuthToken() {
  return new Promise((resolve) => {
    if (NETLIFY_AUTH_TOKEN) {
      resolve(NETLIFY_AUTH_TOKEN);
      return;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n🔑 Se requiere NETLIFY_AUTH_TOKEN');
    console.log('   Obténlo en: https://app.netlify.com/user/applications');
    console.log('   O configura como variable de entorno:\n');
    console.log('   set NETLIFY_AUTH_TOKEN=tu_token_aqui (Windows)');
    console.log('   export NETLIFY_AUTH_TOKEN=tu_token_aqui (Linux/Mac)\n');

    rl.question('Ingresa tu NETLIFY_AUTH_TOKEN (o presiona Enter para cancelar): ', (token) => {
      rl.close();
      if (token.trim()) {
        resolve(token.trim());
      } else {
        console.log('❌ Operación cancelada');
        process.exit(1);
      }
    });
  });
}

// Main function
async function main() {
  console.log('🚀 SUBIENDO VARIABLES DE ENTORNO A NETLIFY\n');
  console.log(`📦 Site ID: ${NETLIFY_SITE_ID}\n`);

  // Verificar token
  const authToken = await getAuthToken();
  if (!authToken) {
    console.error('❌ NETLIFY_AUTH_TOKEN requerido');
    process.exit(1);
  }

  // Cargar variables desde .env
  const envVars = loadEnvFile();

  if (Object.keys(envVars).length === 0) {
    console.error('❌ No se encontró archivo .env');
    console.error('   Crea .env o .env.production con las variables requeridas');
    process.exit(1);
  }

  console.log(`📋 Variables encontradas: ${Object.keys(envVars).length}\n`);

  // Verificar variables requeridas
  const missingRequired = REQUIRED_VARS.filter(key => !envVars[key]);
  if (missingRequired.length > 0) {
    console.error('❌ Faltan variables requeridas:');
    missingRequired.forEach(key => console.error(`   - ${key}`));
    console.error('\n   Configúralas en .env o .env.production');
    process.exit(1);
  }

  // Subir variables
  console.log('📤 Subiendo variables a Netlify...\n');

  const results = {
    success: [],
    errors: []
  };

  // Variables requeridas (context: all = todas las branches)
  for (const key of REQUIRED_VARS) {
    if (envVars[key]) {
      try {
        const result = await setEnvVar(key, envVars[key], 'all');
        console.log(`  ✅ ${key}: ${result.message}`);
        results.success.push(key);
        
        // Delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`  ❌ ${key}: ${error.message}`);
        results.errors.push({ key, error: error.message });
      }
    }
  }

  // Variables opcionales (context: production)
  for (const key of OPTIONAL_VARS) {
    if (envVars[key]) {
      try {
        const result = await setEnvVar(key, envVars[key], 'production');
        console.log(`  ✅ ${key}: ${result.message} (production)`);
        results.success.push(key);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`  ⚠️  ${key}: ${error.message}`);
        // Opcionales no son críticos
      }
    }
  }

  // Resumen
  console.log('\n📊 RESULTADO:\n');
  console.log(`  ✅ Variables subidas: ${results.success.length}`);
  if (results.errors.length > 0) {
    console.log(`  ❌ Errores: ${results.errors.length}`);
    results.errors.forEach(({ key, error }) => {
      console.log(`     - ${key}: ${error}`);
    });
  }

  // Verificación final
  if (results.success.length >= REQUIRED_VARS.length) {
    console.log('\n✅ TODAS LAS VARIABLES REQUERIDAS SUBIDAS');
    console.log('\n🔗 Verificar en:');
    console.log(`   https://app.netlify.com/sites/${NETLIFY_SITE_ID}/settings/env\n`);
  } else {
    console.log('\n⚠️  Algunas variables no se pudieron subir');
    console.log('   Revisa los errores arriba\n');
    process.exit(1);
  }
}

// Ejecutar
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = { setEnvVar, getExistingEnvVars, loadEnvFile };

