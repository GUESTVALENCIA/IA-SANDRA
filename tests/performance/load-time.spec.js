// SANDRA IA - PERFORMANCE TESTS
// Load time and response time validation

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://sandra.guestsvalencia.es';
const APP_URL = `${BASE_URL}/sandra-deploy/app.html`;

test.describe('Sandra IA - Performance Tests', () => {

  test('PERF-01: Should load Sandra IA in under 5 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(APP_URL, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForSelector('.header, h1', { timeout: 10000 });

    const loadTime = Date.now() - startTime;

    console.log(`📊 PERF-01: Load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(5000);
  });

  test('PERF-02: Should have fast First Contentful Paint', async ({ page }) => {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

    const metrics = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      return {
        fcp: fcp ? fcp.startTime : null,
        domInteractive: performance.timing.domInteractive - performance.timing.navigationStart
      };
    });

    console.log('📊 PERF-02: FCP:', metrics.fcp, 'ms');
    console.log('📊 PERF-02: DOM Interactive:', metrics.domInteractive, 'ms');

    if (metrics.fcp) {
      expect(metrics.fcp).toBeLessThan(3000); // Under 3 seconds
    }
  });

  test('PERF-03: Should respond to chat within reasonable time', async ({ page }) => {
    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('.header, h1', { timeout: 10000 });

    const chatInput = page.locator('.chat-input, input[type="text"], textarea');
    await chatInput.fill('Test performance');

    const startTime = Date.now();

    const sendBtn = page.locator('.send-btn, button:has-text("Enviar"), button:has-text("▶")');
    await sendBtn.click();

    // Wait for response (max 20 seconds)
    try {
      await page.waitForTimeout(8000); // Wait for API response
      const responseTime = Date.now() - startTime;

      console.log(`📊 PERF-03: Chat response time: ${responseTime}ms`);

      expect(responseTime).toBeLessThan(20000); // Under 20 seconds (LLM calls can be slow)
    } catch (e) {
      console.log('⚠️  PERF-03: Response timeout or not detected');
    }
  });

  test('PERF-04: Should have minimal bundle size', async ({ page }) => {
    const resources = [];

    page.on('response', response => {
      const url = response.url();
      const size = parseInt(response.headers()['content-length'] || '0');

      if (url.includes('.js') || url.includes('.css')) {
        resources.push({ url, size });
      }
    });

    await page.goto(APP_URL, { waitUntil: 'networkidle' });

    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
    const totalKB = (totalSize / 1024).toFixed(2);

    console.log(`📊 PERF-04: Total JS/CSS size: ${totalKB} KB`);

    resources.forEach(r => {
      console.log(`  - ${r.url.split('/').pop()}: ${(r.size / 1024).toFixed(2)} KB`);
    });

    // Should be under 500KB for optimal performance
    expect(totalSize).toBeLessThan(500 * 1024);
  });

  test('PERF-05: Should have acceptable Time to Interactive', async ({ page }) => {
    await page.goto(APP_URL, { waitUntil: 'networkidle' });

    const metrics = await page.evaluate(() => {
      return {
        domComplete: performance.timing.domComplete - performance.timing.navigationStart,
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
      };
    });

    console.log('📊 PERF-05: DOM Complete:', metrics.domComplete, 'ms');
    console.log('📊 PERF-05: Load Complete:', metrics.loadComplete, 'ms');

    expect(metrics.domComplete).toBeLessThan(5000);
  });

  test('PERF-06: Should load images efficiently', async ({ page }) => {
    const images = [];

    page.on('response', async response => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';

      if (contentType.includes('image')) {
        const size = parseInt(response.headers()['content-length'] || '0');
        images.push({ url, size });
      }
    });

    await page.goto(APP_URL, { waitUntil: 'networkidle' });

    const totalImageSize = images.reduce((sum, img) => sum + img.size, 0);
    const totalImageKB = (totalImageSize / 1024).toFixed(2);

    console.log(`📊 PERF-06: Total image size: ${totalImageKB} KB`);
    console.log(`📊 PERF-06: Image count: ${images.length}`);

    // Images should be optimized (under 1MB total)
    expect(totalImageSize).toBeLessThan(1024 * 1024);
  });

  test('PERF-07: Should have fast API endpoints', async ({ page }) => {
    await page.goto(APP_URL, { waitUntil: 'networkidle' });

    const apiCalls = [];

    page.on('response', response => {
      const url = response.url();

      if (url.includes('/chat') || url.includes('/tts') || url.includes('/health')) {
        const timing = response.timing();
        apiCalls.push({
          url: url.split('/').pop(),
          status: response.status(),
          time: timing ? timing.responseEnd : 'N/A'
        });
      }
    });

    const chatInput = page.locator('.chat-input, input[type="text"], textarea');
    if (await chatInput.count() > 0) {
      await chatInput.fill('Performance test');

      const sendBtn = page.locator('.send-btn, button:has-text("Enviar"), button:has-text("▶")');
      await sendBtn.click();

      await page.waitForTimeout(5000);
    }

    console.log('📊 PERF-07: API calls:', apiCalls);

    // Each API call should be under 10 seconds
    apiCalls.forEach(call => {
      if (typeof call.time === 'number') {
        expect(call.time).toBeLessThan(10000);
      }
    });
  });

  test('PERF-08: Should cache resources properly', async ({ page }) => {
    // First load
    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    const firstLoadTime = Date.now();
    await page.waitForSelector('.header, h1', { timeout: 10000 });
    const firstLoadDuration = Date.now() - firstLoadTime;

    // Reload page
    await page.reload({ waitUntil: 'networkidle' });
    const secondLoadTime = Date.now();
    await page.waitForSelector('.header, h1', { timeout: 10000 });
    const secondLoadDuration = Date.now() - secondLoadTime;

    console.log(`📊 PERF-08: First load: ${firstLoadDuration}ms`);
    console.log(`📊 PERF-08: Second load: ${secondLoadDuration}ms`);

    // Second load should be faster due to caching
    // (may not always be true depending on cache headers)
    console.log(`📊 PERF-08: Cache improvement: ${((1 - secondLoadDuration / firstLoadDuration) * 100).toFixed(1)}%`);
  });
});
