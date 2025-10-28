// SANDRA IA FUNCTIONAL TESTS - Real Browser Validation
const { test, expect } = require('@playwright/test');

const APP_URL = 'https://sandra.guestsvalencia.es/sandra-deploy/app.html';
const BASE_URL = 'https://sandra.guestsvalencia.es';

test.describe('Sandra IA - Functional Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('.header', { timeout: 10000 });
  });

  test('1. APP LOAD - Interface loads correctly', async ({ page }) => {
    const header = await page.locator('.header');
    await expect(header).toBeVisible();
    
    const logo = await page.locator('.logo');
    await expect(logo).toContainText('Sandra');
    
    const chatInput = await page.locator('.chat-input');
    await expect(chatInput).toBeVisible();
    
    console.log('APP LOAD: PASS');
  });

  test('2. CHAT TEXT - Send message and receive response', async ({ page }) => {
    const chatInput = await page.locator('.chat-input');
    await chatInput.fill('Hola Sandra');
    
    const sendBtn = await page.locator('.send-btn');
    await sendBtn.click();
    
    const userMessage = await page.locator('.message.user').last();
    await expect(userMessage).toBeVisible({ timeout: 5000 });
    
    const sandraMessage = await page.locator('.message.sandra').last();
    await expect(sandraMessage).toBeVisible({ timeout: 15000 });
    
    const response = await sandraMessage.textContent();
    expect(response.length).toBeGreaterThan(5);
    
    console.log('CHAT TEXT: PASS - Response:', response);
  });

  test('3. NO ERRORS - Check for critical errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    const chatInput = await page.locator('.chat-input');
    await chatInput.fill('Test');
    await page.locator('.send-btn').click();
    await page.waitForTimeout(3000);
    
    const critical = errors.filter(e => 
      e.includes('500') || e.includes('CORS') || e.includes('TTS error')
    );
    
    expect(critical.length).toBe(0);
    console.log('NO ERRORS: PASS');
  });

  test('4. MULTI-TURN - Context retention', async ({ page }) => {
    const chatInput = await page.locator('.chat-input');
    const sendBtn = await page.locator('.send-btn');
    
    await chatInput.fill('Me llamo Sandrita');
    await sendBtn.click();
    await page.waitForSelector('.message.sandra', { timeout: 15000 });
    await page.waitForTimeout(1000);
    
    await chatInput.fill('Tengo 7 años');
    await sendBtn.click();
    await page.waitForTimeout(1000);
    await page.locator('.message.sandra').nth(1).waitFor({ timeout: 15000 });
    
    await chatInput.fill('Como me llamo');
    await sendBtn.click();
    await page.waitForTimeout(1000);
    
    const finalResponse = await page.locator('.message.sandra').last();
    await finalResponse.waitFor({ timeout: 15000 });
    const text = await finalResponse.textContent();
    
    const remembers = text.toLowerCase().includes('sandrita');
    console.log('MULTI-TURN: Context retained?', remembers);
    expect(remembers).toBe(true);
  });

  test('5. VOICE INPUT - UI present', async ({ page }) => {
    const voiceBtn = await page.locator('.voice-btn');
    await expect(voiceBtn).toBeVisible();
    await voiceBtn.click();
    await page.waitForTimeout(1000);
    
    console.log('VOICE INPUT: PASS');
  });

  test('6. RESPONSIVE - Mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.chat-input')).toBeVisible();
    
    const chatInput = await page.locator('.chat-input');
    await chatInput.fill('Mobile test');
    await page.locator('.send-btn').click();
    await page.waitForSelector('.message.sandra', { timeout: 15000 });
    
    console.log('RESPONSIVE: PASS');
  });
});
