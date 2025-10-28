/**
 * Sandra IA 7.0 - AUTORUN Setup Verification Script
 *
 * Verifica que todas las dependencias y configuraciones estén correctas
 * antes de iniciar el sistema de rotación automática.
 *
 * @author CTO Claude Code - Sandra IA Team
 * @date 2025-01-28
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🔍 SANDRA IA - VERIFICACIÓN DE SISTEMA AUTORUN');
console.log('='.repeat(70) + '\n');

let errors = 0;
let warnings = 0;
let checks = 0;

/**
 * Helper para mostrar resultados
 */
function check(name, condition, errorMsg, warnMsg = null, isWarning = false) {
  checks++;
  if (condition) {
    console.log(`✅ ${name}`);
    return true;
  } else {
    if (isWarning) {
      warnings++;
      console.log(`⚠️  ${name}: ${warnMsg || errorMsg}`);
    } else {
      errors++;
      console.log(`❌ ${name}: ${errorMsg}`);
    }
    return false;
  }
}

/**
 * Verificar dependencias Node.js
 */
console.log('📦 VERIFICANDO DEPENDENCIAS NODE.JS\n');

try {
  const packageJson = require('../package.json');
  check(
    'package.json existe',
    true,
    'No se encontró package.json'
  );

  const requiredDeps = ['aws-sdk', 'node-cron', 'node-fetch'];
  requiredDeps.forEach(dep => {
    check(
      `Dependencia: ${dep}`,
      packageJson.dependencies[dep],
      `${dep} no está en package.json. Ejecutar: npm install ${dep}`
    );
  });

} catch (error) {
  check('package.json', false, 'Error leyendo package.json: ' + error.message);
}

console.log('');

/**
 * Verificar archivos del sistema
 */
console.log('📄 VERIFICANDO ARCHIVOS DEL SISTEMA\n');

const requiredFiles = [
  {
    path: 'scripts/key-rotation-autorun.js',
    name: 'Sistema principal AUTORUN'
  },
  {
    path: 'scripts/aws-secrets-setup.js',
    name: 'Script de setup interactivo'
  },
  {
    path: 'AUTORUN-KEY-ROTATION-SYSTEM.md',
    name: 'Documentación completa'
  },
  {
    path: 'QUICKSTART-AUTORUN.md',
    name: 'Guía de inicio rápido'
  },
  {
    path: 'CEO-AUTORUN-SUMMARY.md',
    name: 'Resumen ejecutivo CEO'
  },
  {
    path: '.env.autorun.example',
    name: 'Template de configuración'
  }
];

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file.path);
  check(
    file.name,
    fs.existsSync(fullPath),
    `Archivo no encontrado: ${file.path}`
  );
});

console.log('');

/**
 * Verificar variables de entorno
 */
console.log('🔐 VERIFICANDO VARIABLES DE ENTORNO\n');

const envPath = path.join(__dirname, '..', '.env');
const hasEnvFile = fs.existsSync(envPath);

check(
  'Archivo .env existe',
  hasEnvFile,
  'No se encontró .env. Copiar desde .env.autorun.example',
  null,
  false
);

if (hasEnvFile) {
  require('dotenv').config({ path: envPath });

  // Obligatorias
  const requiredVars = [
    {
      name: 'AWS_ACCESS_KEY_ID',
      required: true,
      pattern: /^AKIA[0-9A-Z]{16}$/,
      example: 'AKIAIOSFODNN7EXAMPLE'
    },
    {
      name: 'AWS_SECRET_ACCESS_KEY',
      required: true,
      pattern: /^[A-Za-z0-9/+=]{40}$/,
      example: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    },
    {
      name: 'AWS_REGION',
      required: true,
      pattern: /^[a-z]{2}-[a-z]+-\d$/,
      example: 'us-east-1'
    },
    {
      name: 'NETLIFY_AUTH_TOKEN',
      required: true,
      pattern: /^nfp_[A-Za-z0-9_-]{40,}$/,
      example: 'nfp_YOUR_TOKEN'
    },
    {
      name: 'NETLIFY_SITE_ID',
      required: true,
      pattern: /^[a-z0-9-]{20,}$/,
      example: 'sensational-pegasus-d56cc3'
    }
  ];

  // Opcionales
  const optionalVars = [
    {
      name: 'WHATSAPP_TOKEN',
      required: false,
      pattern: /^EAA[A-Za-z0-9]{50,}$/,
      example: 'EAAxxxxxxxxxxxxx'
    },
    {
      name: 'WHATSAPP_PHONE_ID',
      required: false,
      pattern: /^\d{12,}$/,
      example: '123456789012345'
    },
    {
      name: 'CEO_WHATSAPP_PHONE',
      required: false,
      pattern: /^\+\d{10,}$/,
      example: '+34XXXXXXXXX'
    },
    {
      name: 'TELEGRAM_BOT_TOKEN',
      required: false,
      pattern: /^\d{10}:[A-Za-z0-9_-]{35}$/,
      example: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz'
    },
    {
      name: 'CEO_TELEGRAM_CHAT_ID',
      required: false,
      pattern: /^\d{9,}$/,
      example: '123456789'
    },
    {
      name: 'DEEPGRAM_PROJECT_ID',
      required: false,
      pattern: /^[a-f0-9-]{36}$/,
      example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    }
  ];

  // Verificar obligatorias
  requiredVars.forEach(varConfig => {
    const value = process.env[varConfig.name];
    const exists = !!value;

    if (exists) {
      const isValid = varConfig.pattern ? varConfig.pattern.test(value) : true;
      const isExample = value === varConfig.example ||
                       value.includes('EXAMPLE') ||
                       value.includes('YOUR_');

      if (isExample) {
        check(
          `${varConfig.name}`,
          false,
          `Contiene valor de ejemplo. Configurar con valor real.`
        );
      } else if (!isValid) {
        check(
          `${varConfig.name}`,
          false,
          `Formato inválido. Ejemplo esperado: ${varConfig.example}`
        );
      } else {
        check(
          `${varConfig.name}`,
          true,
          null
        );
      }
    } else {
      check(
        `${varConfig.name}`,
        false,
        'Variable no configurada (OBLIGATORIA)'
      );
    }
  });

  // Verificar opcionales
  optionalVars.forEach(varConfig => {
    const value = process.env[varConfig.name];
    const exists = !!value;

    if (exists) {
      const isValid = varConfig.pattern ? varConfig.pattern.test(value) : true;
      const isExample = value.includes('YOUR_') ||
                       value.includes('EXAMPLE') ||
                       value === varConfig.example;

      if (isExample) {
        check(
          `${varConfig.name} (opcional)`,
          true,
          null,
          'Contiene valor de ejemplo. Configurar para habilitar función.',
          true
        );
      } else if (!isValid) {
        check(
          `${varConfig.name} (opcional)`,
          true,
          null,
          `Formato inválido. Ejemplo: ${varConfig.example}`,
          true
        );
      } else {
        check(
          `${varConfig.name} (opcional)`,
          true,
          null
        );
      }
    } else {
      check(
        `${varConfig.name} (opcional)`,
        true,
        null,
        'No configurada. Función deshabilitada.',
        true
      );
    }
  });
}

console.log('');

/**
 * Verificar conectividad AWS (si credentials existen)
 */
if (process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_ACCESS_KEY_ID.includes('EXAMPLE')) {
  console.log('🔌 VERIFICANDO CONECTIVIDAD AWS\n');

  (async () => {
    try {
      const AWS = require('aws-sdk');
      const secretsManager = new AWS.SecretsManager({
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });

      await secretsManager.listSecrets({ MaxResults: 1 }).promise();

      check(
        'Conexión AWS Secrets Manager',
        true,
        null
      );

      console.log('');
    } catch (error) {
      check(
        'Conexión AWS Secrets Manager',
        false,
        `Error: ${error.message}. Verificar credentials y permisos IAM.`
      );
      console.log('');
    }

    printSummary();
  })();
} else {
  console.log('⏭️  SALTANDO VERIFICACIÓN AWS (Credentials no configuradas)\n');
  printSummary();
}

/**
 * Resumen final
 */
function printSummary() {
  console.log('='.repeat(70));
  console.log('📊 RESUMEN DE VERIFICACIÓN');
  console.log('='.repeat(70) + '\n');

  console.log(`Total de verificaciones: ${checks}`);
  console.log(`✅ Exitosas: ${checks - errors - warnings}`);
  console.log(`⚠️  Advertencias: ${warnings}`);
  console.log(`❌ Errores: ${errors}\n`);

  if (errors === 0) {
    console.log('🎉 ¡SISTEMA LISTO PARA DEPLOYMENT!\n');
    console.log('Próximos pasos:');
    console.log('  1. Ejecutar: npm run autorun:setup');
    console.log('  2. Configurar las 9 API keys');
    console.log('  3. Iniciar: npm run autorun:pm2\n');
    process.exit(0);
  } else if (errors <= 2 && warnings === 0) {
    console.log('⚠️  CASI LISTO - Corregir errores menores\n');
    console.log('Soluciones:');
    console.log('  - Verificar .env tiene valores reales (no ejemplos)');
    console.log('  - Regenerar AWS credentials si son inválidas');
    console.log('  - Ejecutar: npm install (si faltan dependencias)\n');
    process.exit(1);
  } else {
    console.log('❌ CONFIGURACIÓN INCOMPLETA\n');
    console.log('Soluciones:');
    console.log('  1. Revisar errores arriba (❌)');
    console.log('  2. Seguir guía: QUICKSTART-AUTORUN.md');
    console.log('  3. Verificar .env tiene todas las variables obligatorias');
    console.log('  4. Ejecutar: npm install\n');
    console.log('Contactar CTO Claude Code si necesitas asistencia.\n');
    process.exit(1);
  }
}
