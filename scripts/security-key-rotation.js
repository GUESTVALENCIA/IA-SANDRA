#!/usr/bin/env node

/**
 * SANDRA IA 7.0 - EMERGENCY API KEY ROTATION SCRIPT
 * ===================================================
 * Security Auditor: Claude Code Enterprise
 * Date: 2025-10-28
 * Status: CRITICAL - Immediate Execution Required
 *
 * EXPOSED KEYS REQUIRING ROTATION:
 * - OpenAI API Key
 * - Anthropic API Key
 * - GROQ API Key
 * - Cartesia TTS Key
 * - Deepgram STT Key
 * - HeyGen Avatar Key
 * - PayPal Client Secret
 * - Meta/WhatsApp Access Token
 * - Netlify Deploy Token
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Security Configuration
const ROTATION_CONFIG = {
  timestamp: new Date().toISOString(),
  executorId: 'claude-code-security-auditor',
  projectId: 'sandra-ia-7.0',
  environment: 'production',
  logPath: path.join(process.cwd(), 'security-logs'),
  backupPath: path.join(process.cwd(), '.secure-backup')
};

// Key Rotation Status Tracker
const rotationStatus = {
  totalKeys: 10,
  rotated: [],
  failed: [],
  manual: [],
  startTime: Date.now()
};

/**
 * Security Logging System
 */
class SecurityLogger {
  constructor() {
    this.logFile = path.join(ROTATION_CONFIG.logPath, `key-rotation-${Date.now()}.log`);
  }

  async init() {
    await fs.mkdir(ROTATION_CONFIG.logPath, { recursive: true });
    await fs.mkdir(ROTATION_CONFIG.backupPath, { recursive: true });
    await this.log('SECURITY AUDIT INITIATED', 'info');
  }

  async log(message, level = 'info', data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      data,
      hash: crypto.createHash('sha256').update(JSON.stringify({ message, data })).digest('hex')
    };

    const logLine = JSON.stringify(entry) + '\n';

    try {
      await fs.appendFile(this.logFile, logLine);
      console.log(`[${level.toUpperCase()}] ${message}`);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  async auditTrail(action, provider, oldKeyMask, newKeyMask, status) {
    const audit = {
      timestamp: new Date().toISOString(),
      action,
      provider,
      oldKey: oldKeyMask,
      newKey: newKeyMask,
      status,
      verificationHash: crypto.createHash('sha256').update(newKeyMask || '').digest('hex')
    };

    const auditFile = path.join(ROTATION_CONFIG.logPath, 'audit-trail.json');

    try {
      let audits = [];
      try {
        const existing = await fs.readFile(auditFile, 'utf8');
        audits = JSON.parse(existing);
      } catch {
        // File doesn't exist yet
      }

      audits.push(audit);
      await fs.writeFile(auditFile, JSON.stringify(audits, null, 2));
    } catch (error) {
      await this.log(`Failed to write audit trail: ${error.message}`, 'error');
    }
  }
}

/**
 * API Key Rotation Manager
 */
class KeyRotationManager {
  constructor(logger) {
    this.logger = logger;
    this.newKeys = {};
    this.verificationResults = {};
  }

  maskKey(key) {
    if (!key) return 'N/A';
    const visibleChars = 6;
    if (key.length <= visibleChars * 2) return key.replace(/./g, '*');
    return key.substring(0, visibleChars) + '...' + key.substring(key.length - visibleChars);
  }

  /**
   * OpenAI Key Rotation
   */
  async rotateOpenAI() {
    const provider = 'OpenAI';
    const oldKey = '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';

    try {
      await this.logger.log(`Starting ${provider} key rotation`, 'info');

      // Note: OpenAI doesn't have a direct API endpoint for key rotation
      // Keys must be rotated via dashboard: https://platform.openai.com/api-keys

      rotationStatus.manual.push(provider);

      await this.logger.auditTrail(
        'ROTATION_REQUIRED',
        provider,
        this.maskKey(oldKey),
        'MANUAL_GENERATION_REQUIRED',
        'MANUAL'
      );

      await this.logger.log(`${provider} requires manual rotation via dashboard`, 'warning', {
        url: 'https://platform.openai.com/api-keys',
        steps: [
          '1. Login to OpenAI dashboard',
          '2. Navigate to API Keys section',
          '3. Create new key named: sandra-ia-production-20251028',
          '4. Delete old compromised key',
          '5. Update Netlify environment variables'
        ]
      });

      return { status: 'manual', provider };
    } catch (error) {
      await this.logger.log(`Failed to rotate ${provider} key: ${error.message}`, 'error');
      rotationStatus.failed.push(provider);
      return { status: 'failed', provider, error: error.message };
    }
  }

  /**
   * Anthropic Key Rotation
   */
  async rotateAnthropic() {
    const provider = 'Anthropic';
    const oldKey = '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';

    try {
      await this.logger.log(`Starting ${provider} key rotation`, 'info');

      // Anthropic requires dashboard rotation
      rotationStatus.manual.push(provider);

      await this.logger.auditTrail(
        'ROTATION_REQUIRED',
        provider,
        this.maskKey(oldKey),
        'MANUAL_GENERATION_REQUIRED',
        'MANUAL'
      );

      await this.logger.log(`${provider} requires manual rotation`, 'warning', {
        url: 'https://console.anthropic.com/settings/keys',
        steps: [
          '1. Login to Anthropic Console',
          '2. Navigate to API Keys',
          '3. Create new key: sandra-ia-secure-20251028',
          '4. Revoke compromised key',
          '5. Update in Netlify'
        ]
      });

      return { status: 'manual', provider };
    } catch (error) {
      await this.logger.log(`Failed to rotate ${provider} key: ${error.message}`, 'error');
      rotationStatus.failed.push(provider);
      return { status: 'failed', provider, error: error.message };
    }
  }

  /**
   * GROQ Key Rotation
   */
  async rotateGroq() {
    const provider = 'GROQ';
    const oldKey = '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';

    try {
      await this.logger.log(`Starting ${provider} key rotation`, 'info');

      rotationStatus.manual.push(provider);

      await this.logger.auditTrail(
        'ROTATION_REQUIRED',
        provider,
        this.maskKey(oldKey),
        'MANUAL_GENERATION_REQUIRED',
        'MANUAL'
      );

      await this.logger.log(`${provider} requires manual rotation`, 'warning', {
        url: 'https://console.groq.com/keys',
        steps: [
          '1. Login to GROQ Console',
          '2. Navigate to API Keys section',
          '3. Generate new key',
          '4. Name it: sandra-ia-production-secure',
          '5. Delete compromised key'
        ]
      });

      return { status: 'manual', provider };
    } catch (error) {
      await this.logger.log(`Failed to rotate ${provider} key: ${error.message}`, 'error');
      rotationStatus.failed.push(provider);
      return { status: 'failed', provider, error: error.message };
    }
  }

  /**
   * Cartesia TTS Key Rotation
   */
  async rotateCartesia() {
    const provider = 'Cartesia';
    const oldKey = 'sk_car_67c5Tg8LMpR9G6unHvsvnw';

    try {
      await this.logger.log(`Starting ${provider} key rotation`, 'info');

      rotationStatus.manual.push(provider);

      await this.logger.auditTrail(
        'ROTATION_REQUIRED',
        provider,
        this.maskKey(oldKey),
        'MANUAL_GENERATION_REQUIRED',
        'MANUAL'
      );

      await this.logger.log(`${provider} requires manual rotation`, 'warning', {
        url: 'https://play.cartesia.ai/settings',
        steps: [
          '1. Login to Cartesia Dashboard',
          '2. Go to Settings > API Keys',
          '3. Create new API key',
          '4. Delete old compromised key',
          '5. Update Netlify variables'
        ]
      });

      return { status: 'manual', provider };
    } catch (error) {
      await this.logger.log(`Failed to rotate ${provider} key: ${error.message}`, 'error');
      rotationStatus.failed.push(provider);
      return { status: 'failed', provider, error: error.message };
    }
  }

  /**
   * Deepgram STT Key Rotation
   */
  async rotateDeepgram() {
    const provider = 'Deepgram';
    const oldKey = '30e9dbaec29dcde1b23a8bd9de31438c74f23522';

    try {
      await this.logger.log(`Starting ${provider} key rotation`, 'info');

      rotationStatus.manual.push(provider);

      await this.logger.auditTrail(
        'ROTATION_REQUIRED',
        provider,
        this.maskKey(oldKey),
        'MANUAL_GENERATION_REQUIRED',
        'MANUAL'
      );

      await this.logger.log(`${provider} requires manual rotation`, 'warning', {
        url: 'https://console.deepgram.com/project/keys',
        steps: [
          '1. Login to Deepgram Console',
          '2. Navigate to API Keys',
          '3. Create new key with description: sandra-ia-secure-2025',
          '4. Revoke old key',
          '5. Update in production'
        ]
      });

      return { status: 'manual', provider };
    } catch (error) {
      await this.logger.log(`Failed to rotate ${provider} key: ${error.message}`, 'error');
      rotationStatus.failed.push(provider);
      return { status: 'failed', provider, error: error.message };
    }
  }

  /**
   * Generate Secure Environment File
   */
  async generateSecureEnv() {
    const secureEnvPath = path.join(process.cwd(), '.env.secure');

    const template = `# SANDRA IA 7.0 - SECURE PRODUCTION ENVIRONMENT
# Generated: ${new Date().toISOString()}
# Security Audit: Complete
# Status: KEYS PENDING ROTATION

# ============================================
# CRITICAL: Replace these with new keys from dashboards
# ============================================

# OpenAI (Dashboard: https://platform.openai.com/api-keys)
OPENAI_API_KEY=REPLACE_WITH_NEW_KEY_FROM_DASHBOARD
OPENAI_MODEL=gpt-4o

# Anthropic (Dashboard: https://console.anthropic.com/settings/keys)
ANTHROPIC_API_KEY=REPLACE_WITH_NEW_KEY_FROM_DASHBOARD

# GROQ (Dashboard: https://console.groq.com/keys)
GROQ_API_KEY=REPLACE_WITH_NEW_KEY_FROM_DASHBOARD
GROQ_MODEL=mixtral-8x7b-32768

# Cartesia TTS (Dashboard: https://play.cartesia.ai/settings)
CARTESIA_API_KEY=REPLACE_WITH_NEW_KEY_FROM_DASHBOARD
CARTESIA_VOICE_ID=a34aec03-0f17-4fff-903f-d9458a8a92a6

# Deepgram STT (Dashboard: https://console.deepgram.com/project/keys)
DEEPGRAM_API_KEY=REPLACE_WITH_NEW_KEY_FROM_DASHBOARD

# HeyGen Avatar (Dashboard: https://www.heygen.com/app/settings/api)
HEYGEN_API_KEY=REPLACE_WITH_NEW_KEY_FROM_DASHBOARD
HEYGEN_AVATAR_ID=a7a7e63f00a74ff984d4b43f984c438c

# PayPal (Dashboard: https://developer.paypal.com/dashboard/)
PAYPAL_CLIENT_ID=AYs9dULgQ12igjVhbMCFnXtBVcrmrJ25PWV949ZOFMFyEQTAS1eE7Bdm7iybUqnA0GSGZRl5q9Ar-wT8
PAYPAL_CLIENT_SECRET=REPLACE_WITH_NEW_SECRET_FROM_DASHBOARD
PAYPAL_MODE=sandbox

# Meta/WhatsApp (Dashboard: https://developers.facebook.com/apps/)
META_ACCESS_TOKEN=REPLACE_WITH_NEW_TOKEN_FROM_DASHBOARD
META_PHONE_NUMBER_ID=15551715026
WHATSAPP_SANDRA_NUMBER=+34624829117

# Netlify (Dashboard: https://app.netlify.com/user/applications)
NETLIFY_AUTH_TOKEN=REPLACE_WITH_NEW_TOKEN_FROM_DASHBOARD
NETLIFY_SITE_ID=sensational-pegasus-d56cc3

# Admin Security
ADMIN_SECRET_KEY=${crypto.randomBytes(32).toString('hex')}

# Runtime Configuration
DEFAULT_MODE=production
DEFAULT_LOCALE=es-ES
`;

    await fs.writeFile(secureEnvPath, template);
    await this.logger.log('Secure environment template generated', 'info', {
      path: secureEnvPath
    });

    return secureEnvPath;
  }
}

/**
 * Security Report Generator
 */
class SecurityReportGenerator {
  constructor(logger) {
    this.logger = logger;
  }

  async generateReport(results) {
    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        projectId: 'sandra-ia-7.0',
        severity: 'CRITICAL',
        auditor: 'Claude Code Security Auditor'
      },
      summary: {
        totalKeys: rotationStatus.totalKeys,
        rotated: rotationStatus.rotated.length,
        failed: rotationStatus.failed.length,
        manualRequired: rotationStatus.manual.length,
        executionTime: Date.now() - rotationStatus.startTime
      },
      exposedKeys: [
        { provider: 'OpenAI', status: 'EXPOSED', severity: 'CRITICAL' },
        { provider: 'Anthropic', status: 'EXPOSED', severity: 'CRITICAL' },
        { provider: 'GROQ', status: 'EXPOSED', severity: 'HIGH' },
        { provider: 'Cartesia', status: 'EXPOSED', severity: 'HIGH' },
        { provider: 'Deepgram', status: 'EXPOSED', severity: 'HIGH' },
        { provider: 'HeyGen', status: 'EXPOSED', severity: 'MEDIUM' },
        { provider: 'PayPal', status: 'EXPOSED', severity: 'CRITICAL' },
        { provider: 'Meta/WhatsApp', status: 'EXPOSED', severity: 'HIGH' },
        { provider: 'Netlify', status: 'EXPOSED', severity: 'CRITICAL' }
      ],
      manualActions: rotationStatus.manual.map(provider => ({
        provider,
        action: 'MANUAL_ROTATION_REQUIRED',
        priority: 'IMMEDIATE'
      })),
      recommendations: [
        'Immediately rotate all exposed API keys via provider dashboards',
        'Update Netlify environment variables with new keys',
        'Implement secret scanning in CI/CD pipeline',
        'Use GitHub Secrets for sensitive data',
        'Enable 2FA on all API provider accounts',
        'Implement key rotation schedule (90 days)',
        'Use separate keys for development and production',
        'Implement API key encryption at rest'
      ],
      nextSteps: [
        '1. Access each provider dashboard using URLs in logs',
        '2. Generate new API keys following naming convention',
        '3. Update .env.secure file with new keys',
        '4. Deploy to Netlify with new environment variables',
        '5. Verify all services are functional',
        '6. Revoke/delete all compromised keys',
        '7. Enable audit logging on all providers'
      ]
    };

    const reportPath = path.join(ROTATION_CONFIG.logPath, 'security-audit-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    await this.logger.log('Security audit report generated', 'info', {
      path: reportPath
    });

    return report;
  }

  async generateMarkdownReport(report) {
    const markdown = `# SANDRA IA 7.0 - Security Audit Report

## CRITICAL SECURITY INCIDENT: API Key Exposure

**Date:** ${report.metadata.timestamp}
**Severity:** ${report.metadata.severity}
**Auditor:** ${report.metadata.auditor}

## Executive Summary

A critical security incident has been identified where multiple API keys were exposed in the git repository. Immediate action is required to rotate all compromised credentials.

### Impact Analysis

- **Total Keys Exposed:** ${report.summary.totalKeys}
- **Manual Rotation Required:** ${report.summary.manualRequired}
- **Execution Time:** ${report.summary.executionTime}ms

## Exposed Credentials

| Provider | Status | Severity | Action Required |
|----------|--------|----------|-----------------|
${report.exposedKeys.map(key => `| ${key.provider} | ${key.status} | ${key.severity} | Manual Rotation |`).join('\n')}

## Immediate Actions Required

### Step 1: Access Provider Dashboards

${report.manualActions.map((action, index) => `${index + 1}. **${action.provider}**: ${action.action} (Priority: ${action.priority})`).join('\n')}

### Step 2: Key Rotation Process

For each provider:
1. Login to the provider dashboard
2. Navigate to API Keys section
3. Generate new key with naming convention: \`sandra-ia-secure-YYYYMMDD\`
4. Document the new key securely
5. Revoke/delete the compromised key
6. Update Netlify environment variables

### Step 3: Update Production Environment

1. Use the generated \`.env.secure\` template
2. Replace placeholder values with new keys
3. Deploy to Netlify with updated environment
4. Verify all services are functional

## Security Recommendations

${report.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

## Verification Checklist

- [ ] All exposed keys have been rotated
- [ ] Old keys have been revoked/deleted
- [ ] New keys are stored securely in Netlify
- [ ] All services are functional with new keys
- [ ] Git history has been cleaned (BFG tool)
- [ ] Secret scanning is enabled in CI/CD
- [ ] 2FA is enabled on all provider accounts
- [ ] Audit logging is enabled

## Provider Dashboard URLs

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys
- **GROQ**: https://console.groq.com/keys
- **Cartesia**: https://play.cartesia.ai/settings
- **Deepgram**: https://console.deepgram.com/project/keys
- **HeyGen**: https://www.heygen.com/app/settings/api
- **PayPal**: https://developer.paypal.com/dashboard/
- **Meta/WhatsApp**: https://developers.facebook.com/apps/
- **Netlify**: https://app.netlify.com/user/applications

## Compliance Status

- OWASP Top 10: A02:2021 – Cryptographic Failures
- CWE-798: Use of Hard-coded Credentials
- NIST 800-57: Key Management Best Practices

---

**Generated:** ${new Date().toISOString()}
**Security Level:** CRITICAL - IMMEDIATE ACTION REQUIRED
`;

    const reportPath = path.join(ROTATION_CONFIG.logPath, 'SECURITY-AUDIT-REPORT.md');
    await fs.writeFile(reportPath, markdown);

    console.log('\n' + '='.repeat(60));
    console.log('SECURITY AUDIT REPORT GENERATED');
    console.log('='.repeat(60));
    console.log(`Report Location: ${reportPath}`);

    return reportPath;
  }
}

/**
 * Main Execution
 */
async function executeSecurityAudit() {
  console.log('\n' + '='.repeat(60));
  console.log('SANDRA IA 7.0 - EMERGENCY SECURITY AUDIT');
  console.log('API KEY ROTATION PROTOCOL INITIATED');
  console.log('='.repeat(60) + '\n');

  const logger = new SecurityLogger();
  await logger.init();

  const rotationManager = new KeyRotationManager(logger);
  const reportGenerator = new SecurityReportGenerator(logger);

  // Execute key rotations
  const rotationTasks = [
    rotationManager.rotateOpenAI(),
    rotationManager.rotateAnthropic(),
    rotationManager.rotateGroq(),
    rotationManager.rotateCartesia(),
    rotationManager.rotateDeepgram()
  ];

  await logger.log('Starting parallel key rotation process', 'info');
  const results = await Promise.all(rotationTasks);

  // Generate secure environment template
  await rotationManager.generateSecureEnv();

  // Generate security report
  const report = await reportGenerator.generateReport(results);
  const markdownPath = await reportGenerator.generateMarkdownReport(report);

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('SECURITY AUDIT COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nCRITICAL: ${rotationStatus.manual.length} keys require manual rotation`);
  console.log(`\nACTION REQUIRED:`);
  console.log(`1. Review report at: ${markdownPath}`);
  console.log(`2. Access each provider dashboard`);
  console.log(`3. Generate new API keys`);
  console.log(`4. Update .env.secure with new keys`);
  console.log(`5. Deploy to Netlify`);
  console.log('\n' + '='.repeat(60) + '\n');

  await logger.log('Security audit completed', 'info', {
    summary: report.summary
  });
}

// Execute if run directly
if (require.main === module) {
  executeSecurityAudit().catch(console.error);
}

module.exports = {
  SecurityLogger,
  KeyRotationManager,
  SecurityReportGenerator,
  executeSecurityAudit
};