#!/usr/bin/env node

// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - BACKEND SETUP SCRIPT
// Verify environment and dependencies for backend
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'═'.repeat(60)}`, 'blue');
  log(`  ${title}`, 'cyan');
  log('═'.repeat(60), 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Check functions
let checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function checkEnvVar(name, required = true) {
  const value = process.env[name];

  if (value) {
    logSuccess(`${name} is set`);
    checks.passed++;
    return true;
  } else if (required) {
    logError(`${name} is missing (required)`);
    checks.failed++;
    return false;
  } else {
    logWarning(`${name} is missing (optional)`);
    checks.warnings++;
    return false;
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    logSuccess(`${description} exists`);
    checks.passed++;
    return true;
  } else {
    logError(`${description} missing at ${filePath}`);
    checks.failed++;
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    logSuccess(`${description} exists`);
    checks.passed++;
    return true;
  } else {
    logError(`${description} missing at ${dirPath}`);
    checks.failed++;
    return false;
  }
}

function checkCommand(command, description) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    logSuccess(`${description} is installed`);
    checks.passed++;
    return true;
  } catch (error) {
    logError(`${description} not found`);
    checks.failed++;
    return false;
  }
}

async function checkOllama() {
  try {
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:11434/api/tags', { timeout: 5000 });

    if (response.ok) {
      const data = await response.json();
      logSuccess(`Ollama is running (${data.models?.length || 0} models)`);
      checks.passed++;

      // Check for required models
      const models = data.models || [];
      const requiredModels = ['qwen2.5:7b', 'mistral:7b', 'llama3.1:8b'];

      for (const model of requiredModels) {
        const found = models.some(m => m.name === model);
        if (found) {
          logSuccess(`Model ${model} is installed`);
          checks.passed++;
        } else {
          logWarning(`Model ${model} not found`);
          logInfo(`Install with: ollama pull ${model}`);
          checks.warnings++;
        }
      }

      return true;
    }
  } catch (error) {
    logError('Ollama is not running');
    logInfo('Start Ollama with: ollama serve');
    checks.failed++;
    return false;
  }
}

function checkPackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packagePath)) {
    logError('package.json not found');
    checks.failed++;
    return false;
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredDeps = [
    'uuid',
    'form-data',
    'sharp',
    'pdf-parse',
    'marked'
  ];

  let allInstalled = true;

  for (const dep of requiredDeps) {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      logSuccess(`Dependency ${dep} installed`);
      checks.passed++;
    } else {
      logError(`Dependency ${dep} missing`);
      logInfo(`Install with: npm install ${dep} --save`);
      checks.failed++;
      allInstalled = false;
    }
  }

  return allInstalled;
}

// Main setup function
async function setup() {
  log('\n', 'reset');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('  SANDRA IA - BACKEND SETUP & VERIFICATION', 'cyan');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('\n', 'reset');

  // 1. Check Environment Variables
  logSection('1. Environment Variables');
  logInfo('Loading .env file...\n');

  // Load .env
  require('dotenv').config();

  // Required
  checkEnvVar('GROQ_API_KEY', true);
  checkEnvVar('ANTHROPIC_API_KEY', true);
  checkEnvVar('OPENAI_API_KEY', true);
  checkEnvVar('CARTESIA_API_KEY', true);
  checkEnvVar('CARTESIA_VOICE_ID', true);

  // Optional
  checkEnvVar('OLLAMA_URL', false);
  checkEnvVar('NODE_ENV', false);
  checkEnvVar('LOG_LEVEL', false);

  // 2. Check File Structure
  logSection('2. File Structure');

  const baseDir = process.cwd();

  // Shared utilities
  checkDirectory(path.join(baseDir, 'netlify', 'functions', 'shared'), 'Shared utilities directory');
  checkFile(path.join(baseDir, 'netlify', 'functions', 'shared', 'config.js'), 'Config module');
  checkFile(path.join(baseDir, 'netlify', 'functions', 'shared', 'logger.js'), 'Logger module');
  checkFile(path.join(baseDir, 'netlify', 'functions', 'shared', 'middleware.js'), 'Middleware module');
  checkFile(path.join(baseDir, 'netlify', 'functions', 'shared', 'rate-limiter.js'), 'Rate limiter module');
  checkFile(path.join(baseDir, 'netlify', 'functions', 'shared', 'cache.js'), 'Cache module');

  // Endpoints
  checkDirectory(path.join(baseDir, 'netlify', 'functions', 'chat-local'), 'Chat Local endpoint');
  checkDirectory(path.join(baseDir, 'netlify', 'functions', 'voice'), 'Voice endpoint');
  checkDirectory(path.join(baseDir, 'netlify', 'functions', 'vision'), 'Vision endpoint');
  checkDirectory(path.join(baseDir, 'netlify', 'functions', 'documents'), 'Documents endpoint');
  checkDirectory(path.join(baseDir, 'netlify', 'functions', 'metrics'), 'Metrics endpoint');

  // Config files
  checkFile(path.join(baseDir, '.env'), 'Environment file (.env)');
  checkFile(path.join(baseDir, 'netlify.toml'), 'Netlify config');
  checkFile(path.join(baseDir, 'package.json'), 'Package manifest');

  // 3. Check Dependencies
  logSection('3. Node.js Dependencies');
  checkCommand('node', 'Node.js');
  checkCommand('npm', 'npm');
  checkPackageJson();

  // 4. Check Ollama
  logSection('4. Ollama Local Models');
  await checkOllama();

  // 5. Check Netlify CLI
  logSection('5. Netlify CLI');
  checkCommand('netlify', 'Netlify CLI');

  // 6. Summary
  logSection('Setup Summary');

  const total = checks.passed + checks.failed + checks.warnings;

  log(`\n✅ Passed:   ${checks.passed}/${total}`, 'green');
  log(`❌ Failed:   ${checks.failed}/${total}`, checks.failed > 0 ? 'red' : 'green');
  log(`⚠️  Warnings: ${checks.warnings}/${total}\n`, 'yellow');

  if (checks.failed === 0) {
    logSuccess('🎉 All critical checks passed! Backend is ready.');
    log('\nNext steps:', 'cyan');
    log('  1. Start Netlify Dev: netlify dev', 'blue');
    log('  2. Run tests: node tests/backend/api-tests.js', 'blue');
    log('  3. Check metrics: curl http://localhost:8888/.netlify/functions/metrics', 'blue');
    log('\n');
    process.exit(0);
  } else {
    logError('❌ Setup incomplete. Please fix the errors above.');
    log('\nCommon fixes:', 'cyan');
    log('  • Missing API keys: Add to .env file', 'blue');
    log('  • Missing dependencies: npm install', 'blue');
    log('  • Ollama not running: ollama serve', 'blue');
    log('  • Missing models: ollama pull <model-name>', 'blue');
    log('\n');
    process.exit(1);
  }
}

// Run setup
setup().catch(error => {
  logError(`Setup error: ${error.message}`);
  process.exit(1);
});
