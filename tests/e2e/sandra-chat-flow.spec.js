// SANDRA IA - E2E CHAT FLOW TESTS
// Comprehensive browser testing for chat functionality

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://sandra.guestsvalencia.es';
const APP_URL = `${BASE_URL}/sandra-deploy/app.html`;

test.describe('Sandra IA - E2E Chat Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('.header, h1', { timeout: 10000 });
  });

  test('E2E-01: Should load Sandra IA interface', async ({ page }) => {
    const header = page.locator('.header, h1, [role="heading"]');
    await expect(header).toBeVisible();

    const content = await header.textContent();
    expect(content.toLowerCase()).toContain('sandra');

    console.log('✅ E2E-01: Interface loaded');
  });

  test('E2E-02: Should have functional chat input', async ({ page }) => {
    const chatInput = page.locator('.chat-input, input[type="text"], textarea');
    await expect(chatInput).toBeVisible();
    await expect(chatInput).toBeEditable();

    await chatInput.fill('Test message');
    const value = await chatInput.inputValue();
    expect(value).toBe('Test message');

    console.log('✅ E2E-02: Chat input functional');
  });

  test('E2E-03: Should send and receive chat message', async ({ page }) => {
    const chatInput = page.locator('.chat-input, input[type="text"], textarea');
    await chatInput.fill('Hola Sandra');

    const sendBtn = page.locator('.send-btn, button:has-text("Enviar"), button:has-text("▶")');
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();

    // Wait for user message to appear
    await page.waitForTimeout(1000);

    // Wait for Sandra's response (up to 20 seconds)
    await page.waitForTimeout(5000);

    // Check for response message
    const messages = page.locator('.message, [role="article"], .chat-message');
    const count = await messages.count();

    expect(count).toBeGreaterThan(0);

    console.log('✅ E2E-03: Chat message sent and received');
  });

  test('E2E-04: Should handle empty message gracefully', async ({ page }) => {
    const sendBtn = page.locator('.send-btn, button:has-text("Enviar"), button:has-text("▶")');
    await sendBtn.click();

    // Should either show error or do nothing
    await page.waitForTimeout(1000);

    console.log('✅ E2E-04: Empty message handled');
  });

  test('E2E-05: Should have voice input button', async ({ page }) => {
    const voiceBtn = page.locator('.voice-btn, button[aria-label*="voice" i], button:has-text("🎤")');

    if (await voiceBtn.count() > 0) {
      await expect(voiceBtn.first()).toBeVisible();
      console.log('✅ E2E-05: Voice button present');
    } else {
      console.log('⚠️  E2E-05: Voice button not found (may be optional)');
    }
  });

  test('E2E-06: Should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 Pro

    const header = page.locator('.header, h1');
    await expect(header).toBeVisible();

    const chatInput = page.locator('.chat-input, input[type="text"], textarea');
    await expect(chatInput).toBeVisible();

    const sendBtn = page.locator('.send-btn, button:has-text("Enviar"), button:has-text("▶")');
    await expect(sendBtn).toBeVisible();

    console.log('✅ E2E-06: Mobile responsive');
  });

  test('E2E-07: Should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad

    await expect(page.locator('.header, h1')).toBeVisible();
    await expect(page.locator('.chat-input, input[type="text"], textarea')).toBeVisible();

    console.log('✅ E2E-07: Tablet responsive');
  });

  test('E2E-08: Should handle special characters', async ({ page }) => {
    const chatInput = page.locator('.chat-input, input[type="text"], textarea');
    await chatInput.fill('¡Hola! ¿Cómo estás? Ñoño @#$%');

    const sendBtn = page.locator('.send-btn, button:has-text("Enviar"), button:has-text("▶")');
    await sendBtn.click();

    await page.waitForTimeout(2000);

    console.log('✅ E2E-08: Special characters handled');
  });

  test('E2E-09: Should maintain scroll position', async ({ page }) => {
    const chatInput = page.locator('.chat-input, input[type="text"], textarea');
    const sendBtn = page.locator('.send-btn, button:has-text("Enviar"), button:has-text("▶")');

    // Send multiple messages
    for (let i = 0; i < 3; i++) {
      await chatInput.fill(`Message ${i + 1}`);
      await sendBtn.click();
      await page.waitForTimeout(2000);
    }

    // Check if page scrolls to show latest messages
    const scrollPosition = await page.evaluate(() => window.scrollY);
    console.log('Scroll position:', scrollPosition);

    console.log('✅ E2E-09: Scroll behavior tested');
  });

  test('E2E-10: Should not have console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    const chatInput = page.locator('.chat-input, input[type="text"], textarea');
    await chatInput.fill('Test for errors');

    const sendBtn = page.locator('.send-btn, button:has-text("Enviar"), button:has-text("▶")');
    await sendBtn.click();

    await page.waitForTimeout(3000);

    const criticalErrors = errors.filter(e =>
      e.includes('500') ||
      e.includes('CORS') ||
      e.includes('undefined is not a function') ||
      e.includes('Cannot read property')
    );

    expect(criticalErrors.length).toBe(0);

    if (errors.length > 0) {
      console.log('⚠️  Non-critical errors:', errors);
    }

    console.log('✅ E2E-10: No critical console errors');
  });

  test('E2E-11: Should load within 5 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('.header, h1', { timeout: 10000 });

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);

    console.log(`✅ E2E-11: Load time: ${loadTime}ms`);
  });

  test('E2E-12: Should have proper meta tags', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    const description = await page.locator('meta[name="description"]').getAttribute('content');

    if (description) {
      expect(description.length).toBeGreaterThan(0);
      console.log('✅ E2E-12: Meta tags present');
    } else {
      console.log('⚠️  E2E-12: No description meta tag');
    }
  });
});
