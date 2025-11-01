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
    'netlify/functions/chat/**/*.js',
    'netlify/functions/tts/**/*.js',
    '!netlify/functions/**/node_modules/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 100,
      lines: 60,
      statements: 60
    }
  },
  verbose: true,
  testTimeout: 30000,
  maxWorkers: 1,
  globals: {
    'fetch': global.fetch
  }
};
