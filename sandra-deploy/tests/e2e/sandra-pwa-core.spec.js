// Sandra IA Galaxy PWA - Core E2E Tests
// Comprehensive testing for main PWA functionality

const { test, expect } = require('@playwright/test');

test.describe('Sandra IA Galaxy PWA - Core Functionality', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to PWA and wait for full load
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for Sandra IA to initialize
    await page.waitForSelector('.header', { timeout: 10000 });
    await page.waitForSelector('#chatMessages', { timeout: 10000 });
  });

  test('PWA loads successfully and displays core elements', async ({ page }) => {
    // Verify PWA title
    await expect(page).toHaveTitle(/Sandra IA Galaxy/);

    // Verify header elements
    await expect(page.locator('.logo')).toContainText('Sandra IA');
    await expect(page.locator('.status')).toBeVisible();

    // Verify main components
    await expect(page.locator('.features-panel')).toBeVisible();
    await expect(page.locator('.chat-container')).toBeVisible();
    await expect(page.locator('#chatMessages')).toBeVisible();
    await expect(page.locator('#chatInput')).toBeVisible();

    // Verify buttons
    await expect(page.locator('.send-btn')).toBeVisible();
    await expect(page.locator('.voice-btn')).toBeVisible();
  });

  test('Chat functionality works correctly', async ({ page }) => {
    const chatInput = page.locator('#chatInput');
    const sendButton = page.locator('.send-btn');
    const messagesContainer = page.locator('#chatMessages');

    // Test text input and send
    await chatInput.fill('Hola Sandra, ¿cómo estás?');
    await sendButton.click();

    // Verify user message appears
    await expect(messagesContainer.locator('.message.user').last()).toContainText('Hola Sandra, ¿cómo estás?');

    // Wait for Sandra's response
    await page.waitForTimeout(2000);

    // Verify Sandra response appears
    await expect(messagesContainer.locator('.message.sandra')).toHaveCount({ min: 2 });

    // Test Enter key functionality
    await chatInput.fill('Test enter key');
    await chatInput.press('Enter');

    await expect(messagesContainer.locator('.message.user').last()).toContainText('Test enter key');
  });

  test('All 6 feature modules are accessible', async ({ page }) => {
    const featureButtons = [
      { selector: '[onclick*="dev"]', text: 'Dev', emoji: '💻' },
      { selector: '[onclick*="marketing"]', text: 'Marketing', emoji: '📈' },
      { selector: '[onclick*="design"]', text: 'Design', emoji: '🎨' },
      { selector: '[onclick*="finance"]', text: 'Finance', emoji: '💰' },
      { selector: '[onclick*="voice"]', text: 'Voice', emoji: '🎤' },
      { selector: '[onclick*="vision"]', text: 'Vision', emoji: '👁️' }
    ];

    for (const feature of featureButtons) {
      const button = page.locator(feature.selector);
      await expect(button).toBeVisible();
      await expect(button).toContainText(feature.text);

      // Test clicking each feature
      await button.click();

      // Wait for response
      await page.waitForTimeout(1000);

      // Verify feature activation message
      const lastMessage = page.locator('#chatMessages .message.sandra').last();
      await expect(lastMessage).toBeVisible();
    }
  });

  test('Voice button UI states work correctly', async ({ page }) => {
    const voiceButton = page.locator('.voice-btn');

    // Initial state
    await expect(voiceButton).toBeVisible();
    await expect(voiceButton).toContainText('🎤');

    // Click to activate (may require permissions)
    await voiceButton.click();

    // Wait for state change (recording or permission request)
    await page.waitForTimeout(500);

    // Verify button responds to click
    const buttonText = await voiceButton.textContent();
    expect(buttonText).toBeTruthy();
  });

  test('Responsive design works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify mobile layout
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.main-app')).toBeVisible();

    // Check if features panel adapts to mobile
    const featuresPanel = page.locator('.features-panel');
    await expect(featuresPanel).toBeVisible();

    // Test touch interactions
    await page.locator('#chatInput').tap();
    await expect(page.locator('#chatInput')).toBeFocused();
  });

  test('PWA manifest and service worker are functional', async ({ page }) => {
    // Check for manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    // Verify manifest is accessible
    const manifestResponse = await page.request.get('/manifest.json');
    expect(manifestResponse.status()).toBe(200);

    const manifest = await manifestResponse.json();
    expect(manifest.name).toBe('Sandra IA Galaxy');
    expect(manifest.start_url).toBe('/app.html');

    // Check service worker registration (in browser console)
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swRegistered).toBe(true);
  });

  test('Performance requirements are met', async ({ page }) => {
    // Measure page load time
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Verify load time is under 2 seconds (2000ms)
    expect(loadTime).toBeLessThan(2000);

    // Test input responsiveness
    const inputResponseStart = Date.now();
    await page.locator('#chatInput').click();
    await page.waitForSelector('#chatInput:focus');
    const inputResponseTime = Date.now() - inputResponseStart;

    // Verify input response is under 100ms
    expect(inputResponseTime).toBeLessThan(100);
  });

  test('Accessibility features are working', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Test keyboard shortcuts
    await page.keyboard.press('Control+m'); // Voice shortcut

    // Verify ARIA attributes
    const chatMessages = page.locator('#chatMessages');
    await expect(chatMessages).toHaveAttribute('role', 'log');

    // Test screen reader support
    const messages = page.locator('.message');
    for (let i = 0; i < Math.min(3, await messages.count()); i++) {
      const message = messages.nth(i);
      await expect(message).toHaveAttribute('aria-live', 'polite');
    }
  });

  test('Error handling works correctly', async ({ page }) => {
    // Simulate network error by blocking requests
    await page.route('**/*', route => route.abort());

    // Try to send a message
    await page.locator('#chatInput').fill('Test message');
    await page.locator('.send-btn').click();

    // Wait and restore network
    await page.waitForTimeout(1000);
    await page.unroute('**/*');

    // Verify app still functions
    await expect(page.locator('#chatInput')).toBeVisible();
    await expect(page.locator('.send-btn')).toBeVisible();
  });

  test('Local storage and session management', async ({ page }) => {
    // Send a test message
    await page.locator('#chatInput').fill('Test session storage');
    await page.locator('.send-btn').click();

    // Wait for message to be stored
    await page.waitForTimeout(1000);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if messages are restored
    const messages = page.locator('#chatMessages .message');
    await expect(messages).toHaveCount({ min: 1 });
  });

});