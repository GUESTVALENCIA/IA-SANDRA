#!/usr/bin/env node

/**
 * SANDRA IA - TEST VALIDATION SCRIPT
 * Validates test suite setup and configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 SANDRA IA - TEST SUITE VALIDATION\n');

const checks = [
  {
    name: 'Jest Configuration',
    path: 'jest.config.js',
    required: true
  },
  {
    name: 'Playwright Configuration',
    path: 'playwright.config.js',
    required: true
  },
  {
    name: 'Chat Handler Unit Tests',
    path: 'tests/unit/chat-handler.test.js',
    required: true
  },
  {
    name: 'TTS Handler Unit Tests',
    path: 'tests/unit/tts-handler.test.js',
    required: true
  },
  {
    name: 'E2E Chat Flow Tests',
    path: 'tests/e2e/sandra-chat-flow.spec.js',
    required: true
  },
  {
    name: 'Performance Tests',
    path: 'tests/performance/load-time.spec.js',
    required: true
  },
  {
    name: 'Test Documentation',
    path: 'HOW-TO-RUN-TESTS.md',
    required: true
  },
  {
    name: 'Test Summary',
    path: 'TEST-SUITE-SUMMARY.md',
    required: true
  },
  {
    name: 'Jest Package',
    path: 'node_modules/jest',
    required: true
  },
  {
    name: 'Playwright Package',
    path: 'node_modules/@playwright/test',
    required: true
  }
];

let passed = 0;
let failed = 0;

console.log('Running validation checks...\n');

checks.forEach(check => {
  const fullPath = path.join(process.cwd(), check.path);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    console.log(`✅ ${check.name}`);
    passed++;
  } else {
    console.log(`❌ ${check.name} - NOT FOUND: ${check.path}`);
    if (check.required) {
      failed++;
    }
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`VALIDATION RESULTS: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(60)}\n`);

// Check package.json scripts
console.log('Checking package.json test scripts...\n');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const testScripts = {
  'test': 'npm run test:unit && npm run test:e2e',
  'test:unit': 'jest --testMatch=\'**/tests/unit/**/*.test.js\'',
  'test:e2e': 'playwright test tests/e2e/sandra-chat-flow.spec.js',
  'test:performance': 'playwright test tests/performance/',
  'test:coverage': 'jest --coverage'
};

let scriptsPassed = 0;
let scriptsFailed = 0;

Object.entries(testScripts).forEach(([script, expectedCommand]) => {
  const actualCommand = packageJson.scripts[script];

  if (actualCommand) {
    console.log(`✅ Script '${script}' exists`);
    scriptsPassed++;
  } else {
    console.log(`❌ Script '${script}' missing`);
    scriptsFailed++;
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`SCRIPTS CHECK: ${scriptsPassed} passed, ${scriptsFailed} failed`);
console.log(`${'='.repeat(60)}\n`);

// Final summary
const totalPassed = passed + scriptsPassed;
const totalFailed = failed + scriptsFailed;
const totalChecks = checks.length + Object.keys(testScripts).length;

console.log('📊 FINAL SUMMARY\n');
console.log(`Total Checks: ${totalChecks}`);
console.log(`Passed: ${totalPassed} (${((totalPassed / totalChecks) * 100).toFixed(1)}%)`);
console.log(`Failed: ${totalFailed} (${((totalFailed / totalChecks) * 100).toFixed(1)}%)`);

if (totalFailed === 0) {
  console.log('\n✅ TEST SUITE VALIDATION COMPLETE - ALL CHECKS PASSED\n');
  console.log('🚀 Ready to run tests:');
  console.log('   npm run test:unit       - Run unit tests');
  console.log('   npm run test:e2e        - Run E2E tests');
  console.log('   npm run test:performance - Run performance tests');
  console.log('   npm test                - Run all tests\n');
  process.exit(0);
} else {
  console.log('\n⚠️  VALIDATION FAILED - SOME CHECKS DID NOT PASS\n');
  console.log('Please ensure all required files and dependencies are installed.');
  console.log('Run: npm install\n');
  process.exit(1);
}
