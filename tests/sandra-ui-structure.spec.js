// SANDRA IA UI STRUCTURE ANALYSIS
const { test } = require('@playwright/test');

test('Analyze Sandra IA UI Structure', async ({ page }) => {
  console.log('\n========================================');
  console.log('SANDRA IA UI STRUCTURE ANALYSIS');
  console.log('========================================\n');
  
  await page.goto('https://sandra.guestsvalencia.es', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  console.log('Page loaded successfully\n');
  
  // Get page structure
  const structure = await page.evaluate(() => {
    const result = {
      inputs: [],
      buttons: [],
      textareas: []
    };
    
    document.querySelectorAll('input').forEach((el, i) => {
      result.inputs.push({
        index: i,
        type: el.type,
        placeholder: el.placeholder || '',
        id: el.id || '',
        className: el.className || ''
      });
    });
    
    document.querySelectorAll('button').forEach((el, i) => {
      result.buttons.push({
        index: i,
        text: el.textContent.trim().substring(0, 50),
        className: el.className || '',
        id: el.id || ''
      });
    });
    
    document.querySelectorAll('textarea').forEach((el, i) => {
      result.textareas.push({
        index: i,
        placeholder: el.placeholder || '',
        className: el.className || ''
      });
    });
    
    return result;
  });
  
  console.log('=== INPUTS FOUND ===');
  structure.inputs.forEach(input => {
    console.log('Input:', input.type, '|', input.placeholder, '|', input.className);
  });
  
  console.log('\n=== BUTTONS FOUND ===');
  structure.buttons.forEach(button => {
    console.log('Button:', button.text, '|', button.className);
  });
  
  console.log('\n=== TEXTAREAS FOUND ===');
  structure.textareas.forEach(textarea => {
    console.log('Textarea:', textarea.placeholder, '|', textarea.className);
  });
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/ui-structure.png', fullPage: true });
  
  console.log('\n=== Screenshot: test-results/ui-structure.png ===');
  console.log('========================================\n');
});
