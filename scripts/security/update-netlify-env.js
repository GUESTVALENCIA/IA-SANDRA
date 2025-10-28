const https = require('https');
const fs = require('fs');
const path = require('path');

class NetlifyEnvUpdater {
  constructor() {
    this.siteId = process.env.NETLIFY_SITE_ID;
    this.authToken = process.env.NETLIFY_AUTH_TOKEN;
    this.secureKeyDir = path.join(__dirname, '../../.secure-keys');
    this.encryptionKey = process.env.ENCRYPTION_KEY;
  }

  async updateEnvironment() {
    if (!this.siteId || !this.authToken) {
      throw new Error('NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN must be set');
    }

    console.log('🔄 Updating Netlify environment variables...');

    // Get the rotated keys
    const keys = await this.getRotatedKeys();

    // Prepare environment variables
    const envVars = {
      OPENAI_API_KEY: keys.openai,
      ANTHROPIC_API_KEY: keys.anthropic,
      GROQ_API_KEY: keys.groq,
      CARTESIA_API_KEY: keys.cartesia,
      ELEVENLABS_API_KEY: keys.elevenlabs,
      // Add timestamp for tracking
      LAST_KEY_ROTATION: new Date().toISOString()
    };

    // Update Netlify environment
    const success = await this.updateNetlifyEnv(envVars);

    if (success) {
      console.log('✅ Netlify environment updated successfully!');
      await this.triggerRedeploy();
    } else {
      throw new Error('Failed to update Netlify environment');
    }

    return success;
  }

  async getRotatedKeys() {
    const keys = {};
    const providers = ['openai', 'anthropic', 'groq', 'cartesia', 'elevenlabs'];

    for (const provider of providers) {
      const keyPath = path.join(this.secureKeyDir, `${provider}.enc`);

      if (fs.existsSync(keyPath)) {
        const encryptedKey = fs.readFileSync(keyPath, 'utf8');
        keys[provider] = this.decryptKey(encryptedKey);
      } else {
        // Use existing env var as fallback
        const envKey = `${provider.toUpperCase()}_API_KEY`;
        keys[provider] = process.env[envKey];
      }
    }

    return keys;
  }

  decryptKey(encryptedData) {
    if (!this.encryptionKey) {
      throw new Error('ENCRYPTION_KEY not set');
    }

    const crypto = require('crypto');
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

  updateNetlifyEnv(envVars) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(envVars);

      const options = {
        hostname: 'api.netlify.com',
        path: `/api/v1/sites/${this.siteId}/env`,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(true);
          } else {
            console.error(`Netlify API error: ${res.statusCode} - ${responseData}`);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Request error:', error);
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  async triggerRedeploy() {
    console.log('🚀 Triggering Netlify redeploy...');

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.netlify.com',
        path: `/api/v1/sites/${this.siteId}/deploys`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Redeploy triggered successfully!');
            resolve(true);
          } else {
            console.error(`Failed to trigger redeploy: ${res.statusCode}`);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Request error:', error);
        reject(error);
      });

      req.end();
    });
  }

  async getCurrentEnv() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.netlify.com',
        path: `/api/v1/sites/${this.siteId}/env`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const env = JSON.parse(responseData);
              resolve(env);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error(`Failed to get environment: ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }
}

// CLI execution
if (require.main === module) {
  const updater = new NetlifyEnvUpdater();

  updater.updateEnvironment()
    .then(() => {
      console.log('✅ Environment update complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Update failed:', error);
      process.exit(1);
    });
}

module.exports = NetlifyEnvUpdater;