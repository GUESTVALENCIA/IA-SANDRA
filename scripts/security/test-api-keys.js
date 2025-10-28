const https = require('https');

class APIKeyTester {
  constructor() {
    this.services = [
      {
        name: 'OpenAI',
        envKey: 'OPENAI_API_KEY',
        testEndpoint: 'api.openai.com',
        testPath: '/v1/models',
        headers: (key) => ({
          'Authorization': `Bearer ${key}`,
          'User-Agent': 'SandraIA-Tester/1.0'
        })
      },
      {
        name: 'Anthropic',
        envKey: 'ANTHROPIC_API_KEY',
        testEndpoint: 'api.anthropic.com',
        testPath: '/v1/messages',
        headers: (key) => ({
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'User-Agent': 'SandraIA-Tester/1.0'
        })
      },
      {
        name: 'GROQ',
        envKey: 'GROQ_API_KEY',
        testEndpoint: 'api.groq.com',
        testPath: '/openai/v1/models',
        headers: (key) => ({
          'Authorization': `Bearer ${key}`,
          'User-Agent': 'SandraIA-Tester/1.0'
        })
      },
      {
        name: 'Cartesia',
        envKey: 'CARTESIA_API_KEY',
        testEndpoint: 'api.cartesia.ai',
        testPath: '/v1/voices',
        headers: (key) => ({
          'X-API-Key': key,
          'User-Agent': 'SandraIA-Tester/1.0'
        })
      },
      {
        name: 'ElevenLabs',
        envKey: 'ELEVENLABS_API_KEY',
        testEndpoint: 'api.elevenlabs.io',
        testPath: '/v1/voices',
        headers: (key) => ({
          'xi-api-key': key,
          'User-Agent': 'SandraIA-Tester/1.0'
        })
      }
    ];

    this.results = {};
  }

  async testAll() {
    console.log('🔍 Testing all API keys...\n');

    for (const service of this.services) {
      const key = process.env[service.envKey];

      if (!key) {
        this.results[service.name] = {
          status: 'missing',
          message: `${service.envKey} not found in environment`
        };
        console.log(`❌ ${service.name}: API key missing`);
        continue;
      }

      try {
        const isValid = await this.testService(service, key);
        this.results[service.name] = {
          status: isValid ? 'valid' : 'invalid',
          message: isValid ? 'API key is valid' : 'API key is invalid or expired'
        };

        if (isValid) {
          console.log(`✅ ${service.name}: API key is valid`);
        } else {
          console.log(`❌ ${service.name}: API key is invalid or expired`);
        }
      } catch (error) {
        this.results[service.name] = {
          status: 'error',
          message: error.message
        };
        console.log(`⚠️  ${service.name}: Test failed - ${error.message}`);
      }
    }

    return this.results;
  }

  testService(service, key) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: service.testEndpoint,
        path: service.testPath,
        method: 'GET',
        headers: service.headers(key),
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          // Most services return 200-299 for valid keys
          // 401/403 typically means invalid key
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(true);
          } else if (res.statusCode === 401 || res.statusCode === 403) {
            resolve(false);
          } else {
            // Some other error - might be service issue
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: Object.keys(this.results).length,
        valid: Object.values(this.results).filter(r => r.status === 'valid').length,
        invalid: Object.values(this.results).filter(r => r.status === 'invalid').length,
        missing: Object.values(this.results).filter(r => r.status === 'missing').length,
        errors: Object.values(this.results).filter(r => r.status === 'error').length
      },
      results: this.results
    };

    console.log('\n📊 Summary:');
    console.log(`Total services: ${report.summary.total}`);
    console.log(`Valid keys: ${report.summary.valid}`);
    console.log(`Invalid keys: ${report.summary.invalid}`);
    console.log(`Missing keys: ${report.summary.missing}`);
    console.log(`Test errors: ${report.summary.errors}`);

    return report;
  }
}

// CLI execution
if (require.main === module) {
  const tester = new APIKeyTester();

  tester.testAll()
    .then(() => {
      const report = tester.generateReport();

      // Exit with error if any keys are invalid or missing
      if (report.summary.invalid > 0 || report.summary.missing > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = APIKeyTester;