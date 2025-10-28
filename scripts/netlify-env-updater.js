#!/usr/bin/env node

/**
 * NETLIFY ENVIRONMENT UPDATER
 * ============================
 * Automated script to update Netlify environment variables
 * after API key rotation
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

// Configuration
const NETLIFY_SITE_ID = 'sensational-pegasus-d56cc3';
const ENV_SECURE_PATH = path.join(process.cwd(), '.env.secure');

// Environment variable mappings
const ENV_MAPPINGS = {
  // Primary AI Services
  OPENAI_API_KEY: { required: true, service: 'OpenAI GPT-4' },
  ANTHROPIC_API_KEY: { required: true, service: 'Claude AI' },
  GROQ_API_KEY: { required: true, service: 'GROQ LLM' },

  // Voice & Audio
  CARTESIA_API_KEY: { required: true, service: 'Cartesia TTS' },
  DEEPGRAM_API_KEY: { required: true, service: 'Deepgram STT' },

  // Avatar & Visual
  HEYGEN_API_KEY: { required: false, service: 'HeyGen Avatar' },

  // Payment
  PAYPAL_CLIENT_SECRET: { required: true, service: 'PayPal' },

  // Messaging
  META_ACCESS_TOKEN: { required: true, service: 'WhatsApp' },

  // Deployment
  NETLIFY_AUTH_TOKEN: { required: true, service: 'Netlify Deploy' }
};

/**
 * Verify API Key Format
 */
function verifyKeyFormat(key, provider) {
  const patterns = {
    OPENAI_API_KEY: /^sk-proj-[A-Za-z0-9]{48,}$/,
    ANTHROPIC_API_KEY: /^sk-ant-api[0-9]{2}-[A-Za-z0-9]{48,}$/,
    GROQ_API_KEY: /^gsk_[A-Za-z0-9]{48,}$/,
    CARTESIA_API_KEY: /^sk_car_[A-Za-z0-9]{20,}$/,
    DEEPGRAM_API_KEY: /^[a-f0-9]{32,}$/,
    NETLIFY_AUTH_TOKEN: /^nfp_[A-Za-z0-9]{40,}$/
  };

  if (patterns[provider]) {
    return patterns[provider].test(key);
  }

  // Generic validation for unknown providers
  return key && key.length > 10 && !key.includes('REPLACE_WITH');
}

/**
 * Read and validate secure environment file
 */
async function readSecureEnv() {
  try {
    const content = await fs.readFile(ENV_SECURE_PATH, 'utf8');
    const envVars = {};

    const lines = content.split('\n');
    for (const line of lines) {
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();

        if (key && value && !value.includes('REPLACE_WITH')) {
          envVars[key.trim()] = value;
        }
      }
    }

    return envVars;
  } catch (error) {
    console.error('Failed to read .env.secure:', error.message);
    return null;
  }
}

/**
 * Update Netlify environment variable
 */
function updateNetlifyEnv(key, value) {
  return new Promise((resolve, reject) => {
    const maskedValue = value.substring(0, 6) + '...' + value.substring(value.length - 6);

    console.log(`Updating ${key} (${maskedValue})...`);

    const command = `netlify env:set ${key} "${value}" --site ${NETLIFY_SITE_ID}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Failed to update ${key}: ${error.message}`);
        reject(error);
      } else {
        console.log(`✓ ${key} updated successfully`);
        resolve({ key, status: 'updated' });
      }
    });
  });
}

/**
 * Batch update all environment variables
 */
async function batchUpdateEnvVars(envVars) {
  const results = {
    updated: [],
    failed: [],
    skipped: []
  };

  console.log('\n' + '='.repeat(60));
  console.log('UPDATING NETLIFY ENVIRONMENT VARIABLES');
  console.log('='.repeat(60) + '\n');

  for (const [key, config] of Object.entries(ENV_MAPPINGS)) {
    const value = envVars[key];

    if (!value) {
      if (config.required) {
        console.log(`❌ ${key}: Missing (${config.service})`);
        results.failed.push({ key, reason: 'missing' });
      } else {
        console.log(`⚠️  ${key}: Skipped - optional`);
        results.skipped.push(key);
      }
      continue;
    }

    if (!verifyKeyFormat(value, key)) {
      console.log(`❌ ${key}: Invalid format`);
      results.failed.push({ key, reason: 'invalid_format' });
      continue;
    }

    try {
      await updateNetlifyEnv(key, value);
      results.updated.push(key);
    } catch (error) {
      results.failed.push({ key, reason: error.message });
    }
  }

  return results;
}

/**
 * Generate deployment verification script
 */
async function generateVerificationScript(results) {
  const script = `#!/bin/bash

# SANDRA IA 7.0 - Deployment Verification Script
# Generated: ${new Date().toISOString()}

echo "======================================"
echo "VERIFYING NETLIFY DEPLOYMENT"
echo "======================================"

# Check site status
netlify status --site ${NETLIFY_SITE_ID}

# List environment variables (keys only)
echo ""
echo "Environment Variables:"
netlify env:list --site ${NETLIFY_SITE_ID}

# Test deployment
echo ""
echo "Testing deployment..."
curl -I https://sensational-pegasus-d56cc3.netlify.app/

echo ""
echo "======================================"
echo "VERIFICATION COMPLETE"
echo "======================================"
echo ""
echo "Updated Keys: ${results.updated.length}"
echo "Failed Keys: ${results.failed.length}"
echo "Skipped Keys: ${results.skipped.length}"

${results.failed.length > 0 ? `
echo ""
echo "⚠️  FAILED KEYS REQUIRING MANUAL UPDATE:"
${results.failed.map(f => `echo "  - ${f.key}: ${f.reason}"`).join('\n')}
` : ''}

echo ""
echo "Next Steps:"
echo "1. Access Netlify dashboard: https://app.netlify.com/sites/${NETLIFY_SITE_ID}"
echo "2. Trigger new deployment"
echo "3. Monitor deployment logs"
echo "4. Test all API integrations"
`;

  const scriptPath = path.join(process.cwd(), 'verify-deployment.sh');
  await fs.writeFile(scriptPath, script);

  console.log(`\nVerification script created: ${scriptPath}`);

  return scriptPath;
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('NETLIFY ENVIRONMENT UPDATER');
  console.log('Automated Key Deployment System');
  console.log('='.repeat(60) + '\n');

  // Check if Netlify CLI is installed
  try {
    await new Promise((resolve, reject) => {
      exec('netlify --version', (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } catch {
    console.error('❌ Netlify CLI not installed');
    console.log('\nInstall with: npm install -g netlify-cli');
    process.exit(1);
  }

  // Read secure environment file
  console.log('Reading .env.secure file...');
  const envVars = await readSecureEnv();

  if (!envVars) {
    console.error('❌ Unable to read .env.secure file');
    console.log('\nPlease ensure you have updated .env.secure with new API keys');
    process.exit(1);
  }

  // Validate we have at least some keys
  const validKeys = Object.keys(envVars).filter(key =>
    ENV_MAPPINGS[key] && verifyKeyFormat(envVars[key], key)
  );

  if (validKeys.length === 0) {
    console.error('❌ No valid API keys found in .env.secure');
    console.log('\nPlease update .env.secure with your new API keys first');
    process.exit(1);
  }

  console.log(`Found ${validKeys.length} valid keys to update\n`);

  // Update Netlify environment variables
  const results = await batchUpdateEnvVars(envVars);

  // Generate verification script
  await generateVerificationScript(results);

  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log(`\n✓ Updated: ${results.updated.length} keys`);
  console.log(`❌ Failed: ${results.failed.length} keys`);
  console.log(`⚠️  Skipped: ${results.skipped.length} keys`);

  if (results.updated.length > 0) {
    console.log('\n✅ SUCCESS: Keys have been updated in Netlify');
    console.log('\nNext steps:');
    console.log('1. Trigger a new deployment in Netlify');
    console.log('2. Run ./verify-deployment.sh to verify');
    console.log('3. Test all API integrations');
    console.log('4. Delete old/compromised keys from provider dashboards');
  }

  if (results.failed.length > 0) {
    console.log('\n⚠️  WARNING: Some keys failed to update');
    console.log('Manual intervention required for:');
    results.failed.forEach(f => {
      console.log(`  - ${f.key}: ${f.reason}`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// Execute
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { readSecureEnv, updateNetlifyEnv, batchUpdateEnvVars };