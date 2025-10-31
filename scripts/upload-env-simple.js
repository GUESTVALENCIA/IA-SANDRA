/**
 * Script Simple para Subir Variables de Entorno a Netlify
 * Lee desde .env y usa Netlify API directamente
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

const NETLIFY_SITE_ID = 'grand-pasca-a584d5';
let NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN;

// Leer token desde archivo si existe
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

// Subir variable a Netlify
function setEnvVar(key, value) {
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
          // Intentar actualizar si ya existe
          if (res.statusCode === 422) {
            updateEnvVar(key, value).then(resolve).catch(reject);
          } else {
            reject(new Error(`${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Actualizar variable existente
function updateEnvVar(key, value) {
  return new Promise((resolve, reject) => {
    // Primero obtener lista de variables
    const getOptions = {
      hostname: 'api.netlify.com',
      path: `/api/v1/sites/${NETLIFY_SITE_ID}/env`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const getReq = https.request(getOptions, (getRes) => {
      let data = '';
      getRes.on('data', chunk => data += chunk);
      getRes.on('end', () => {
        if (getRes.statusCode === 200) {
          const vars = JSON.parse(data);
          const existing = vars.find(v => v.key === key);
          
          if (existing) {
            // Actualizar
            const putData = JSON.stringify({
              key: key,
              values: [{ value: value, context: 'all' }]
            });

            const putOptions = {
              hostname: 'api.netlify.com',
              path: `/api/v1/sites/${NETLIFY_SITE_ID}/env/${existing.id}`,
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(putData)
              }
            };

            const putReq = https.request(putOptions, (putRes) => {
              let putData = '';
              putRes.on('data', chunk => putData += chunk);
              putRes.on('end', () => {
                if (putRes.statusCode === 200) {
                  resolve(true);
                } else {
                  reject(new Error(`Update failed: ${putRes.statusCode}`));
                }
              });
            });

            putReq.on('error', reject);
            putReq.write(putData);
            putReq.end();
          } else {
            reject(new Error('Variable not found for update'));
          }
        } else {
          reject(new Error(`Get failed: ${getRes.statusCode}`));
        }
      });
    });

    getReq.on('error', reject);
    getReq.end();
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

  const results = { success: 0, errors: 0 };

  for (const [key, value] of Object.entries(envVars)) {
    if (!value || value.trim() === '') continue;
    
    process.stdout.write(`  ${key}... `);
    
    try {
      await setEnvVar(key, value);
      console.log('✅');
      results.success++;
      await new Promise(r => setTimeout(r, 300)); // Rate limit
    } catch (error) {
      console.log(`❌ ${error.message}`);
      results.errors++;
    }
  }

  console.log(`\n📊 Resultado: ${results.success} ✅ | ${results.errors} ❌`);
  console.log(`\n🔗 Verificar en: https://app.netlify.com/sites/${NETLIFY_SITE_ID}/settings/env\n`);
}

main().catch(console.error);

