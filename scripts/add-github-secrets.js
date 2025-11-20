/**
 * Script para añadir secrets de Vercel a GitHub automáticamente
 */

const axios = require('axios');
const crypto = require('crypto');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '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';
const GITHUB_REPO = 'GUESTVALENCIA/IA-SANDRA';
const API_BASE = `https://api.github.com/repos/${GITHUB_REPO}`;

// Secrets a añadir
const SECRETS = {
  VERCEL_TOKEN: 'rTbbeIXzN70ZvXbG6L9Avj5d',
  VERCEL_ORG_ID: 'team_w9AY6yfr55sc9UzBFkS8OyY8',
  VERCEL_PROJECT_ID: 'prj_HNCaiegvbQcqBHrV8kZwttlKrDPe'
};

async function getPublicKey() {
  try {
    const response = await axios.get(`${API_BASE}/actions/secrets/public-key`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error obteniendo public key: ${error.response?.data?.message || error.message}`);
  }
}

function encryptSecret(publicKey, secretValue) {
  const buffer = Buffer.from(secretValue, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    buffer
  );
  return encrypted.toString('base64');
}

async function createOrUpdateSecret(secretName, secretValue, publicKey, keyId) {
  try {
    const encryptedValue = encryptSecret(publicKey, secretValue);
    
    const response = await axios.put(
      `${API_BASE}/actions/secrets/${secretName}`,
      {
        encrypted_value: encryptedValue,
        key_id: keyId
      },
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { success: true, status: response.status };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Secret ${secretName} no encontrado o sin permisos`);
    }
    throw new Error(`Error creando secret ${secretName}: ${error.response?.data?.message || error.message}`);
  }
}

async function main() {
  console.log('🔐 Añadiendo secrets de Vercel a GitHub...\n');
  console.log(`📦 Repositorio: ${GITHUB_REPO}\n`);
  
  try {
    // Obtener public key
    console.log('🔑 Obteniendo public key de GitHub...');
    const { key, key_id } = await getPublicKey();
    console.log('✅ Public key obtenida\n');
    
    // Añadir cada secret
    const results = [];
    for (const [secretName, secretValue] of Object.entries(SECRETS)) {
      console.log(`📝 Añadiendo ${secretName}...`);
      try {
        const result = await createOrUpdateSecret(secretName, secretValue, key, key_id);
        results.push({ name: secretName, success: true });
        console.log(`   ✅ ${secretName} añadido correctamente\n`);
      } catch (error) {
        results.push({ name: secretName, success: false, error: error.message });
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }
    
    // Resumen
    console.log('========================================');
    console.log('📋 Resumen:');
    console.log('========================================\n');
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    results.forEach(r => {
      if (r.success) {
        console.log(`✅ ${r.name}`);
      } else {
        console.log(`❌ ${r.name}: ${r.error}`);
      }
    });
    
    console.log(`\n✅ Exitosos: ${successCount}/${results.length}`);
    if (failCount > 0) {
      console.log(`❌ Fallidos: ${failCount}/${results.length}`);
    }
    
    if (successCount === results.length) {
      console.log('\n🎉 ¡Todos los secrets añadidos correctamente!');
      console.log('\n💡 El workflow de Vercel debería ejecutarse automáticamente ahora.');
    }
    
  } catch (error) {
    console.error('\n❌ Error general:');
    console.error(`   ${error.message}`);
    
    if (error.response?.status === 401) {
      console.error('\n💡 Verifica que el token de GitHub tenga permisos de administrador');
    } else if (error.response?.status === 403) {
      console.error('\n💡 Verifica que el token tenga permisos de "repo" y "admin:repo_hook"');
    }
  }
}

main().catch(console.error);

