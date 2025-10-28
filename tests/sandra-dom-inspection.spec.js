// SANDRA IA DOM INSPECTION - Understand actual UI structure
const { test } = require('@playwright/test');

test('Inspect Sandra IA DOM Structure', async ({ page }) => {
  console.log('\n=== SANDRA IA DOM INSPECTION ===\n');
  
  await page.goto('https://sandra.guestsvalencia.es', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  console.log('Page loaded. Analyzing DOM structure...\n');
  
  // Get all interactive elements
  const structure = await page.evaluate(() => {
    const result = {
      inputs: [],
      buttons: [],
      textareas: [],
      forms: [],
      clickableElements: []
    };
    
    // Find inputs
    document.querySelectorAll('input').forEach((el, i) => {
      result.inputs.push({
        index: i,
        type: el.type,
        placeholder: el.placeholder || '',
        id: el.id || '',
        className: el.className || '',
        name: el.name || ''
      });
    });
    
    // Find buttons
    document.querySelectorAll('button').forEach((el, i) => {
      result.buttons.push({
        index: i,
        text: el.textContent.trim(),
        className: el.className || '',
        id: el.id || '',
        type: el.type || '',
        ariaLabel: el.getAttribute('aria-label') || ''
      });
    });
    
    // Find textareas
    document.querySelectorAll('textarea').forEach((el, i) => {
      result.textareas.push({
        index: i,
        placeholder: el.placeholder || '',
        id: el.id || '',
        className: el.className || ''
      });
    });
    
    // Find forms
    document.querySelectorAll('form').forEach((el, i) => {
      result.forms.push({
        index: i,
        id: el.id || '',
        className: el.className || '',
        action: el.action || ''
      });
    });
    
    // Find elements with click handlers
    document.querySelectorAll('[onclick], [ng-click], [v-on\:click]').forEach((el, i) => {
      result.clickableElements.push({
        index: i,
        tag: el.tagName,
        className: el.className || '',
        id: el.id || ''
      });
    });
    
    return result;
  });
  
  console.log('=== INPUTS ===');
  structure.inputs.forEach(input => {
    console.log(`Input ${input.index}:`, JSON.stringify(input, null, 2));
  });
  
  console.log('\n=== BUTTONS ===');
  structure.buttons.forEach(button => {
    console.log(`Button ${button.index}:`, JSON.stringify(button, null, 2));
  });
  
  console.log('\n=== TEXTAREAS ===');
  structure.textareas.forEach(textarea => {
    console.log(`Textarea ${textarea.index}:`, JSON.stringify(textarea, null, 2));
  });
  
  console.log('\n=== FORMS ===');
  structure.forms.forEach(form => {
    console.log(`Form ${form.index}:`, JSON.stringify(form, null, 2));
  });
  
  console.log('\n=== CLICKABLE ELEMENTS ===');
  structure.clickableElements.forEach(el => {
    console.log(`Element ${el.index}:`, JSON.stringify(el, null, 2));
  });
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/dom-inspection.png', fullPage: true });
  
  console.log('\n=== Screenshot saved: test-results/dom-inspection.png ===\n');
});
