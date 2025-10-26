/** @type {import('jest').Config} */
module.exports = {
  displayName: 'Sandra IA Galaxy - Unit Tests',
  testEnvironment: 'jsdom',
  rootDir: '../../',
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/unit/**/*.spec.js'
  ],
  collectCoverageFrom: [
    '<rootDir>/**/*.js',
    '!<rootDir>/node_modules/**',
    '!<rootDir>/tests/**',
    '!<rootDir>/playwright.config.js',
    '!<rootDir>/scripts/**'
  ],
  coverageDirectory: '<rootDir>/coverage/unit',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
  testTimeout: 10000,
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  globals: {
    'jest': {
      'useESModules': true
    }
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80
    }
  }
};