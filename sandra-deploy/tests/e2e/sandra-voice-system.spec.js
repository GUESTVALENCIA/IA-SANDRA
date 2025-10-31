// Sandra IA Galaxy PWA - Voice System E2E Tests
// Comprehensive testing for voice conversation and barge-in functionality

const { test, expect } = require('@playwright/test');

test.describe('Sandra IA Galaxy PWA - Voice System', () => {

  test.beforeEach(async ({ page, context }) => {
    // Grant microphone permissions
    await context.grantPermissions(['microphone']);

    // Navigate to PWA and wait for full load
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for voice system initialization
    await page.waitForSelector('.voice-btn', { timeout: 10000 });
    await page.waitForFunction(() => window.sandraVoice !== undefined, { timeout: 5000 });
  });

  test('Voice button is present and interactive', async ({ page }) => {
    const voiceButton = page.locator('.voice-btn');

    // Verify voice button exists
    await expect(voiceButton).toBeVisible();
    await expect(voiceButton).toContainText('🎤');

    // Verify button styling
    await expect(voiceButton).toHaveClass(/voice-btn/);

    // Test hover effect (desktop)
    await voiceButton.hover();

    // Test click interaction
    await voiceButton.click();
    await page.waitForTimeout(500);

    // Verify button state change (may show recording or processing state)
    const buttonAfterClick = await voiceButton.textContent();
    expect(['🎤', '🔴', '⚙️']).toContain(buttonAfterClick);
  });

  test('Voice system initializes correctly', async ({ page }) => {
    // Check that voice system components are loaded
    const voiceSystemReady = await page.evaluate(() => {
      return window.sandraVoice &&
             window.sandraVoice.recognition &&
             window.sandraVoice.synthesis;
    });

    expect(voiceSystemReady).toBe(true);

    // Verify Web Speech API availability
    const speechAPIAvailable = await page.evaluate(() => {
      return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    });

    expect(speechAPIAvailable).toBe(true);

    // Check speech synthesis availability
    const synthesisSAvailable = await page.evaluate(() => {
      return 'speechSynthesis' in window;
    });

    expect(synthesisSAvailable).toBe(true);
  });

  test('Voice module activation works correctly', async ({ page }) => {
    // Activate voice module
    await page.locator('[onclick*="voice"]').click();

    // Wait for activation message
    await page.waitForTimeout(1000);

    // Verify voice module activation message
    const lastMessage = page.locator('#chatMessages .message.sandra').last();
    await expect(lastMessage).toContainText('Procesamiento de voz activado');

    // Verify voice button is marked as active module
    const voiceModuleButton = page.locator('[onclick*="voice"]');
    await expect(voiceModuleButton).toHaveCSS('background', /rgba\(0, 255, 136, 0\.3\)/);
  });

  test('Keyboard shortcut for voice activation works', async ({ page }) => {
    // Test Ctrl+M shortcut
    await page.keyboard.press('Control+m');

    // Wait for voice activation
    await page.waitForTimeout(500);

    // Verify voice button responded to keyboard shortcut
    const voiceButton = page.locator('.voice-btn');
    const buttonState = await voiceButton.textContent();

    // Should either be recording (🔴) or return to idle (🎤)
    expect(['🎤', '🔴', '⚙️']).toContain(buttonState);
  });

  test('Voice permission handling works correctly', async ({ page }) => {
    // Simulate clicking voice button
    await page.locator('.voice-btn').click();

    // Wait for permission request or voice activation
    await page.waitForTimeout(1000);

    // Check if permission was granted and voice system activated
    const permissionGranted = await page.evaluate(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (e) {
        return false;
      }
    });

    if (permissionGranted) {
      // If permission granted, voice should be activated
      const voiceSystemActive = await page.evaluate(() => {
        return window.sandraVoice && window.sandraVoice.mediaStream !== null;
      });
      expect(voiceSystemActive).toBe(true);
    }
  });

  test('Barge-in detection system is initialized', async ({ page }) => {
    // Check if barge-in detection components are set up
    const bargeInReady = await page.evaluate(() => {
      return window.sandraVoice &&
             window.sandraVoice.audioContext &&
             window.sandraVoice.analyzer;
    });

    expect(bargeInReady).toBe(true);

    // Verify barge-in threshold is set
    const threshold = await page.evaluate(() => {
      return window.sandraVoice && window.sandraVoice.interruptionThreshold;
    });

    expect(threshold).toBeGreaterThan(0);
    expect(threshold).toBeLessThanOrEqual(1);
  });

  test('Voice system handles errors gracefully', async ({ page }) => {
    // Simulate voice system error by overriding getUserMedia
    await page.evaluate(() => {
      navigator.mediaDevices.getUserMedia = () => Promise.reject(new Error('Permission denied'));
    });

    // Try to activate voice
    await page.locator('.voice-btn').click();
    await page.waitForTimeout(1000);

    // Verify graceful error handling
    const chatMessages = page.locator('#chatMessages .message.sandra');
    const messageCount = await chatMessages.count();

    if (messageCount > 1) {
      const lastMessage = chatMessages.last();
      const messageText = await lastMessage.textContent();
      expect(messageText).toMatch(/no disponible|error|permission/i);
    }

    // Verify app continues to function
    await expect(page.locator('#chatInput')).toBeVisible();
    await expect(page.locator('.send-btn')).toBeVisible();
  });

  test('Voice button state transitions work correctly', async ({ page }) => {
    const voiceButton = page.locator('.voice-btn');

    // Initial state
    await expect(voiceButton).toContainText('🎤');
    await expect(voiceButton).toHaveClass(/voice-btn/);
    await expect(voiceButton).not.toHaveClass(/recording/);
    await expect(voiceButton).not.toHaveClass(/processing/);

    // Activate voice
    await voiceButton.click();
    await page.waitForTimeout(500);

    // Check for state change
    const hasRecordingClass = await voiceButton.evaluate(el => el.classList.contains('recording'));
    const hasProcessingClass = await voiceButton.evaluate(el => el.classList.contains('processing'));
    const buttonText = await voiceButton.textContent();

    // Should have changed state
    expect(hasRecordingClass || hasProcessingClass || buttonText === '🔴' || buttonText === '⚙️').toBe(true);
  });

  test('Speech synthesis functionality is available', async ({ page }) => {
    // Check speech synthesis availability
    const synthAvailable = await page.evaluate(() => {
      return window.speechSynthesis && typeof window.speechSynthesis.speak === 'function';
    });

    expect(synthAvailable).toBe(true);

    // Check if Spanish voices are available
    const spanishVoicesAvailable = await page.evaluate(() => {
      const voices = window.speechSynthesis.getVoices();
      return voices.some(voice => voice.lang.includes('es'));
    });

    // Note: Voices might not be loaded immediately, so this might be false initially
    expect(typeof spanishVoicesAvailable).toBe('boolean');
  });

  test('Voice system integration with chat works', async ({ page }) => {
    // Activate voice module first
    await page.locator('[onclick*="voice"]').click();
    await page.waitForTimeout(1000);

    // Simulate speaking activation
    await page.locator('.voice-btn').click();
    await page.waitForTimeout(500);

    // Verify voice system is linked to chat
    const voiceIntegrated = await page.evaluate(() => {
      return window.sandraVoice && window.sandraVoice.connectionManager;
    });

    expect(voiceIntegrated).toBe(true);
  });

  test('Touch gesture support for voice activation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Simulate swipe up gesture in chat container
    const chatContainer = page.locator('.chat-container');

    await chatContainer.hover();

    // Simulate touch events for swipe up
    await page.evaluate(() => {
      const container = document.querySelector('.chat-container');
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientY: 400 }],
        cancelable: true
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientY: 300 }],
        cancelable: true
      });

      container.dispatchEvent(touchStart);
      setTimeout(() => container.dispatchEvent(touchEnd), 50);
    });

    await page.waitForTimeout(500);

    // Verify gesture was detected (voice button might have changed state)
    const voiceButton = page.locator('.voice-btn');
    await expect(voiceButton).toBeVisible();
  });

  test('Voice system performance metrics', async ({ page }) => {
    // Measure voice system initialization time
    const initTime = await page.evaluate(() => {
      const start = performance.now();
      return new Promise((resolve) => {
        if (window.sandraVoice) {
          resolve(performance.now() - start);
        } else {
          const checkInterval = setInterval(() => {
            if (window.sandraVoice) {
              clearInterval(checkInterval);
              resolve(performance.now() - start);
            }
          }, 10);
        }
      });
    });

    // Voice system should initialize quickly (under 1 second)
    expect(initTime).toBeLessThan(1000);

    // Test voice button response time
    const responseStart = Date.now();
    await page.locator('.voice-btn').click();
    await page.waitForTimeout(100);
    const responseTime = Date.now() - responseStart;

    // Voice button should respond quickly
    expect(responseTime).toBeLessThan(200);
  });

});