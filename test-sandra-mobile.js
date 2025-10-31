// Sandra IA Mobile - Functional Browser Test
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    hasTouch: true,
    isMobile: true
  });
  
  const page = await context.newPage();
  
  console.log('\n🧪 TESTING SANDRA IA MOBILE - FUNCTIONAL VALIDATION\n');
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  try {
    console.log('📱 Step 1: Navigate to https://sandra.guestsvalencia.es');
    await page.goto('https://sandra.guestsvalencia.es', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: 'test-screenshots/01-homepage.png', fullPage: true });
    console.log('✅ Homepage loaded');
    
    console.log('\n📱 Step 2: Check page content');
    const title = await page.title();
    console.log('Page title:', title);
    
    console.log('\n📱 Step 3: Locate chat elements');
    const inputs = await page.locator('input, textarea').count();
    console.log('Found', inputs, 'input elements');
    
    if (inputs > 0) {
      const chatInput = await page.locator('input[type="text"], textarea').first();
      await chatInput.fill('Hola Sandra test');
      await page.screenshot({ path: 'test-screenshots/02-chat-input.png' });
      console.log('✅ Text entered');
    }
    
    console.log('\n📱 Step 4: Final screenshot');
    await page.screenshot({ path: 'test-screenshots/03-final.png', fullPage: true });
    
    console.log('\n📊 SUMMARY: Total console errors:', errors.length);
    
  } catch (error) {
    console.log('\n❌ TEST FAILED:', error.message);
    await page.screenshot({ path: 'test-screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ Testing complete');
  }
})();
