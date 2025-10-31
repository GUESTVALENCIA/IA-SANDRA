/**
 * Script Simple para Subir Variables de Entorno a Netlify
 * Lee desde .env y usa Netlify API directamente
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID || 'a75819c1-20d5-43f1-8ebc-b3a35ddf7605'; // grand-pasca-a584d5 (sandra.guestsvalencia.es)
let NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN;

// Intentar leer desde .env si no está en variables de entorno
if (!NETLIFY_AUTH_TOKEN) {
  const envPaths = [
    path.join(__dirname, '..', '.env.production'),
    path.join(__dirname, '..', '.env'),
    path.join(process.cwd(), '.env.production'),
    path.join(process.cwd(), '.env'),
  ];
  
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      // Buscar con múltiples patrones (con/sin espacios, con/sin comillas)
      const patterns = [
        /^NETLIFY_AUTH_TOKEN\s*=\s*(.+)$/m,
        /^NETLIFY_AUTH_TOKEN=(.+)$/m,
        /NETLIFY_AUTH_TOKEN\s*[:=]\s*(.+)/i,
      ];
      
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          NETLIFY_AUTH_TOKEN = match[1].trim().replace(/^["'`]|["'`]$/g, '').replace(/^\s+|\s+$/g, '');
          console.log(`✅ Token encontrado en ${path.basename(envPath)}`);
          break;
        }
      }
      
      if (NETLIFY_AUTH_TOKEN) break;
    }
  }
}

// Leer token desde archivo .netlify-token si existe
const tokenPath = path.join(__dirname, '..', '.netlify-token');
if (!NETLIFY_AUTH_TOKEN && fs.existsSync(tokenPath)) {
  NETLIFY_AUTH_TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();
}

// Leer .env
function loadEnvFile() {
  const envPaths = [
    path.join(__dirname, '..', '.env.production'),
    path.join(__dirname, '..', '.env'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      console.log(`📋 Cargando desde: ${path.basename(envPath)}`);
      const content = fs.readFileSync(envPath, 'utf8');
      const vars = {};
      
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            vars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      });
      
      return vars;
    }
  }
  
  return null;
}

// Obtener token interactivamente
function getToken() {
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
    console.log('   Obténlo en: https://app.netlify.com/user/applications\n');

    rl.question('Token (o Enter para usar archivo .netlify-token): ', (token) => {
      rl.close();
      if (token.trim()) {
        resolve(token.trim());
      } else if (fs.existsSync(tokenPath)) {
        const fileToken = fs.readFileSync(tokenPath, 'utf8').trim();
        if (fileToken) {
          resolve(fileToken);
        } else {
          console.log('❌ Token no encontrado');
          process.exit(1);
        }
      } else {
        console.log('❌ Token requerido');
        process.exit(1);
      }
    });
  });
}

// Obtener variables existentes
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
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else {
          reject(new Error(`GET failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Subir variable a Netlify
async function setEnvVar(key, value, existingVars = null) {
  // Si no tenemos la lista de existentes, obtenerla
  if (!existingVars) {
    try {
      existingVars = await getExistingEnvVars();
    } catch (e) {
      console.log(`  ⚠️  No se pudieron obtener variables existentes, intentando crear...`);
    }
  }

  // Verificar si ya existe
  const existing = existingVars ? existingVars.find(v => v.key === key) : null;

  if (existing && existing.values && existing.values.length > 0) {
    // Si ya existe, intentar agregar un nuevo value con el mismo key
    // (Netlify permite múltiples values por key con diferentes contexts)
    // O simplemente crear nueva - si falla, significa que ya existe y está bien
    try {
      // Intentar crear - si falla porque ya existe, está bien
      return createEnvVar(key, value);
    } catch (e) {
      // Si falla por duplicado, considerar éxito
      if (e.message.includes('already exists') || e.message.includes('422')) {
        return Promise.resolve(true);
      }
      throw e;
    }
  } else {
    // Crear nueva
    return createEnvVar(key, value);
  }
}

// Crear nueva variable
function createEnvVar(key, value) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      key: key,
      values: [{ value: value, context: 'all' }]
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
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(true);
        } else {
          reject(new Error(`${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Actualizar variable existente
function updateEnvVar(valueId, key, value) {
  return new Promise((resolve, reject) => {
    // Para actualizar, necesitamos actualizar el value específico o agregar uno nuevo
    // La API de Netlify requiere actualizar el value directamente o agregar uno nuevo al env var
    const putData = JSON.stringify({
      value: value,
      context: 'all'
    });

    const options = {
      hostname: 'api.netlify.com',
      path: `/api/v1/sites/${NETLIFY_SITE_ID}/env/${valueId}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          reject(new Error(`Update failed: ${res.statusCode} - ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(putData);
    req.end();
  });
}

// Main
async function main() {
  console.log('🚀 SUBIENDO VARIABLES A NETLIFY\n');

  // Obtener token
  NETLIFY_AUTH_TOKEN = await getToken();

  // Cargar variables
  const envVars = loadEnvFile();
  if (!envVars || Object.keys(envVars).length === 0) {
    console.error('❌ No se encontraron variables en .env');
    process.exit(1);
  }

  console.log(`\n📤 Subiendo ${Object.keys(envVars).length} variables...\n`);

  // Obtener variables existentes una vez
  let existingVars = null;
  try {
    console.log('🔍 Obteniendo variables existentes...');
    existingVars = await getExistingEnvVars();
    console.log(`   Encontradas ${existingVars.length} variables existentes\n`);
  } catch (error) {
    console.log(`   ⚠️  No se pudieron obtener variables existentes: ${error.message}\n`);
  }

  const results = { success: 0, errors: 0 };

  for (const [key, value] of Object.entries(envVars)) {
    if (!value || value.trim() === '') continue;
    
    process.stdout.write(`  ${key}... `);
    
    try {
      await setEnvVar(key, value, existingVars);
      console.log('✅');
      results.success++;
      await new Promise(r => setTimeout(r, 500)); // Rate limit
    } catch (error) {
      console.log(`❌ ${error.message}`);
      results.errors++;
    }
  }

  console.log(`\n📊 Resultado: ${results.success} ✅ | ${results.errors} ❌`);
  console.log(`\n🔗 Verificar en: https://app.netlify.com/sites/${NETLIFY_SITE_ID}/settings/env\n`);
}

main().catch(console.error);

