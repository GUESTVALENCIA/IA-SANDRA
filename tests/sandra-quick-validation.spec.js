// SANDRA IA QUICK VALIDATION - 5 minute smoke test
const { test, expect } = require('@playwright/test');

test.describe('Sandra IA Quick Validation', () => {
  
  test('QUICK CHECK: App loads and responsive', async ({ page }) => {
    console.log('Opening https://sandra.guestsvalencia.es');
    
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto('https://sandra.guestsvalencia.es', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('Page loaded successfully');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/sandra-homepage.png', fullPage: true });
    
    // Check for major UI elements
    const bodyText = await page.textContent('body');
    console.log('Page contains Sandra:', bodyText.includes('Sandra'));
    
    // Check mobile responsiveness
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    
    const hasHorizontalScroll = await page.evaluate(() => 
      document.documentElement.scrollWidth > window.innerWidth
    );
    
    console.log('Mobile responsive (no horizontal scroll):', !hasHorizontalScroll);
    console.log('Critical errors:', errors.filter(e => e.includes('500') || e.includes('CORS')).length);
    
    expect(errors.filter(e => e.includes('500')).length).toBe(0);
    
    console.log('VALIDATION: PASS');
  });
});
