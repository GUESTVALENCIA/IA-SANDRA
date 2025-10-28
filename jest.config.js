module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/sandra-deploy/',
    '/backend/',
    '/SANDRA_NUCLEUS_UNIFIED/'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/SANDRA_NUCLEUS_UNIFIED/'
  ],
  collectCoverageFrom: [
    'netlify/functions/**/*.js',
    '!netlify/functions/**/node_modules/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  verbose: true,
  testTimeout: 30000,
  maxWorkers: 1,
  globals: {
    'fetch': global.fetch
  }
};
