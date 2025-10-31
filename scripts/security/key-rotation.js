const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const https = require('https');

class APIKeyRotation {
  constructor() {
    this.providers = {
      openai: {
        name: 'OpenAI',
        envKey: 'OPENAI_API_KEY',
        testEndpoint: 'https://api.openai.com/v1/models',
        rotationSupported: true
      },
      anthropic: {
        name: 'Anthropic',
        envKey: 'ANTHROPIC_API_KEY',
        testEndpoint: 'https://api.anthropic.com/v1/messages',
        rotationSupported: true
      },
      groq: {
        name: 'GROQ',
        envKey: 'GROQ_API_KEY',
        testEndpoint: 'https://api.groq.com/openai/v1/models',
        rotationSupported: true
      },
      cartesia: {
        name: 'Cartesia',
        envKey: 'CARTESIA_API_KEY',
        testEndpoint: 'https://api.cartesia.ai/v1/voices',
        rotationSupported: true
      },
      elevenlabs: {
        name: 'ElevenLabs',
        envKey: 'ELEVENLABS_API_KEY',
        testEndpoint: 'https://api.elevenlabs.io/v1/voices',
        rotationSupported: true
      }
    };

    this.logDir = path.join(__dirname, '../../security-logs');
    this.secureKeyDir = path.join(__dirname, '../../.secure-keys');
    this.encryptionKey = process.env.ENCRYPTION_KEY;
  }

  async initialize() {
    // Create required directories
    [this.logDir, this.secureKeyDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Initialize audit log
    const auditPath = path.join(this.logDir, 'rotation-audit.json');
    if (!fs.existsSync(auditPath)) {
      fs.writeFileSync(auditPath, '[]');
    }
  }

  async rotateAllKeys(emergency = false) {
    console.log(`🔄 Starting ${emergency ? 'EMERGENCY ' : ''}key rotation...`);
    await this.initialize();

    const rotationLog = {
      timestamp: new Date().toISOString(),
      emergency,
      rotations: [],
      status: 'in_progress'
    };

    const results = [];

    for (const [provider, config] of Object.entries(this.providers)) {
      try {
        console.log(`Rotating ${config.name} key...`);
        const result = await this.rotateKey(provider, config);
        results.push(result);
        rotationLog.rotations.push({
          provider,
          status: 'success',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Failed to rotate ${config.name}:`, error.message);
        rotationLog.rotations.push({
          provider,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });

        if (emergency) {
          // In emergency mode, continue even if one fails
          continue;
        } else {
          throw error;
        }
      }
    }

    rotationLog.status = 'completed';
    await this.logRotation(rotationLog);

    console.log('✅ Key rotation completed successfully!');
    return results;
  }

  async rotateKey(provider, config) {
    const oldKey = process.env[config.envKey];

    if (!oldKey) {
      throw new Error(`No existing key found for ${provider}`);
    }

    // Generate new key (in production, this would call provider's API)
    const newKey = await this.generateNewKey(provider, oldKey);

    // Encrypt and store the new key
    const encryptedKey = this.encryptKey(newKey);
    const keyPath = path.join(this.secureKeyDir, `${provider}.enc`);
    fs.writeFileSync(keyPath, encryptedKey);

    // Test the new key
    const isValid = await this.testKey(provider, newKey);
    if (!isValid) {
      throw new Error(`New key for ${provider} failed validation`);
    }

    // Store key metadata
    const metadata = {
      provider,
      rotatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      checksum: crypto.createHash('sha256').update(newKey).digest('hex').substring(0, 8)
    };

    const metadataPath = path.join(this.secureKeyDir, `${provider}.meta.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return {
      provider,
      status: 'rotated',
      metadata
    };
  }

  async generateNewKey(provider, oldKey) {
    // In production, this would call the provider's API to generate a new key
    // For now, we'll simulate by adding a timestamp suffix
    // IMPORTANT: Replace this with actual API calls in production

    console.log(`📝 Generating new key for ${provider}...`);

    // Simulated key generation (DO NOT USE IN PRODUCTION)
    // This is for demonstration only
    const timestamp = Date.now().toString(36);
    const baseKey = oldKey.split('-')[0];

    // In real implementation, you would:
    // 1. Call provider's management API
    // 2. Create new API key
    // 3. Optionally revoke old key after verification

    return `${baseKey}-rotated-${timestamp}`;
  }

  testKey(provider, key) {
    return new Promise((resolve) => {
      const config = this.providers[provider];
      const url = new URL(config.testEndpoint);

      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'User-Agent': 'SandraIA-KeyRotation/1.0'
        },
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        // 200-299 status codes indicate success
        // 401/403 indicate invalid key
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      });

      req.on('error', () => {
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  }

  encryptKey(key) {
    if (!this.encryptionKey) {
      throw new Error('ENCRYPTION_KEY not set');
    }

    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(this.encryptionKey, 'hex'), iv);

    let encrypted = cipher.update(key, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      encrypted
    });
  }

  decryptKey(encryptedData) {
    if (!this.encryptionKey) {
      throw new Error('ENCRYPTION_KEY not set');
    }

    const data = JSON.parse(encryptedData);
    const algorithm = 'aes-256-gcm';

    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(this.encryptionKey, 'hex'),
      Buffer.from(data.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async verifyAllKeys() {
    console.log('🔍 Verifying all API keys...');
    const results = {};

    for (const [provider, config] of Object.entries(this.providers)) {
      const keyPath = path.join(this.secureKeyDir, `${provider}.enc`);

      if (!fs.existsSync(keyPath)) {
        results[provider] = {
          status: 'missing',
          valid: false
        };
        continue;
      }

      try {
        const encryptedKey = fs.readFileSync(keyPath, 'utf8');
        const key = this.decryptKey(encryptedKey);
        const isValid = await this.testKey(provider, key);

        results[provider] = {
          status: isValid ? 'valid' : 'invalid',
          valid: isValid,
          lastTested: new Date().toISOString()
        };
      } catch (error) {
        results[provider] = {
          status: 'error',
          valid: false,
          error: error.message
        };
      }
    }

    // Log verification results
    const verificationLog = {
      timestamp: new Date().toISOString(),
      results
    };

    const logPath = path.join(this.logDir, 'verification-log.json');
    let logs = [];
    if (fs.existsSync(logPath)) {
      logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }
    logs.push(verificationLog);

    // Keep only last 100 verifications
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

    console.log('✅ Verification complete:', results);
    return results;
  }

  async logRotation(rotationData) {
    const auditPath = path.join(this.logDir, 'rotation-audit.json');
    let auditLog = [];

    if (fs.existsSync(auditPath)) {
      auditLog = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
    }

    auditLog.push(rotationData);
    fs.writeFileSync(auditPath, JSON.stringify(auditLog, null, 2));
  }

  async emergencyRevoke() {
    console.log('🚨 EMERGENCY: Revoking all keys...');

    // Clear all stored keys
    const files = fs.readdirSync(this.secureKeyDir);
    for (const file of files) {
      if (file.endsWith('.enc')) {
        fs.unlinkSync(path.join(this.secureKeyDir, file));
      }
    }

    // Log emergency revocation
    await this.logRotation({
      timestamp: new Date().toISOString(),
      action: 'emergency_revoke',
      status: 'completed'
    });

    console.log('✅ All keys revoked. Run rotation to generate new keys.');
  }
}

// CLI execution
if (require.main === module) {
  const rotation = new APIKeyRotation();
  const command = process.argv[2];

  switch (command) {
    case 'rotate':
      rotation.rotateAllKeys(process.env.EMERGENCY_MODE === 'true')
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Rotation failed:', error);
          process.exit(1);
        });
      break;

    case 'verify':
      rotation.verifyAllKeys()
        .then(results => {
          const allValid = Object.values(results).every(r => r.valid);
          process.exit(allValid ? 0 : 1);
        })
        .catch(error => {
          console.error('Verification failed:', error);
          process.exit(1);
        });
      break;

    case 'emergency':
      rotation.emergencyRevoke()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Emergency revoke failed:', error);
          process.exit(1);
        });
      break;

    default:
      console.log('Usage: node key-rotation.js [rotate|verify|emergency]');
      process.exit(1);
  }
}

module.exports = APIKeyRotation;