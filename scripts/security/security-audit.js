#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityAudit {
  constructor() {
    this.auditResults = {
      timestamp: new Date().toISOString(),
      checks: {},
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async runFullAudit() {
    console.log('🔒 Starting comprehensive security audit...\n');
    console.log('=' .repeat(60));

    // 1. Check for exposed secrets
    await this.checkForSecrets();

    // 2. Verify API key status
    await this.verifyAPIKeys();

    // 3. Check key expiration
    await this.checkKeyExpiration();

    // 4. Verify GitHub Actions
    await this.verifyGitHubActions();

    // 5. Check security headers
    await this.checkSecurityHeaders();

    // 6. Verify encryption setup
    await this.verifyEncryption();

    // 7. Check audit logs
    await this.checkAuditLogs();

    // 8. Generate report
    this.generateReport();

    console.log('\n' + '=' .repeat(60));
    this.printSummary();

    return this.auditResults;
  }

  async checkForSecrets() {
    console.log('\n📝 Checking for exposed secrets...');

    try {
      const SecretScanner = require('./secret-scanner');
      const scanner = new SecretScanner();
      const result = await scanner.scan('.');

      if (result) {
        this.auditResults.checks.secrets = {
          status: 'passed',
          message: 'No secrets found in codebase'
        };
        this.auditResults.summary.passed++;
        console.log('  ✅ No exposed secrets detected');
      } else {
        this.auditResults.checks.secrets = {
          status: 'failed',
          message: 'Secrets detected in codebase',
          findings: scanner.findings
        };
        this.auditResults.summary.failed++;
        console.log('  ❌ Secrets found! Review security-logs/secret-scan-report.json');
      }
    } catch (error) {
      this.auditResults.checks.secrets = {
        status: 'error',
        message: error.message
      };
      this.auditResults.summary.failed++;
      console.log('  ⚠️  Secret scan failed:', error.message);
    }
  }

  async verifyAPIKeys() {
    console.log('\n🔑 Verifying API keys...');

    try {
      const APIKeyTester = require('./test-api-keys');
      const tester = new APIKeyTester();
      const results = await tester.testAll();

      const allValid = Object.values(results).every(r => r.status === 'valid');

      if (allValid) {
        this.auditResults.checks.apiKeys = {
          status: 'passed',
          message: 'All API keys are valid',
          details: results
        };
        this.auditResults.summary.passed++;
        console.log('  ✅ All API keys are valid');
      } else {
        this.auditResults.checks.apiKeys = {
          status: 'failed',
          message: 'Some API keys are invalid',
          details: results
        };
        this.auditResults.summary.failed++;
        console.log('  ❌ Some API keys are invalid or missing');
      }
    } catch (error) {
      this.auditResults.checks.apiKeys = {
        status: 'error',
        message: error.message
      };
      this.auditResults.summary.failed++;
      console.log('  ⚠️  API key verification failed:', error.message);
    }
  }

  async checkKeyExpiration() {
    console.log('\n📅 Checking key expiration...');

    try {
      const KeyExpirationMonitor = require('../key-expiration-monitor');
      const monitor = new KeyExpirationMonitor();
      const status = await monitor.getStatus();

      if (status.healthy) {
        this.auditResults.checks.expiration = {
          status: 'passed',
          message: `Keys valid for ${status.daysUntilExpiration} more days`,
          details: status
        };
        this.auditResults.summary.passed++;
        console.log(`  ✅ Keys expire in ${status.daysUntilExpiration} days`);
      } else if (status.daysUntilExpiration < 14) {
        this.auditResults.checks.expiration = {
          status: 'warning',
          message: `Keys expire soon (${status.daysUntilExpiration} days)`,
          details: status
        };
        this.auditResults.summary.warnings++;
        console.log(`  ⚠️  Keys expire in ${status.daysUntilExpiration} days - rotation recommended`);
      } else {
        this.auditResults.checks.expiration = {
          status: 'failed',
          message: 'Keys expired or critical',
          details: status
        };
        this.auditResults.summary.failed++;
        console.log('  ❌ Keys expired or in critical state');
      }
    } catch (error) {
      this.auditResults.checks.expiration = {
        status: 'error',
        message: error.message
      };
      this.auditResults.summary.failed++;
      console.log('  ⚠️  Expiration check failed:', error.message);
    }
  }

  async verifyGitHubActions() {
    console.log('\n🤖 Verifying GitHub Actions...');

    const workflowsDir = path.join(__dirname, '../../.github/workflows');
    const requiredWorkflows = [
      'key-rotation.yml',
      'secret-scanning.yml',
      'key-expiration-monitor.yml'
    ];

    let allPresent = true;
    const missing = [];

    for (const workflow of requiredWorkflows) {
      const workflowPath = path.join(workflowsDir, workflow);
      if (!fs.existsSync(workflowPath)) {
        allPresent = false;
        missing.push(workflow);
      }
    }

    if (allPresent) {
      this.auditResults.checks.githubActions = {
        status: 'passed',
        message: 'All required workflows are present'
      };
      this.auditResults.summary.passed++;
      console.log('  ✅ All GitHub Actions workflows configured');
    } else {
      this.auditResults.checks.githubActions = {
        status: 'failed',
        message: 'Missing required workflows',
        missing
      };
      this.auditResults.summary.failed++;
      console.log('  ❌ Missing workflows:', missing.join(', '));
    }
  }

  async checkSecurityHeaders() {
    console.log('\n🛡️  Checking security configuration...');

    const checks = {
      envExample: fs.existsSync('.env.example'),
      gitignore: fs.existsSync('.gitignore'),
      securityDashboard: fs.existsSync('public/admin/security-dashboard.html')
    };

    const gitignoreContent = fs.existsSync('.gitignore')
      ? fs.readFileSync('.gitignore', 'utf8')
      : '';

    const properGitignore = gitignoreContent.includes('.env') &&
                           gitignoreContent.includes('security-logs/') &&
                           gitignoreContent.includes('.secure-keys/');

    if (checks.envExample && checks.gitignore && properGitignore && checks.securityDashboard) {
      this.auditResults.checks.securityConfig = {
        status: 'passed',
        message: 'Security configuration properly set up'
      };
      this.auditResults.summary.passed++;
      console.log('  ✅ Security configuration complete');
    } else {
      this.auditResults.checks.securityConfig = {
        status: 'warning',
        message: 'Some security configurations missing',
        details: {
          ...checks,
          properGitignore
        }
      };
      this.auditResults.summary.warnings++;
      console.log('  ⚠️  Some security configurations missing');
    }
  }

  async verifyEncryption() {
    console.log('\n🔐 Verifying encryption setup...');

    const hasEncryptionKey = !!process.env.ENCRYPTION_KEY;
    const secureKeyDir = path.join(__dirname, '../../.secure-keys');
    const hasSecureDir = fs.existsSync(secureKeyDir);

    if (hasEncryptionKey && hasSecureDir) {
      this.auditResults.checks.encryption = {
        status: 'passed',
        message: 'Encryption properly configured'
      };
      this.auditResults.summary.passed++;
      console.log('  ✅ Encryption setup complete');
    } else {
      this.auditResults.checks.encryption = {
        status: 'warning',
        message: 'Encryption not fully configured',
        details: {
          hasEncryptionKey,
          hasSecureDir
        }
      };
      this.auditResults.summary.warnings++;
      console.log('  ⚠️  Encryption setup incomplete');
    }
  }

  async checkAuditLogs() {
    console.log('\n📋 Checking audit logs...');

    const logsDir = path.join(__dirname, '../../security-logs');
    const hasLogsDir = fs.existsSync(logsDir);

    if (hasLogsDir) {
      const logs = fs.readdirSync(logsDir);
      this.auditResults.checks.auditLogs = {
        status: 'passed',
        message: `Audit logs present (${logs.length} files)`,
        files: logs
      };
      this.auditResults.summary.passed++;
      console.log(`  ✅ Audit logs configured (${logs.length} log files)`);
    } else {
      this.auditResults.checks.auditLogs = {
        status: 'warning',
        message: 'Audit logs directory not found'
      };
      this.auditResults.summary.warnings++;
      console.log('  ⚠️  Audit logs directory not found');
    }
  }

  generateReport() {
    const reportPath = path.join(__dirname, '../../security-logs');

    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const reportFile = path.join(reportPath, `security-audit-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(this.auditResults, null, 2));

    console.log(`\n📄 Full report saved to: ${reportFile}`);
  }

  printSummary() {
    const { passed, failed, warnings } = this.auditResults.summary;
    const total = passed + failed + warnings;

    console.log('\n📊 AUDIT SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total checks: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);

    if (failed === 0 && warnings === 0) {
      console.log('\n🎉 EXCELLENT! All security checks passed!');
      console.log('Your application is properly secured and monitored.');
    } else if (failed === 0) {
      console.log('\n✅ GOOD! No critical issues found.');
      console.log(`Review the ${warnings} warning(s) for improvements.`);
    } else {
      console.log('\n🚨 ACTION REQUIRED!');
      console.log(`${failed} critical issue(s) need immediate attention.`);
    }

    // Recommendations
    if (failed > 0 || warnings > 0) {
      console.log('\n📋 RECOMMENDATIONS:');

      if (this.auditResults.checks.secrets?.status === 'failed') {
        console.log('  1. Remove exposed secrets immediately');
        console.log('     Run: npm run rotation:emergency-revoke');
      }

      if (this.auditResults.checks.apiKeys?.status === 'failed') {
        console.log('  2. Rotate invalid API keys');
        console.log('     Run: npm run rotation:start');
      }

      if (this.auditResults.checks.expiration?.status === 'warning') {
        console.log('  3. Schedule key rotation soon');
        console.log('     Run: npm run rotation:start');
      }

      if (this.auditResults.checks.githubActions?.status === 'failed') {
        console.log('  4. Configure missing GitHub Actions workflows');
        console.log('     See: AUTOMATED-ROTATION-SETUP.md');
      }
    }
  }
}

// CLI execution
if (require.main === module) {
  console.log('🔒 SANDRA IA - Security Audit Tool v1.0');
  console.log('=' .repeat(60));

  const audit = new SecurityAudit();

  audit.runFullAudit()
    .then(results => {
      const exitCode = results.summary.failed > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('\n❌ Audit failed:', error);
      process.exit(1);
    });
}

module.exports = SecurityAudit;