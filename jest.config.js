module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'orchestrator/**/*.js',
    'mcp-servers/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 45,
      lines: 45,
      statements: 45
    }
  },
  verbose: true
};

