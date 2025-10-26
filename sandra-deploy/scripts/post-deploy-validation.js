// Sandra IA Galaxy PWA - Post-Deployment Validation Script
// Comprehensive validation suite for production deployments

const https = require('https');
const http = require('http');

/**
 * Sandra IA Galaxy Post-Deployment Validator
 * Validates production deployment health and functionality
 */
class SandraDeploymentValidator {
  constructor() {
    this.baseUrl = process.env.DEPLOY_URL || 'https://sandra.guestsvalencia.es';
    this.timeout = 30000; // 30 seconds
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  async validateDeployment() {
    console.log('🔍 Starting Sandra IA Galaxy Post-Deployment Validation...');
    console.log(`🌐 Target URL: ${this.baseUrl}`);

    const tests = [
      this.testMainPageLoad.bind(this),
      this.testPWAManifest.bind(this),
      this.testServiceWorker.bind(this),
      this.testCoreAssets.bind(this),
      this.testAPIEndpoints.bind(this),
      this.testMobileResponsiveness.bind(this),
      this.testAccessibility.bind(this),
      this.testPerformanceBasics.bind(this),
      this.testSecurityHeaders.bind(this),
      this.testVoiceSystemAssets.bind(this),
      this.testFeatureModules.bind(this),
      this.testOfflineCapability.bind(this)
    ];

    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        this.recordResult(test.name, 'FAILED', error.message);
      }
    }

    return this.generateReport();
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const requestModule = url.startsWith('https') ? https : http;
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout after ${this.timeout}ms`));
      }, this.timeout);

      const req = requestModule.get(url, {
        timeout: this.timeout,
        ...options
      }, (res) => {
        clearTimeout(timeout);
        let data = '';

        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            url: url
          });
        });
      });

      req.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  recordResult(testName, status, message, details = null) {
    const result = {
      test: testName,
      status,
      message,
      timestamp: new Date().toISOString(),
      details
    };

    this.results.tests.push(result);

    switch (status) {
      case 'PASSED':
        this.results.passed++;
        console.log(`✅ ${testName}: ${message}`);
        break;
      case 'FAILED':
        this.results.failed++;
        console.log(`❌ ${testName}: ${message}`);
        break;
      case 'WARNING':
        this.results.warnings++;
        console.log(`⚠️  ${testName}: ${message}`);
        break;
    }
  }

  async testMainPageLoad() {
    const response = await this.makeRequest(this.baseUrl);

    if (response.statusCode !== 200) {
      throw new Error(`Main page returned status ${response.statusCode}`);
    }

    if (!response.body.includes('Sandra IA Galaxy')) {
      throw new Error('Main page does not contain expected title');
    }

    if (!response.body.includes('252 agentes')) {
      throw new Error('Main page missing agent count reference');
    }

    this.recordResult('Main Page Load', 'PASSED', 'Main page loads successfully with expected content');
  }

  async testPWAManifest() {
    const manifestUrl = `${this.baseUrl}/manifest.json`;
    const response = await this.makeRequest(manifestUrl);

    if (response.statusCode !== 200) {
      throw new Error(`Manifest returned status ${response.statusCode}`);
    }

    let manifest;
    try {
      manifest = JSON.parse(response.body);
    } catch (error) {
      throw new Error('Manifest is not valid JSON');
    }

    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    const missingFields = requiredFields.filter(field => !manifest[field]);

    if (missingFields.length > 0) {
      throw new Error(`Manifest missing required fields: ${missingFields.join(', ')}`);
    }

    if (manifest.name !== 'Sandra IA Galaxy') {
      throw new Error(`Manifest name mismatch: expected "Sandra IA Galaxy", got "${manifest.name}"`);
    }

    if (manifest.start_url !== '/app.html') {
      throw new Error(`Manifest start_url should be "/app.html", got "${manifest.start_url}"`);
    }

    this.recordResult('PWA Manifest', 'PASSED', 'PWA manifest is valid and complete');
  }

  async testServiceWorker() {
    const swUrl = `${this.baseUrl}/sw.js`;
    const response = await this.makeRequest(swUrl);

    if (response.statusCode !== 200) {
      this.recordResult('Service Worker', 'WARNING', `Service worker returned status ${response.statusCode}`);
      return;
    }

    if (!response.body.includes('sandra-ia-galaxy')) {
      this.recordResult('Service Worker', 'WARNING', 'Service worker may not be Sandra IA specific');
      return;
    }

    this.recordResult('Service Worker', 'PASSED', 'Service worker is accessible');
  }

  async testCoreAssets() {
    const coreAssets = [
      '/app.html',
      '/index.html'
    ];

    let allPassed = true;
    const results = [];

    for (const asset of coreAssets) {
      try {
        const response = await this.makeRequest(`${this.baseUrl}${asset}`);
        if (response.statusCode === 200) {
          results.push(`${asset}: OK`);
        } else {
          results.push(`${asset}: ${response.statusCode}`);
          allPassed = false;
        }
      } catch (error) {
        results.push(`${asset}: ERROR`);
        allPassed = false;
      }
    }

    if (allPassed) {
      this.recordResult('Core Assets', 'PASSED', 'All core assets are accessible');
    } else {
      this.recordResult('Core Assets', 'FAILED', 'Some core assets failed to load', results);
    }
  }

  async testAPIEndpoints() {
    // Note: These endpoints might not be accessible from external validation
    // This test is for completeness but may show warnings
    const apiEndpoints = [
      { url: `${this.baseUrl.replace('sandra.guestsvalencia.es', 'sandra.guestsvalencia.es:3000')}/health`, name: 'MCP Bridge Health' },
      { url: `${this.baseUrl.replace('sandra.guestsvalencia.es', 'sandra.guestsvalencia.es:3001')}/health`, name: 'Backend Health' }
    ];

    let warnings = 0;
    for (const endpoint of apiEndpoints) {
      try {
        const response = await this.makeRequest(endpoint.url);
        if (response.statusCode === 200) {
          this.recordResult(`API ${endpoint.name}`, 'PASSED', 'API endpoint accessible');
        } else {
          this.recordResult(`API ${endpoint.name}`, 'WARNING', `API returned status ${response.statusCode}`);
          warnings++;
        }
      } catch (error) {
        this.recordResult(`API ${endpoint.name}`, 'WARNING', 'API endpoint not accessible (expected in production)');
        warnings++;
      }
    }

    if (warnings === apiEndpoints.length) {
      this.recordResult('API Endpoints', 'WARNING', 'API endpoints not accessible from external validation (normal for production)');
    }
  }

  async testMobileResponsiveness() {
    const response = await this.makeRequest(this.baseUrl);

    if (!response.body.includes('viewport-fit=cover')) {
      this.recordResult('Mobile Viewport', 'WARNING', 'Viewport meta tag may not be optimized for mobile');
    } else {
      this.recordResult('Mobile Viewport', 'PASSED', 'Mobile viewport is properly configured');
    }

    if (!response.body.includes('apple-mobile-web-app-capable')) {
      this.recordResult('iOS PWA Support', 'WARNING', 'iOS PWA meta tags may be missing');
    } else {
      this.recordResult('iOS PWA Support', 'PASSED', 'iOS PWA meta tags are present');
    }
  }

  async testAccessibility() {
    const response = await this.makeRequest(this.baseUrl);

    const accessibilityChecks = [
      { check: 'aria-live', present: response.body.includes('aria-live'), name: 'ARIA Live Regions' },
      { check: 'role=', present: response.body.includes('role='), name: 'ARIA Roles' },
      { check: 'alt=', present: response.body.includes('alt=') || !response.body.includes('<img'), name: 'Image Alt Text' }
    ];

    let passed = 0;
    accessibilityChecks.forEach(check => {
      if (check.present) {
        passed++;
      }
    });

    if (passed === accessibilityChecks.length) {
      this.recordResult('Accessibility', 'PASSED', 'Basic accessibility features are present');
    } else {
      this.recordResult('Accessibility', 'WARNING', `${passed}/${accessibilityChecks.length} accessibility checks passed`);
    }
  }

  async testPerformanceBasics() {
    const startTime = Date.now();
    const response = await this.makeRequest(this.baseUrl);
    const loadTime = Date.now() - startTime;

    if (loadTime > 5000) {
      this.recordResult('Load Time', 'WARNING', `Page load time ${loadTime}ms exceeds 5 seconds`);
    } else if (loadTime > 2000) {
      this.recordResult('Load Time', 'WARNING', `Page load time ${loadTime}ms exceeds 2 seconds`);
    } else {
      this.recordResult('Load Time', 'PASSED', `Page load time ${loadTime}ms is acceptable`);
    }

    // Check for compression
    const contentEncoding = response.headers['content-encoding'];
    if (contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('br'))) {
      this.recordResult('Compression', 'PASSED', `Content is compressed with ${contentEncoding}`);
    } else {
      this.recordResult('Compression', 'WARNING', 'Content compression not detected');
    }
  }

  async testSecurityHeaders() {
    const response = await this.makeRequest(this.baseUrl);
    const headers = response.headers;

    const securityHeaders = [
      { header: 'x-frame-options', required: false, name: 'X-Frame-Options' },
      { header: 'x-content-type-options', required: false, name: 'X-Content-Type-Options' },
      { header: 'strict-transport-security', required: true, name: 'HTTPS Strict Transport Security' }
    ];

    let passed = 0;
    let warnings = 0;

    securityHeaders.forEach(check => {
      if (headers[check.header]) {
        passed++;
        this.recordResult(`Security ${check.name}`, 'PASSED', `${check.name} header is present`);
      } else if (check.required) {
        this.recordResult(`Security ${check.name}`, 'WARNING', `Required security header ${check.name} is missing`);
        warnings++;
      } else {
        this.recordResult(`Security ${check.name}`, 'WARNING', `Optional security header ${check.name} is missing`);
        warnings++;
      }
    });
  }

  async testVoiceSystemAssets() {
    const response = await this.makeRequest(`${this.baseUrl}/app.html`);

    const voiceFeatures = [
      { check: 'SpeechRecognition', name: 'Speech Recognition API' },
      { check: 'speechSynthesis', name: 'Speech Synthesis API' },
      { check: 'AudioContext', name: 'Audio Context for barge-in' },
      { check: 'toggleVoice', name: 'Voice toggle function' }
    ];

    let passed = 0;
    voiceFeatures.forEach(feature => {
      if (response.body.includes(feature.check)) {
        passed++;
      }
    });

    if (passed === voiceFeatures.length) {
      this.recordResult('Voice System', 'PASSED', 'All voice system components are present');
    } else {
      this.recordResult('Voice System', 'WARNING', `${passed}/${voiceFeatures.length} voice features detected`);
    }
  }

  async testFeatureModules() {
    const response = await this.makeRequest(`${this.baseUrl}/app.html`);

    const modules = ['dev', 'marketing', 'design', 'finance', 'voice', 'vision'];
    let foundModules = 0;

    modules.forEach(module => {
      if (response.body.includes(`startFeature('${module}')`)) {
        foundModules++;
      }
    });

    if (foundModules === modules.length) {
      this.recordResult('Feature Modules', 'PASSED', `All ${modules.length} feature modules are present`);
    } else {
      this.recordResult('Feature Modules', 'WARNING', `${foundModules}/${modules.length} feature modules detected`);
    }
  }

  async testOfflineCapability() {
    // This is a basic check for offline-related code
    const response = await this.makeRequest(`${this.baseUrl}/app.html`);

    if (response.body.includes('localStorage') && response.body.includes('offline')) {
      this.recordResult('Offline Support', 'PASSED', 'Offline capability code is present');
    } else {
      this.recordResult('Offline Support', 'WARNING', 'Limited offline capability detected');
    }
  }

  generateReport() {
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const successRate = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;

    console.log('\n📊 Post-Deployment Validation Report');
    console.log('=====================================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📈 Success Rate: ${successRate}%`);

    const report = {
      timestamp: new Date().toISOString(),
      url: this.baseUrl,
      summary: {
        total,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        successRate
      },
      tests: this.results.tests
    };

    // Determine overall status
    if (this.results.failed === 0) {
      console.log('\n🎉 Deployment validation PASSED!');
      report.status = 'PASSED';
      return report;
    } else {
      console.log('\n💥 Deployment validation FAILED!');
      report.status = 'FAILED';
      return report;
    }
  }
}

// CLI execution
async function main() {
  const validator = new SandraDeploymentValidator();

  try {
    const report = await validator.validateDeployment();

    // Save report
    const fs = require('fs').promises;
    await fs.writeFile('post-deploy-validation-report.json', JSON.stringify(report, null, 2));

    if (report.status === 'PASSED') {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
module.exports = SandraDeploymentValidator;

// Run if called directly
if (require.main === module) {
  main();
}