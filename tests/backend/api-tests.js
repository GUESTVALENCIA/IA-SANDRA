// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - BACKEND API TESTS
// Integration tests for all Netlify Functions
// ═══════════════════════════════════════════════════════════════════

const fetch = require('node-fetch');

const BASE_URL = process.env.TEST_URL || 'http://localhost:8888/.netlify/functions';

// Test utilities
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  log(`\n🧪 Testing: ${name}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test results
let passed = 0;
let failed = 0;

async function assert(condition, message) {
  if (condition) {
    passed++;
    logSuccess(message);
  } else {
    failed++;
    logError(message);
  }
}

// ====== TESTS ======

async function testHealthEndpoint() {
  logTest('Health Check Endpoint');

  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();

    await assert(response.status === 200, 'Health endpoint returns 200');
    await assert(data.status === 'healthy', 'Status is healthy');
    await assert(data.version, 'Version is present');
    await assert(data.timestamp, 'Timestamp is present');

  } catch (error) {
    logError(`Health test failed: ${error.message}`);
    failed++;
  }
}

async function testChatLocalEndpoint() {
  logTest('Chat Local Endpoint');

  try {
    const response = await fetch(`${BASE_URL}/chat-local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hola Sandra' }
        ]
      })
    });

    const data = await response.json();

    await assert(response.status === 200, 'Chat endpoint returns 200');
    await assert(data.success === true, 'Response has success=true');
    await assert(data.data.text, 'Response has text field');
    await assert(data.data.provider, 'Response has provider field');
    await assert(data.data.tier, 'Response has tier field');
    await assert(data.data.latency, 'Response has latency field');

    logSuccess(`Provider: ${data.data.provider}, Tier: ${data.data.tier}, Latency: ${data.data.latency}`);

  } catch (error) {
    logError(`Chat test failed: ${error.message}`);
    failed++;
  }
}

async function testChatLocalCache() {
  logTest('Chat Local Cache');

  try {
    const message = { role: 'user', content: 'Test cache message ' + Date.now() };

    // First request
    const response1 = await fetch(`${BASE_URL}/chat-local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [message] })
    });
    const data1 = await response1.json();

    // Second request (should be cached)
    const response2 = await fetch(`${BASE_URL}/chat-local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [message] })
    });
    const data2 = await response2.json();

    await assert(data1.data.text === data2.data.text, 'Cached response matches original');
    await assert(data2.data.cached === true, 'Second response is marked as cached');
    await assert(data2.data.provider === 'Cache', 'Provider is Cache');

  } catch (error) {
    logError(`Cache test failed: ${error.message}`);
    failed++;
  }
}

async function testMetricsEndpoint() {
  logTest('Metrics Endpoint');

  try {
    const response = await fetch(`${BASE_URL}/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stats' })
    });

    const data = await response.json();

    await assert(response.status === 200, 'Metrics endpoint returns 200');
    await assert(data.success === true, 'Response has success=true');
    await assert(data.data.stats, 'Response has stats');
    await assert(data.data.requests, 'Response has requests data');
    await assert(data.data.models, 'Response has models data');
    await assert(data.data.cache, 'Response has cache stats');

    logSuccess(`Total requests: ${data.data.requests.total}`);
    logSuccess(`Cache hit rate: ${data.data.cache.hitRate}`);

  } catch (error) {
    logError(`Metrics test failed: ${error.message}`);
    failed++;
  }
}

async function testMetricsHealth() {
  logTest('Metrics Health Check');

  try {
    const response = await fetch(`${BASE_URL}/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'health' })
    });

    const data = await response.json();

    await assert(response.status === 200, 'Health check returns 200');
    await assert(data.success === true, 'Response has success=true');
    await assert(data.data.status, 'Response has status');
    await assert(data.data.checks, 'Response has checks');

    logSuccess(`System status: ${data.data.status}`);

  } catch (error) {
    logError(`Health check test failed: ${error.message}`);
    failed++;
  }
}

async function testRateLimiting() {
  logTest('Rate Limiting');

  try {
    // Make multiple rapid requests
    const requests = [];
    for (let i = 0; i < 65; i++) { // Exceed 60/min limit
      requests.push(
        fetch(`${BASE_URL}/chat-local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: `Test ${i}` }]
          })
        })
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);

    await assert(rateLimited.length > 0, 'Rate limiting triggered');
    logSuccess(`${rateLimited.length} requests were rate limited`);

  } catch (error) {
    logError(`Rate limiting test failed: ${error.message}`);
    failed++;
  }
}

async function testErrorHandling() {
  logTest('Error Handling');

  try {
    // Test invalid JSON
    const response1 = await fetch(`${BASE_URL}/chat-local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });

    await assert(response1.status === 400, 'Invalid JSON returns 400');

    // Test missing required fields
    const response2 = await fetch(`${BASE_URL}/chat-local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    await assert(response2.status === 400, 'Missing fields returns 400');

    // Test invalid HTTP method
    const response3 = await fetch(`${BASE_URL}/chat-local`, {
      method: 'GET'
    });

    await assert(response3.status === 405, 'Invalid method returns 405');

  } catch (error) {
    logError(`Error handling test failed: ${error.message}`);
    failed++;
  }
}

async function testCORS() {
  logTest('CORS Headers');

  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'OPTIONS'
    });

    await assert(response.status === 200, 'OPTIONS request returns 200');
    await assert(
      response.headers.get('Access-Control-Allow-Origin'),
      'CORS origin header present'
    );
    await assert(
      response.headers.get('Access-Control-Allow-Methods'),
      'CORS methods header present'
    );

  } catch (error) {
    logError(`CORS test failed: ${error.message}`);
    failed++;
  }
}

async function testRequestTracking() {
  logTest('Request Tracking');

  try {
    const response = await fetch(`${BASE_URL}/chat-local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': 'test-request-123'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Test tracking' }]
      })
    });

    await assert(
      response.headers.get('X-Request-ID'),
      'Response has X-Request-ID header'
    );
    await assert(
      response.headers.get('X-Response-Time'),
      'Response has X-Response-Time header'
    );
    await assert(
      response.headers.get('X-RateLimit-Limit'),
      'Response has X-RateLimit-Limit header'
    );

  } catch (error) {
    logError(`Request tracking test failed: ${error.message}`);
    failed++;
  }
}

// ====== INTEGRATION TESTS (Optional - require API keys) ======

async function testVoiceEndpoint() {
  logTest('Voice Endpoint (TTS mode)');

  try {
    const response = await fetch(`${BASE_URL}/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hola, esto es una prueba',
        mode: 'tts'
      })
    });

    if (response.status === 200) {
      const data = await response.json();
      await assert(data.success === true, 'Voice endpoint succeeds');
      await assert(data.data.audio, 'Audio data is present');
      await assert(data.data.mime, 'MIME type is present');
      logSuccess('Voice endpoint working');
    } else {
      logWarning('Voice endpoint not available (may need API keys)');
    }

  } catch (error) {
    logWarning(`Voice test skipped: ${error.message}`);
  }
}

async function testVisionEndpoint() {
  logTest('Vision Endpoint');

  try {
    // Simple 1x1 red pixel JPEG
    const redPixel = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==';

    const response = await fetch(`${BASE_URL}/vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: redPixel,
        mode: 'analyze',
        prompt: 'Describe this image'
      })
    });

    if (response.status === 200) {
      const data = await response.json();
      await assert(data.success === true, 'Vision endpoint succeeds');
      await assert(data.data.analysis, 'Analysis is present');
      logSuccess('Vision endpoint working');
    } else {
      logWarning('Vision endpoint not available (may need API keys)');
    }

  } catch (error) {
    logWarning(`Vision test skipped: ${error.message}`);
  }
}

// ====== RUN ALL TESTS ======

async function runAllTests() {
  log('\n═══════════════════════════════════════════════════════════', 'blue');
  log('  SANDRA IA - BACKEND API TESTS', 'blue');
  log('═══════════════════════════════════════════════════════════\n', 'blue');

  log(`Testing endpoint: ${BASE_URL}\n`, 'yellow');

  // Core tests (no API keys required)
  await testHealthEndpoint();
  await testChatLocalEndpoint();
  await testChatLocalCache();
  await testMetricsEndpoint();
  await testMetricsHealth();
  await testErrorHandling();
  await testCORS();
  await testRequestTracking();
  await testRateLimiting();

  // Integration tests (may require API keys)
  await testVoiceEndpoint();
  await testVisionEndpoint();

  // Summary
  log('\n═══════════════════════════════════════════════════════════', 'blue');
  log('  TEST RESULTS', 'blue');
  log('═══════════════════════════════════════════════════════════\n', 'blue');

  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`📊 Total: ${passed + failed}\n`, 'blue');

  if (failed === 0) {
    log('🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some tests failed. Please review.', 'red');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  logError(`Test runner error: ${error.message}`);
  process.exit(1);
});
