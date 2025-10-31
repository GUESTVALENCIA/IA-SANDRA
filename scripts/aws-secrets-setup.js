/**
 * Sandra IA 7.0 - AWS Secrets Manager Setup Script
 * CONFIGURACIÓN INICIAL DE SECRETS MANAGER
 *
 * Este script configura AWS Secrets Manager con todas las keys actuales
 * y prepara el sistema para rotación automática.
 *
 * @author CTO Claude Code - Sandra IA Team
 * @date 2025-01-28
 */

const AWS = require('aws-sdk');
const readline = require('readline');

// Configurar AWS SDK
const secretsManager = new AWS.SecretsManager({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Interface para input interactivo
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * Proveedores que vamos a configurar
 */
const PROVIDERS = [
  {
    name: 'openai',
    displayName: 'OpenAI',
    envVar: 'OPENAI_API_KEY',
    pattern: 'sk-proj-'
  },
  {
    name: 'anthropic',
    displayName: 'Anthropic Claude',
    envVar: 'ANTHROPIC_API_KEY',
    pattern: 'sk-ant-'
  },
  {
    name: 'groq',
    displayName: 'GROQ',
    envVar: 'GROQ_API_KEY',
    pattern: 'gsk_'
  },
  {
    name: 'cartesia',
    displayName: 'Cartesia TTS',
    envVar: 'CARTESIA_API_KEY',
    pattern: 'sk_car_'
  },
  {
    name: 'deepgram',
    displayName: 'Deepgram',
    envVar: 'DEEPGRAM_API_KEY',
    pattern: ''
  },
  {
    name: 'heygen',
    displayName: 'HeyGen',
    envVar: 'HEYGEN_API_KEY',
    pattern: ''
  },
  {
    name: 'paypal',
    displayName: 'PayPal',
    envVar: 'PAYPAL_CLIENT_SECRET',
    pattern: ''
  },
  {
    name: 'meta-whatsapp',
    displayName: 'Meta WhatsApp Business',
    envVar: 'WHATSAPP_TOKEN',
    pattern: ''
  },
  {
    name: 'netlify',
    displayName: 'Netlify',
    envVar: 'NETLIFY_AUTH_TOKEN',
    pattern: 'nfp_'
  }
];

/**
 * Función principal de setup
 */
async function setup() {
  console.log('\n' + '='.repeat(70));
  console.log('🔐 SANDRA IA 7.0 - AWS SECRETS MANAGER SETUP');
  console.log('='.repeat(70));
  console.log('\nEste script configurará AWS Secrets Manager para rotación automática.');
  console.log('Necesitarás las API keys actuales de cada proveedor.\n');

  // Verificar conexión AWS
  console.log('🔍 Verificando conexión con AWS...');
  try {
    await secretsManager.listSecrets({ MaxResults: 1 }).promise();
    console.log('✅ Conectado a AWS Secrets Manager\n');
  } catch (error) {
    console.error('❌ Error conectando a AWS:', error.message);
    console.error('\n💡 Verifica que tengas configuradas estas variables de entorno:');
    console.error('   - AWS_ACCESS_KEY_ID');
    console.error('   - AWS_SECRET_ACCESS_KEY');
    console.error('   - AWS_REGION (opcional, default: us-east-1)\n');
    process.exit(1);
  }

  // Modo de configuración
  const mode = await question(
    '\n¿Qué deseas hacer?\n' +
    '  1) Configurar TODAS las keys (recomendado primera vez)\n' +
    '  2) Actualizar una key específica\n' +
    '  3) Ver estado actual de keys\n' +
    '  4) Configurar solo Deepgram (rotación automática)\n' +
    '\nOpción (1-4): '
  );

  switch (mode.trim()) {
    case '1':
      await setupAllKeys();
      break;
    case '2':
      await updateSpecificKey();
      break;
    case '3':
      await showCurrentStatus();
      break;
    case '4':
      await setupDeepgram();
      break;
    default:
      console.log('❌ Opción inválida');
      process.exit(1);
  }

  rl.close();
}

/**
 * Configurar todas las keys
 */
async function setupAllKeys() {
  console.log('\n📝 CONFIGURACIÓN COMPLETA DE API KEYS\n');
  console.log('Por favor ingresa las keys actuales de cada proveedor.');
  console.log('(Presiona Enter sin escribir nada para saltar un proveedor)\n');

  const results = [];

  for (const provider of PROVIDERS) {
    console.log(`\n--- ${provider.displayName} ---`);

    const currentKey = await getCurrentKey(provider.name);
    if (currentKey) {
      console.log(`✅ Ya existe una key configurada (última rotación: ${currentKey.rotatedAt})`);
      const shouldUpdate = await question('¿Actualizar? (s/n): ');
      if (shouldUpdate.toLowerCase() !== 's') {
        results.push({ provider: provider.name, status: 'skipped' });
        continue;
      }
    }

    const key = await question(`Ingresa ${provider.envVar} (o Enter para saltar): `);

    if (!key.trim()) {
      console.log('⏭️ Saltado');
      results.push({ provider: provider.name, status: 'skipped' });
      continue;
    }

    // Validar patrón si existe
    if (provider.pattern && !key.startsWith(provider.pattern)) {
      console.warn(`⚠️ Advertencia: La key no empieza con "${provider.pattern}"`);
      const proceed = await question('¿Continuar de todos modos? (s/n): ');
      if (proceed.toLowerCase() !== 's') {
        results.push({ provider: provider.name, status: 'cancelled' });
        continue;
      }
    }

    try {
      await storeSecret(provider.name, key);
      console.log(`✅ ${provider.displayName} configurado`);
      results.push({ provider: provider.name, status: 'success' });
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      results.push({ provider: provider.name, status: 'failed', error: error.message });
    }
  }

  // Resumen
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN DE CONFIGURACIÓN');
  console.log('='.repeat(70) + '\n');

  results.forEach(r => {
    const emoji = r.status === 'success' ? '✅' : r.status === 'failed' ? '❌' : '⏭️';
    console.log(`${emoji} ${r.provider}: ${r.status}`);
  });

  const successCount = results.filter(r => r.status === 'success').length;
  console.log(`\n✨ ${successCount}/${PROVIDERS.length} proveedores configurados correctamente\n`);

  if (successCount > 0) {
    console.log('🎯 Próximos pasos:');
    console.log('   1. Ejecutar: node scripts/key-rotation-autorun.js');
    console.log('   2. El sistema comenzará a monitorear automáticamente');
    console.log('   3. Recibirás alertas WhatsApp/Telegram para rotaciones manuales\n');
  }
}

/**
 * Actualizar una key específica
 */
async function updateSpecificKey() {
  console.log('\n📝 ACTUALIZAR KEY ESPECÍFICA\n');

  // Mostrar proveedores disponibles
  PROVIDERS.forEach((p, i) => {
    console.log(`  ${i + 1}) ${p.displayName} (${p.name})`);
  });

  const choice = await question('\nSelecciona proveedor (número): ');
  const index = parseInt(choice) - 1;

  if (index < 0 || index >= PROVIDERS.length) {
    console.log('❌ Selección inválida');
    return;
  }

  const provider = PROVIDERS[index];

  console.log(`\n--- Actualizando ${provider.displayName} ---`);

  const currentKey = await getCurrentKey(provider.name);
  if (currentKey) {
    console.log(`Última rotación: ${currentKey.rotatedAt}`);
    console.log(`Key actual: ${currentKey.key.substring(0, 10)}...`);
  }

  const newKey = await question(`\nNueva key de ${provider.displayName}: `);

  if (!newKey.trim()) {
    console.log('❌ No se ingresó ninguna key');
    return;
  }

  try {
    await storeSecret(provider.name, newKey);
    console.log(`\n✅ ${provider.displayName} actualizado correctamente`);
    console.log('🔄 La nueva key está lista para usar en el sistema\n');
  } catch (error) {
    console.error(`\n❌ Error actualizando: ${error.message}\n`);
  }
}

/**
 * Mostrar estado actual de todas las keys
 */
async function showCurrentStatus() {
  console.log('\n📊 ESTADO ACTUAL DE API KEYS\n');

  for (const provider of PROVIDERS) {
    try {
      const status = await getCurrentKey(provider.name);
      if (status) {
        const daysOld = Math.floor(
          (new Date() - new Date(status.rotatedAt)) / (1000 * 60 * 60 * 24)
        );

        const emoji = daysOld < 30 ? '🟢' : daysOld < 60 ? '🟡' : '🔴';

        console.log(`${emoji} ${provider.displayName}`);
        console.log(`   Última rotación: ${status.rotatedAt} (hace ${daysOld} días)`);
        console.log(`   Key preview: ${status.key.substring(0, 15)}...`);
      } else {
        console.log(`⚪ ${provider.displayName}`);
        console.log(`   Estado: No configurada`);
      }
      console.log('');
    } catch (error) {
      console.log(`❌ ${provider.displayName}: Error obteniendo estado`);
      console.log('');
    }
  }

  console.log('💡 Tip: Las keys 🟢 están actualizadas, 🟡 necesitan rotación pronto, 🔴 urgente\n');
}

/**
 * Configurar Deepgram con capacidad de rotación automática
 */
async function setupDeepgram() {
  console.log('\n🔄 CONFIGURACIÓN DEEPGRAM - ROTACIÓN AUTOMÁTICA\n');
  console.log('Deepgram es el único proveedor con API de rotación completa.');
  console.log('Necesitarás tu Master API Key y Project ID.\n');

  const masterKey = await question('Master API Key de Deepgram: ');
  const projectId = await question('Project ID de Deepgram: ');

  if (!masterKey.trim() || !projectId.trim()) {
    console.log('❌ Master Key y Project ID son requeridos');
    return;
  }

  try {
    // Almacenar master key (usada para crear nuevas keys)
    await secretsManager.putSecretValue({
      SecretId: 'sandra/deepgram/master-key',
      SecretString: JSON.stringify({
        key: masterKey,
        projectId: projectId,
        createdAt: new Date().toISOString(),
        purpose: 'Master key for automatic rotation'
      })
    }).promise();

    console.log('\n✅ Master Key configurada');

    // Crear primera key con expiración
    console.log('🔄 Creando primera key con auto-expiración...');

    const response = await fetch(
      `https://api.deepgram.com/v1/projects/${projectId}/keys`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${masterKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: `Sandra-Initial-${Date.now()}`,
          scopes: ['usage:write'],
          time_to_live_in_seconds: 30 * 24 * 60 * 60 // 30 días
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Deepgram API error: ${response.status}`);
    }

    const data = await response.json();

    // Almacenar key activa
    await storeSecret('deepgram', data.key);

    console.log('✅ Primera key creada exitosamente');
    console.log(`🔑 Key ID: ${data.key_id}`);
    console.log(`📅 Expira en 30 días automáticamente`);
    console.log('\n🎯 Deepgram configurado para rotación 100% automática');
    console.log('   El sistema rotará la key cada 25 días sin intervención manual.\n');

  } catch (error) {
    console.error(`\n❌ Error configurando Deepgram: ${error.message}\n`);
  }
}

/**
 * Obtener key actual de Secrets Manager
 */
async function getCurrentKey(provider) {
  try {
    const secret = await secretsManager.getSecretValue({
      SecretId: `sandra/${provider}/api-key`
    }).promise();

    return JSON.parse(secret.SecretString);
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      return null;
    }
    throw error;
  }
}

/**
 * Almacenar secret en AWS Secrets Manager
 */
async function storeSecret(provider, key) {
  const secretData = {
    key: key,
    rotatedAt: new Date().toISOString(),
    rotationType: 'manual',
    rotatedBy: 'setup-script'
  };

  const secretId = `sandra/${provider}/api-key`;

  try {
    // Intentar actualizar si existe
    await secretsManager.putSecretValue({
      SecretId: secretId,
      SecretString: JSON.stringify(secretData)
    }).promise();
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      // Crear nuevo secret si no existe
      await secretsManager.createSecret({
        Name: secretId,
        Description: `Sandra IA - ${provider} API Key`,
        SecretString: JSON.stringify(secretData),
        Tags: [
          { Key: 'Project', Value: 'Sandra-IA' },
          { Key: 'Provider', Value: provider },
          { Key: 'ManagedBy', Value: 'AutoRotationSystem' }
        ]
      }).promise();
    } else {
      throw error;
    }
  }
}

/**
 * Ejecutar setup
 */
if (require.main === module) {
  setup().catch(error => {
    console.error('\n❌ ERROR FATAL:', error.message);
    console.error('Stack:', error.stack);
    rl.close();
    process.exit(1);
  });
}

module.exports = { setup, storeSecret, getCurrentKey };
