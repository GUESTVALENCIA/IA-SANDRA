# SANDRA IA 7.0 - TESTING GUIDE

## Overview

Sandra IA 7.0 has a comprehensive test suite covering unit tests, E2E tests, and performance tests.

## Test Structure

```
tests/
├── unit/                    # Unit tests (Jest)
│   ├── chat-handler.test.js    # Chat API tests
│   └── tts-handler.test.js     # TTS API tests
├── e2e/                     # End-to-end tests (Playwright)
│   └── sandra-chat-flow.spec.js # Browser UI tests
├── performance/             # Performance tests (Playwright)
│   └── load-time.spec.js       # Load time & metrics
└── integration/             # Integration tests (Jest)
```

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

This runs:
1. Unit tests (Jest)
2. E2E tests (Playwright)

### Run Individual Test Suites

#### Unit Tests Only

```bash
npm run test:unit
```

**Coverage:**
- Chat handler validation (13 tests)
- TTS handler validation (14 tests)
- HTTP method validation
- Input validation
- Error handling
- CORS headers
- Multi-model fallback

#### E2E Tests Only

```bash
npm run test:e2e
```

**Coverage:**
- Interface loading
- Chat functionality
- Message sending/receiving
- Voice input UI
- Mobile responsiveness
- Error handling
- Performance metrics

#### Performance Tests

```bash
npm run test:performance
```

**Coverage:**
- Load time (< 5 seconds)
- First Contentful Paint (< 3 seconds)
- Chat response time (< 20 seconds)
- Bundle size (< 500KB)
- Image optimization (< 1MB)
- API endpoint speed
- Cache efficiency

## Test Commands Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run unit + E2E tests |
| `npm run test:unit` | Run Jest unit tests |
| `npm run test:e2e` | Run main E2E tests |
| `npm run test:e2e:all` | Run all E2E tests (including extras) |
| `npm run test:e2e:ui` | Open Playwright UI mode |
| `npm run test:e2e:debug` | Debug E2E tests |
| `npm run test:performance` | Run performance tests |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:all` | Run ALL tests (unit + E2E + performance) |
| `npm run test:quick` | Run unit tests only (fast) |

## Environment Setup

### Required Environment Variables

For **local testing** with real API calls:

```bash
# .env.test or .env
GROQ_API_KEY=your_groq_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
CARTESIA_API_KEY=your_cartesia_key_here
CARTESIA_VOICE_ID=a34aec03-0f17-4fff-903f-d9458a8a92a6
```

**Without API keys:** Tests will still run but API-dependent tests will gracefully fail (validated for error handling).

### Playwright Setup

If running Playwright for the first time:

```bash
npx playwright install
```

This installs browser drivers (Chromium, Firefox, WebKit).

## Test Results

### Unit Tests (Jest)

```bash
npm run test:unit
```

Expected output:
```
PASS  tests/unit/chat-handler.test.js
PASS  tests/unit/tts-handler.test.js

Test Suites: 2 passed, 2 total
Tests:       27 passed, 27 total
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Expected output:
```
Running 12 tests using 1 worker

  ✓ E2E-01: Should load Sandra IA interface
  ✓ E2E-02: Should have functional chat input
  ✓ E2E-03: Should send and receive chat message
  ... (12 tests total)

  12 passed (45s)
```

### Performance Tests

```bash
npm run test:performance
```

Expected output:
```
  ✓ PERF-01: Load time: 2341ms ✅
  ✓ PERF-02: FCP: 1823ms ✅
  ✓ PERF-03: Chat response: 4521ms ✅
  ... (8 tests total)

  8 passed (1.2m)
```

## Coverage Reports

Generate coverage report:

```bash
npm run test:coverage
```

View report:
```bash
open coverage/index.html       # macOS
start coverage/index.html      # Windows
xdg-open coverage/index.html   # Linux
```

**Target Coverage:**
- Branches: 70%+
- Functions: 70%+
- Lines: 70%+
- Statements: 70%+

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### Netlify Build

Add to `netlify.toml`:

```toml
[build]
  command = "npm run test:quick && npm run build"
```

## Debugging Tests

### Debug Unit Tests

```bash
npm run test:unit -- --verbose
```

### Debug E2E Tests

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector with step-by-step execution.

### Debug in UI Mode

```bash
npm run test:e2e:ui
```

Opens Playwright UI with time-travel debugging.

### Watch Mode (Unit Tests)

```bash
npm run test:watch
```

Auto-runs tests on file changes.

## Troubleshooting

### "Cannot find module" Error

```bash
npm install
```

### Playwright Browser Not Found

```bash
npx playwright install
```

### API Tests Failing

Check environment variables:
```bash
echo $GROQ_API_KEY
echo $ANTHROPIC_API_KEY
```

If missing, add to `.env` file or export:
```bash
export GROQ_API_KEY=your_key
export ANTHROPIC_API_KEY=your_key
```

### E2E Tests Timeout

Increase timeout in `playwright.config.js`:
```js
timeout: 90000  // 90 seconds
```

### Network Issues

Run with retry:
```bash
npm run test:e2e -- --retries=3
```

## Test Writing Guide

### Adding Unit Tests

Create file: `tests/unit/my-feature.test.js`

```javascript
const { handler } = require('../../netlify/functions/my-feature');

describe('My Feature', () => {
  test('should do something', async () => {
    const result = await handler({ httpMethod: 'POST' });
    expect(result.statusCode).toBe(200);
  });
});
```

### Adding E2E Tests

Create file: `tests/e2e/my-feature.spec.js`

```javascript
const { test, expect } = require('@playwright/test');

test('should load feature', async ({ page }) => {
  await page.goto('https://sandra.guestsvalencia.es');
  const element = page.locator('.my-feature');
  await expect(element).toBeVisible();
});
```

## Best Practices

1. **Run tests before committing**
   ```bash
   npm run test:quick
   ```

2. **Check coverage regularly**
   ```bash
   npm run test:coverage
   ```

3. **Debug failing tests immediately**
   ```bash
   npm run test:e2e:debug
   ```

4. **Keep tests fast**
   - Unit tests: < 100ms each
   - E2E tests: < 30s each

5. **Use descriptive test names**
   ```javascript
   test('E2E-01: Should load Sandra IA interface', ...)
   ```

6. **Handle flaky tests**
   - Add retries for network-dependent tests
   - Use proper wait conditions
   - Avoid hardcoded timeouts

## Test Metrics

### Current Coverage

- **Unit Tests:** 27 tests covering chat & TTS handlers
- **E2E Tests:** 12 tests covering user flows
- **Performance Tests:** 8 tests covering load time & metrics

### Expected Results

- **Unit Tests:** 100% pass rate
- **E2E Tests:** 100% pass rate (with retries)
- **Performance Tests:** 90%+ pass rate (network-dependent)

## Support

**Issues?** Check:
1. Environment variables configured
2. Dependencies installed (`npm install`)
3. Browsers installed (`npx playwright install`)
4. Network connectivity

**Still stuck?** Run verbose mode:
```bash
npm run test:unit -- --verbose
npm run test:e2e -- --trace on
```

---

**Last Updated:** Phase 12 Testing Implementation
**Test Suite Version:** 1.0.0
**Coverage Target:** 70%+
