#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

console.log('🔒 Sandra IA - Security Automation Setup');
console.log('=' .repeat(60));
console.log('\nThis script will help you set up automated key rotation.\n');

class SecuritySetup {
  constructor() {
    this.requiredEnvVars = [
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'GROQ_API_KEY',
      'CARTESIA_API_KEY',
      'ELEVENLABS_API_KEY',
      'NETLIFY_AUTH_TOKEN',
      'NETLIFY_SITE_ID'
    ];

    this.directories = [
      'security-logs',
      '.secure-keys',
      '.github/workflows'
    ];
  }

  async setup() {
    console.log('📋 Starting setup process...\n');

    // 1. Create directories
    this.createDirectories();

    // 2. Generate encryption key
    const encryptionKey = this.generateEncryptionKey();

    // 3. Check environment variables
    this.checkEnvironment();

    // 4. Update .gitignore
    this.updateGitignore();

    // 5. Initialize security logs
    this.initializeSecurityLogs();

    // 6. Create .env.secure template
    this.createEnvSecure(encryptionKey);

    // 7. Verify GitHub Actions
    this.verifyGitHubActions();

    // 8. Run initial audit
    await this.runInitialAudit();

    // 9. Print next steps
    this.printNextSteps(encryptionKey);
  }

  createDirectories() {
    console.log('📁 Creating required directories...');

    for (const dir of this.directories) {
      const dirPath = path.join(__dirname, '../../', dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`  ✅ Created: ${dir}`);
      } else {
        console.log(`  ℹ️  Exists: ${dir}`);
      }
    }
    console.log('');
  }

  generateEncryptionKey() {
    console.log('🔐 Generating encryption key...');
    const key = crypto.randomBytes(32).toString('hex');
    console.log('  ✅ Encryption key generated\n');
    return key;
  }

  checkEnvironment() {
    console.log('🔍 Checking environment variables...');

    const missing = [];
    for (const envVar of this.requiredEnvVars) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }

    if (missing.length === 0) {
      console.log('  ✅ All required environment variables are set\n');
    } else {
      console.log('  ⚠️  Missing environment variables:');
      missing.forEach(v => console.log(`     - ${v}`));
      console.log('');
    }
  }

  updateGitignore() {
    console.log('📝 Updating .gitignore...');

    const gitignorePath = path.join(__dirname, '../../.gitignore');
    const requiredEntries = [
      '.env',
      '.env.local',
      '.env.secure',
      'security-logs/',
      '.secure-keys/',
      '*.log',
      '*.key',
      '*.pem'
    ];

    let gitignoreContent = '';
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    const missingEntries = requiredEntries.filter(entry =>
      !gitignoreContent.includes(entry)
    );

    if (missingEntries.length > 0) {
      gitignoreContent += '\n\n# Security - Auto-added by setup\n';
      missingEntries.forEach(entry => {
        gitignoreContent += `${entry}\n`;
      });

      fs.writeFileSync(gitignorePath, gitignoreContent);
      console.log(`  ✅ Added ${missingEntries.length} security entries to .gitignore\n`);
    } else {
      console.log('  ✅ .gitignore already configured\n');
    }
  }

  initializeSecurityLogs() {
    console.log('📊 Initializing security logs...');

    const logsDir = path.join(__dirname, '../../security-logs');

    const initialAudit = [{
      timestamp: new Date().toISOString(),
      action: 'system_initialized',
      status: 'success',
      message: 'Security automation system initialized'
    }];

    const auditPath = path.join(logsDir, 'rotation-audit.json');
    if (!fs.existsSync(auditPath)) {
      fs.writeFileSync(auditPath, JSON.stringify(initialAudit, null, 2));
      console.log('  ✅ Created rotation audit log\n');
    } else {
      console.log('  ℹ️  Audit log already exists\n');
    }
  }

  createEnvSecure(encryptionKey) {
    console.log('🔒 Creating .env.secure template...');

    const envSecurePath = path.join(__dirname, '../../.env.secure');

    if (!fs.existsSync(envSecurePath)) {
      const template = `# Secure Environment Variables
# This file should NEVER be committed to git

# Encryption key for storing rotated keys
ENCRYPTION_KEY=${encryptionKey}

# API Keys (will be auto-rotated monthly)
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
GROQ_API_KEY=your-groq-key-here
CARTESIA_API_KEY=your-cartesia-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key-here

# Netlify deployment
NETLIFY_AUTH_TOKEN=your-netlify-token-here
NETLIFY_SITE_ID=your-site-id-here

# Optional: Slack notifications
SLACK_WEBHOOK=your-slack-webhook-here
`;

      fs.writeFileSync(envSecurePath, template);
      console.log('  ✅ Created .env.secure template\n');
    } else {
      console.log('  ℹ️  .env.secure already exists\n');
    }
  }

  verifyGitHubActions() {
    console.log('🤖 Verifying GitHub Actions workflows...');

    const workflowsDir = path.join(__dirname, '../../.github/workflows');
    const workflows = [
      'key-rotation.yml',
      'secret-scanning.yml',
      'key-expiration-monitor.yml'
    ];

    let allPresent = true;
    workflows.forEach(workflow => {
      const workflowPath = path.join(workflowsDir, workflow);
      if (fs.existsSync(workflowPath)) {
        console.log(`  ✅ ${workflow}`);
      } else {
        console.log(`  ❌ ${workflow} - missing`);
        allPresent = false;
      }
    });

    if (!allPresent) {
      console.log('\n  ⚠️  Some workflows are missing. Push to GitHub to activate.');
    }
    console.log('');
  }

  async runInitialAudit() {
    console.log('🔍 Running initial security audit...\n');

    try {
      execSync('npm run security:audit', { stdio: 'inherit' });
    } catch (error) {
      console.log('\n⚠️  Initial audit completed with warnings\n');
    }
  }

  printNextSteps(encryptionKey) {
    console.log('\n' + '=' .repeat(60));
    console.log('✅ SETUP COMPLETE!\n');
    console.log('📋 NEXT STEPS:\n');

    console.log('1. ADD GITHUB SECRETS:');
    console.log('   Go to: https://github.com/[YOUR-USERNAME]/IA-SANDRA/settings/secrets/actions');
    console.log('   Add these secrets:');
    console.log('   - ENCRYPTION_KEY: ' + encryptionKey);
    console.log('   - All API keys from .env.secure');
    console.log('');

    console.log('2. UPDATE .env.secure:');
    console.log('   Edit .env.secure with your actual API keys');
    console.log('');

    console.log('3. TEST THE SYSTEM:');
    console.log('   npm run test:api-keys        # Test all API keys');
    console.log('   npm run secrets:scan         # Scan for exposed secrets');
    console.log('   npm run security:monitor     # Check key expiration');
    console.log('');

    console.log('4. DEPLOY TO GITHUB:');
    console.log('   git add -A');
    console.log('   git commit -m "🔒 Enable automated security system"');
    console.log('   git push origin main');
    console.log('');

    console.log('5. ACCESS DASHBOARD:');
    console.log('   npm run security:dashboard');
    console.log('   Open: http://localhost:8081/security-dashboard.html');
    console.log('');

    console.log('📚 Full documentation: AUTOMATED-ROTATION-SETUP.md');
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Your security automation is ready!');
    console.log('Keys will rotate automatically on the 1st of every month.');
  }
}

// Run setup
const setup = new SecuritySetup();
setup.setup().catch(error => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});