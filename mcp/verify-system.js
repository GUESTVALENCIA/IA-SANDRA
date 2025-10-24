// ═══════════════════════════════════════════════════════
// SANDRA MCP - SCRIPT DE VERIFICACIÓN
// Verifica que todos los agentes MCP estén listos
// ═══════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO SISTEMA MCP SANDRA PROFESSIONAL\n');
console.log('═'.repeat(60));

// Verificar archivos de agentes
const agents = [
  { name: 'Orchestrator', file: './orchestrator.js' },
  { name: 'Dev Agent', file: './agents/dev-agent.js' },
  { name: 'Voice Agent', file: './agents/voice-agent.js' },
  { name: 'AI Agent', file: './agents/ai-agent.js' },
  { name: 'Business Agent', file: './agents/business-agent.js' },
  { name: 'Comms Agent', file: './agents/comms-agent.js' }
];

console.log('\n📁 VERIFICANDO ARCHIVOS DE AGENTES:\n');

let allFilesExist = true;
agents.forEach(agent => {
  const filePath = path.join(__dirname, agent.file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${agent.name.padEnd(20)} → ${agent.file}`);
  if (!exists) allFilesExist = false;
});

// Verificar package.json y node_modules
console.log('\n📦 VERIFICANDO DEPENDENCIAS:\n');

const packageJsonPath = path.join(__dirname, 'package.json');
const nodeModulesPath = path.join(__dirname, 'node_modules');

const hasPackageJson = fs.existsSync(packageJsonPath);
const hasNodeModules = fs.existsSync(nodeModulesPath);

console.log(`${hasPackageJson ? '✅' : '❌'} package.json`);
console.log(`${hasNodeModules ? '✅' : '❌'} node_modules/`);

// Verificar módulos críticos
if (hasNodeModules) {
  const criticalModules = [
    '@modelcontextprotocol/sdk',
    '@anthropic-ai/sdk',
    'openai',
    'groq-sdk',
    '@octokit/rest',
    'axios',
    'dotenv'
  ];

  console.log('\n📚 MÓDULOS CRÍTICOS:');
  criticalModules.forEach(mod => {
    const modPath = path.join(nodeModulesPath, mod);
    const exists = fs.existsSync(modPath);
    console.log(`${exists ? '✅' : '❌'} ${mod}`);
  });
}

// Verificar variables de entorno
console.log('\n🔐 VERIFICANDO VARIABLES DE ENTORNO:\n');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const envVars = [
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'GROQ_API_KEY',
  'HEYGEN_API_KEY',
  'ELEVENLABS_API_KEY',
  'GITHUB_TOKEN',
  'NETLIFY_AUTH_TOKEN',
  'PAYPAL_CLIENT_ID',
  'META_ACCESS_TOKEN'
];

let allVarsPresent = true;
envVars.forEach(varName => {
  const exists = !!process.env[varName];
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${varName}`);
  if (!exists) allVarsPresent = false;
});

// Verificar configuración de Claude Desktop
console.log('\n💻 VERIFICANDO CLAUDE DESKTOP CONFIG:\n');

const claudeConfigPath = path.join(
  process.env.APPDATA || '',
  'Claude',
  'claude_desktop_config.json'
);

const hasClaudeConfig = fs.existsSync(claudeConfigPath);
console.log(`${hasClaudeConfig ? '✅' : '❌'} Claude Desktop config.json`);

if (hasClaudeConfig) {
  try {
    const config = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf8'));
    const sandraServers = Object.keys(config.mcpServers || {}).filter(key => 
      key.startsWith('sandra-')
    );
    console.log(`\n   Agentes configurados: ${sandraServers.length}/6`);
    sandraServers.forEach(server => {
      console.log(`   ✓ ${server}`);
    });
  } catch (err) {
    console.log('   ⚠️  Error al leer configuración');
  }
}

// Resumen final
console.log('\n' + '═'.repeat(60));
console.log('\n📊 RESUMEN:\n');

if (allFilesExist && hasPackageJson && hasNodeModules && allVarsPresent && hasClaudeConfig) {
  console.log('✅ SISTEMA MCP COMPLETAMENTE OPERATIVO');
  console.log('\n🚀 PRÓXIMOS PASOS:');
  console.log('   1. Cierra y reinicia Claude Desktop');
  console.log('   2. Los agentes se cargarán automáticamente');
  console.log('   3. Usa comandos como: delegate_task, get_agent_status\n');
} else {
  console.log('⚠️  SISTEMA REQUIERE CONFIGURACIÓN ADICIONAL\n');
  if (!allFilesExist) console.log('   • Faltan archivos de agentes');
  if (!hasNodeModules) console.log('   • Ejecuta: npm install');
  if (!allVarsPresent) console.log('   • Configura variables en .env');
  if (!hasClaudeConfig) console.log('   • Configura Claude Desktop');
  console.log('');
}

console.log('═'.repeat(60) + '\n');
