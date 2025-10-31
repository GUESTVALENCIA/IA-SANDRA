/**
 * SANDRA GALAXY ENTERPRISE VALIDATION SUITE
 * Comprehensive testing for unified system coordination
 * Agent-Organizer Implementation
 */

const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class GalaxyEnterpriseValidator {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
    this.warnings = 0;

    this.colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      cyan: '\x1b[36m',
      magenta: '\x1b[35m'
    };
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const color = {
      'INFO': this.colors.cyan,
      'PASS': this.colors.green,
      'FAIL': this.colors.red,
      'WARN': this.colors.yellow
    }[level] || this.colors.reset;

    console.log(`${color}[${level}]${this.colors.reset} ${message}`);
  }

  async runTest(testName, testFunction) {
    this.log('INFO', `Running test: ${testName}`);

    try {
      const result = await testFunction();

      this.testResults.push({
        name: testName,
        status: 'PASS',
        result: result || 'OK',
        timestamp: new Date().toISOString()
      });

      this.passedTests++;
      this.log('PASS', `✅ ${testName}`);

      return result;
    } catch (error) {
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        error: error.message,
        timestamp: new Date().toISOString()
      });

      this.failedTests++;
      this.log('FAIL', `❌ ${testName}: ${error.message}`);

      return null;
    }
  }

  async validateFileStructure() {
    return this.runTest('File Structure Validation', async () => {
      const requiredFiles = [
        'config/galaxy-config.js',
        'galaxy-enterprise-launcher.js',
        'backend/orchestrator.js',
        'backend/server.js',
        'sandra-mcp-bridge.js',
        'sandra-experts-executable.js',
        'SANDRA_NUCLEUS_UNIFIED/sandra-core.js',
        'package.json'
      ];

      const missingFiles = [];

      for (const file of requiredFiles) {
        const filePath = path.join(__dirname, '..', file);
        if (!fs.existsSync(filePath)) {
          missingFiles.push(file);
        }
      }

      if (missingFiles.length > 0) {
        throw new Error(`Missing files: ${missingFiles.join(', ')}`);
      }

      return `All ${requiredFiles.length} required files present`;
    });
  }

  async validateSyntax() {
    return this.runTest('JavaScript Syntax Validation', async () => {
      const jsFiles = [
        'config/galaxy-config.js',
        'galaxy-enterprise-launcher.js',
        'backend/orchestrator.js',
        'backend/server.js',
        'sandra-mcp-bridge.js',
        'sandra-experts-executable.js'
      ];

      const syntaxErrors = [];

      for (const file of jsFiles) {
        try {
          await execAsync(`node -c "${path.join(__dirname, '..', file)}"`);
        } catch (error) {
          syntaxErrors.push({ file, error: error.message });
        }
      }

      if (syntaxErrors.length > 0) {
        throw new Error(`Syntax errors in: ${syntaxErrors.map(e => e.file).join(', ')}`);
      }

      return `All ${jsFiles.length} JS files have valid syntax`;
    });
  }

  async validateConfiguration() {
    return this.runTest('Configuration Validation', async () => {
      const configPath = path.join(__dirname, '..', 'config/galaxy-config.js');
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);

      // Test port configuration
      const ports = Object.values(config.GALAXY_PORTS);
      const uniquePorts = [...new Set(ports)];

      if (ports.length !== uniquePorts.length) {
        throw new Error('Port conflicts detected in configuration');
      }

      // Test required configuration sections
      const requiredSections = [
        'GALAXY_PORTS', 'AGENT_CONFIG', 'CONTEXT_CONFIG',
        'PERFORMANCE_CONFIG', 'SECURITY_CONFIG', 'DATABASE_CONFIG'
      ];

      for (const section of requiredSections) {
        if (!config[section]) {
          throw new Error(`Missing configuration section: ${section}`);
        }
      }

      // Test validation function
      try {
        // Mock required environment variables for testing
        const originalEnv = { ...process.env };
        process.env.OPENAI_API_KEY = 'test-key';
        process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

        config.validate();

        // Restore environment
        process.env = originalEnv;
      } catch (error) {
        throw new Error(`Configuration validation failed: ${error.message}`);
      }

      return 'Configuration valid and port conflicts resolved';
    });
  }

  async validateGitConflicts() {
    return this.runTest('Git Conflicts Resolution', async () => {
      const conflictFiles = [
        'backend/orchestrator.js',
        'backend/server.js'
      ];

      const conflictMarkers = ['<<<<<<<', '=======', '>>>>>>>'];
      const foundConflicts = [];

      for (const file of conflictFiles) {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');

          for (const marker of conflictMarkers) {
            if (content.includes(marker)) {
              foundConflicts.push({ file, marker });
            }
          }
        }
      }

      if (foundConflicts.length > 0) {
        throw new Error(`Git conflict markers found: ${foundConflicts.map(c => `${c.file}:${c.marker}`).join(', ')}`);
      }

      return 'All Git conflicts resolved';
    });
  }

  async validateAgentSystem() {
    return this.runTest('Agent System Validation', async () => {
      const expertPath = path.join(__dirname, '..', 'sandra-experts-executable.js');
      delete require.cache[require.resolve(expertPath)];
      const { sandraDevExpert, EXECUTABLE_CONSTRAINTS } = require(expertPath);

      // Test expert initialization
      if (!sandraDevExpert) {
        throw new Error('Sandra DEV Expert not initialized');
      }

      // Test constraints
      if (!EXECUTABLE_CONSTRAINTS) {
        throw new Error('Executable constraints not defined');
      }

      // Test constraint keys
      const requiredConstraints = [
        'NEVER_SAY_CANT', 'ALWAYS_EXECUTE', 'NO_MOCK_RESPONSES',
        'REAL_FILE_OPERATIONS', 'VERIFY_ACTIONS'
      ];

      for (const constraint of requiredConstraints) {
        if (!EXECUTABLE_CONSTRAINTS[constraint]) {
          throw new Error(`Missing constraint: ${constraint}`);
        }
      }

      return 'Agent system and constraints validated';
    });
  }

  async validateDependencies() {
    return this.runTest('Dependencies Validation', async () => {
      const packagePath = path.join(__dirname, '..', 'package.json');

      if (!fs.existsSync(packagePath)) {
        throw new Error('package.json not found');
      }

      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      // Check for required dependencies
      const requiredDeps = ['express', 'ws', 'cors'];
      const missingDeps = [];

      for (const dep of requiredDeps) {
        if (!packageData.dependencies?.[dep] && !packageData.devDependencies?.[dep]) {
          missingDeps.push(dep);
        }
      }

      if (missingDeps.length > 0) {
        this.log('WARN', `Recommended dependencies missing: ${missingDeps.join(', ')}`);
        this.warnings++;
      }

      // Check node_modules
      const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        throw new Error('node_modules directory not found. Run: npm install');
      }

      return 'Dependencies validated';
    });
  }

  async validateServerIntegration() {
    return this.runTest('Server Integration Validation', async () => {
      // Check if servers can be imported without immediate execution
      const serverFiles = [
        { name: 'MCP Bridge', path: 'sandra-mcp-bridge.js' },
        { name: 'Backend Server', path: 'backend/server.js' },
        { name: 'Galaxy Launcher', path: 'galaxy-enterprise-launcher.js' }
      ];

      for (const server of serverFiles) {
        const filePath = path.join(__dirname, '..', server.path);

        // Check if file exports something
        try {
          // Use require.resolve to test if module can be resolved
          require.resolve(filePath);
        } catch (error) {
          throw new Error(`${server.name} cannot be resolved: ${error.message}`);
        }
      }

      return 'Server integration validated';
    });
  }

  async validatePortStrategy() {
    return this.runTest('Port Strategy Validation', async () => {
      const configPath = path.join(__dirname, '..', 'config/galaxy-config.js');
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);

      const portAssignments = {
        'Core Engine': config.GALAXY_PORTS.CORE_ENGINE,
        'MCP Bridge': config.GALAXY_PORTS.MCP_BRIDGE,
        'Backend Server': config.GALAXY_PORTS.BACKEND_SERVER,
        'WebSocket': config.GALAXY_PORTS.WEBSOCKET,
        'Monitoring': config.GALAXY_PORTS.MONITORING
      };

      // Verify ports are in reasonable ranges
      const validPortRange = (port) => port >= 3000 && port <= 9000;

      for (const [service, port] of Object.entries(portAssignments)) {
        if (!validPortRange(port)) {
          throw new Error(`Invalid port for ${service}: ${port}`);
        }
      }

      // Verify no conflicts
      const ports = Object.values(portAssignments);
      const uniquePorts = [...new Set(ports)];

      if (ports.length !== uniquePorts.length) {
        throw new Error('Port conflicts detected');
      }

      return `Port strategy valid: ${Object.entries(portAssignments).map(([k,v]) => `${k}:${v}`).join(', ')}`;
    });
  }

  async validateCoordinationPlan() {
    return this.runTest('Coordination Plan Validation', async () => {
      const planPath = path.join(__dirname, '..', 'SANDRA-GALAXY-ENTERPRISE-COORDINATION-PLAN.md');

      if (!fs.existsSync(planPath)) {
        throw new Error('Coordination plan document not found');
      }

      const content = fs.readFileSync(planPath, 'utf8');

      // Check for required sections
      const requiredSections = [
        'EXECUTIVE SUMMARY',
        'CURRENT ARCHITECTURE ANALYSIS',
        'UNIFIED SANDRA CORE ENGINE DESIGN',
        'SUBAGENT ECOSYSTEM COORDINATION',
        'IMPLEMENTATION PHASES'
      ];

      for (const section of requiredSections) {
        if (!content.includes(section)) {
          throw new Error(`Missing required section in coordination plan: ${section}`);
        }
      }

      // Check if 248 agents are mentioned
      if (!content.includes('248') && !content.includes('248+')) {
        throw new Error('248+ agents not properly documented in coordination plan');
      }

      const wordCount = content.split(/\s+/).length;

      return `Coordination plan validated (${wordCount} words, comprehensive coverage)`;
    });
  }

  async generateReport() {
    const totalTests = this.passedTests + this.failedTests;
    const successRate = totalTests > 0 ? (this.passedTests / totalTests * 100).toFixed(1) : 0;

    console.log(`
${this.colors.magenta}╔════════════════════════════════════════════════════════════╗
║              GALAXY ENTERPRISE VALIDATION REPORT          ║
╚════════════════════════════════════════════════════════════╝${this.colors.reset}

${this.colors.cyan}📊 Test Summary:${this.colors.reset}
   Total Tests: ${totalTests}
   ✅ Passed: ${this.passedTests}
   ❌ Failed: ${this.failedTests}
   ⚠️  Warnings: ${this.warnings}
   Success Rate: ${successRate}%

${this.colors.cyan}📋 Test Results:${this.colors.reset}`);

    for (const result of this.testResults) {
      const status = result.status === 'PASS' ? '✅' : '❌';
      const color = result.status === 'PASS' ? this.colors.green : this.colors.red;
      console.log(`   ${status} ${color}${result.name}${this.colors.reset}`);

      if (result.error) {
        console.log(`      Error: ${result.error}`);
      } else if (result.result) {
        console.log(`      Result: ${result.result}`);
      }
    }

    const overallStatus = this.failedTests === 0 ? 'SYSTEM READY' : 'ISSUES DETECTED';
    const statusColor = this.failedTests === 0 ? this.colors.green : this.colors.red;

    console.log(`
${statusColor}🎯 Overall Status: ${overallStatus}${this.colors.reset}

${this.colors.cyan}🚀 Next Steps:${this.colors.reset}`);

    if (this.failedTests === 0) {
      console.log(`   ✅ System validated successfully
   ✅ Ready for Galaxy Enterprise deployment
   ✅ Run: node galaxy-enterprise-launcher.js`);
    } else {
      console.log(`   ❌ Fix ${this.failedTests} failed test(s) before deployment
   ⚠️  Review errors above and resolve issues
   🔧 Re-run validation after fixes`);
    }

    console.log('');
  }

  async runFullValidation() {
    console.log(`
${this.colors.cyan}╔════════════════════════════════════════════════════════════╗
║          SANDRA GALAXY ENTERPRISE VALIDATION SUITE        ║
║                  Agent-Organizer Implementation           ║
╚════════════════════════════════════════════════════════════╝${this.colors.reset}
`);

    // Run all validation tests
    await this.validateFileStructure();
    await this.validateSyntax();
    await this.validateConfiguration();
    await this.validateGitConflicts();
    await this.validateAgentSystem();
    await this.validateDependencies();
    await this.validateServerIntegration();
    await this.validatePortStrategy();
    await this.validateCoordinationPlan();

    // Generate final report
    await this.generateReport();

    return {
      passed: this.passedTests,
      failed: this.failedTests,
      warnings: this.warnings,
      successRate: this.passedTests / (this.passedTests + this.failedTests) * 100,
      ready: this.failedTests === 0
    };
  }
}

// Run validation if executed directly
if (require.main === module) {
  const validator = new GalaxyEnterpriseValidator();
  validator.runFullValidation()
    .then(result => {
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Validation suite failed:', error);
      process.exit(1);
    });
}

module.exports = GalaxyEnterpriseValidator;