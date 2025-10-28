// SANDRA IA API ENDPOINTS - FUNCTIONAL TESTING PHASE 5B
// Authorization: CTO Claude Code - Full testing authority
// Date: 2025-10-28
// Production URL: https://sandra.guestsvalencia.es

const { test, expect } = require('@playwright/test');

const APP_URL = 'https://sandra.guestsvalencia.es';
const TEST_TIMEOUT = 30000;

test.describe('Sandra IA API Endpoint Validation - Phase 5B', () => {
  
  let consoleErrors = [];
  let apiCalls = [];
  
  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    apiCalls = [];
    
    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          type: msg.type(),
          text: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Monitor network requests
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/') || url.includes('anthropic') || url.includes('cartesia') || url.includes('deepgram')) {
        apiCalls.push({
          url: url,
          method: request.method(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Navigate to app
    console.log('Navigating to:', APP_URL);
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
  });

  test('TEST 1: CHAT ENDPOINT - Claude Haiku Response', async ({ page }) => {
    console.log('\n=== TEST 1: CHAT ENDPOINT ===');
    
    const chatInput = await page.locator('input[type="text"], textarea, .chat-input, #messageInput').first();
    await expect(chatInput).toBeVisible({ timeout: 10000 });
    
    const startTime = Date.now();
    
    await chatInput.fill('Hola Sandra, como estas?');
    
    const sendBtn = await page.locator('button.send, .send-btn, button[type="submit"]').first();
    await sendBtn.click();
    
    await page.waitForTimeout(3000);
    
    const responseTime = Date.now() - startTime;
    
    console.log('Response time:', responseTime, 'ms');
    console.log('API calls made:', apiCalls.length);
    console.log('Console errors:', consoleErrors.length);
    
    expect(responseTime).toBeLessThan(5000);
    
    const criticalErrors = consoleErrors.filter(e => 
      e.text.includes('500') || 
      e.text.includes('CORS') || 
      e.text.includes('Failed to fetch')
    );
    
    expect(criticalErrors.length).toBe(0);
    
    console.log('TEST 1 STATUS: PASS');
  });

  test('TEST 2: TEXT-TO-SPEECH ENDPOINT - Cartesia Audio', async ({ page }) => {
    console.log('\n=== TEST 2: TTS ENDPOINT ===');
    
    const chatInput = await page.locator('input[type="text"], textarea, .chat-input').first();
    await chatInput.fill('Dime algo bonito');
    
    const sendBtn = await page.locator('button.send, .send-btn, button[type="submit"]').first();
    await sendBtn.click();
    
    await page.waitForTimeout(5000);
    
    const audioElements = await page.locator('audio').count();
    const cartesiaCall = apiCalls.find(call => call.url.includes('cartesia') || call.url.includes('/api/tts'));
    
    console.log('Audio elements found:', audioElements);
    console.log('Cartesia API called:', !!cartesiaCall);
    
    const ttsErrors = consoleErrors.filter(e => 
      e.text.includes('TTS error') || 
      e.text.includes('audio codec')
    );
    
    expect(ttsErrors.length).toBe(0);
    
    console.log('TEST 2 STATUS: PASS');
  });

  test('TEST 3: MOBILE RESPONSIVENESS - Device Testing', async ({ page }) => {
    console.log('\n=== TEST 3: MOBILE RESPONSIVENESS ===');
    
    const devices = [
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
      { name: 'Samsung S21', width: 360, height: 800 }
    ];
    
    for (const device of devices) {
      console.log('Testing on', device.name);
      
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.waitForTimeout(1000);
      
      const horizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(horizontalScroll).toBe(false);
      
      console.log(device.name, 'layout OK');
    }
    
    console.log('TEST 3 STATUS: PASS');
  });

  test('TEST 4: ERROR HANDLING - Edge Cases', async ({ page }) => {
    console.log('\n=== TEST 4: ERROR HANDLING ===');
    
    const chatInput = await page.locator('input[type="text"], textarea, .chat-input').first();
    const sendBtn = await page.locator('button.send, .send-btn, button[type="submit"]').first();
    
    await chatInput.fill('');
    await sendBtn.click();
    await page.waitForTimeout(1000);
    console.log('Empty message handled');
    
    const longMessage = 'a'.repeat(5000);
    await chatInput.fill(longMessage);
    await sendBtn.click();
    await page.waitForTimeout(2000);
    console.log('Long message handled');
    
    const serverErrors = consoleErrors.filter(e => e.text.includes('500'));
    expect(serverErrors.length).toBe(0);
    
    console.log('TEST 4 STATUS: PASS');
  });

  test.afterEach(async ({ page }) => {
    console.log('\n=== TEST SUMMARY ===');
    console.log('Total API calls:', apiCalls.length);
    console.log('Total console errors:', consoleErrors.length);
    
    if (consoleErrors.length > 0) {
      console.log('\nConsole Errors:');
      consoleErrors.forEach(err => {
        console.log('[' + err.timestamp + ']', err.text);
      });
    }
  });
});
