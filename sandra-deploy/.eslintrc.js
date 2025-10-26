module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    // Sandra IA specific globals
    SandraChatAI: 'readonly',
    SandraConnectionManager: 'readonly',
    SandraVoiceSystem: 'readonly',
    SandraPerformanceMonitor: 'readonly',
    sandraConnection: 'writable',
    sandraVoice: 'writable',
    sandraPerformance: 'writable',

    // Web APIs
    webkitSpeechRecognition: 'readonly',
    SpeechRecognition: 'readonly',
    speechSynthesis: 'readonly',
    SpeechSynthesisUtterance: 'readonly',
    AudioContext: 'readonly',
    webkitAudioContext: 'readonly',

    // PWA globals
    navigator: 'readonly',
    performance: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',

    // Testing globals
    jest: 'readonly',
    describe: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly'
  },
  rules: {
    // Error prevention
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',

    // Code quality
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-undef': 'error',
    'no-redeclare': 'error',
    'no-shadow': 'warn',

    // Best practices
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'dot-notation': 'error',
    'no-multi-spaces': 'error',
    'no-trailing-spaces': 'error',
    'no-multiple-empty-lines': ['error', { max: 2 }],

    // Async/await
    'require-await': 'error',
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'warn',

    // Security
    'no-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // Performance
    'no-loop-func': 'error',
    'no-inner-declarations': 'error',

    // Accessibility
    'no-global-assign': 'error',
    'no-implicit-globals': 'error',

    // Sandra IA specific rules
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',
    'object-shorthand': 'warn',
    'template-literal-style': 'off' // Allow both template literals and concatenation
  },
  overrides: [
    {
      files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off' // Allow console in tests
      }
    },
    {
      files: ['scripts/**/*.js'],
      env: {
        node: true
      },
      rules: {
        'no-console': 'off' // Allow console in scripts
      }
    },
    {
      files: ['app.html', 'index.html'],
      env: {
        browser: true
      },
      parserOptions: {
        sourceType: 'script' // HTML embedded scripts
      },
      rules: {
        'no-unused-vars': 'off', // HTML scripts may have globals
        'no-undef': 'off' // HTML scripts may reference external scripts
      }
    }
  ]
};