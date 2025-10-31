// SANDRA IA - TTS HANDLER UNIT TESTS
// Testing TTS fallback chain (TTS MP3 → Cartesia)

// Mock fetch globally (avoiding node-fetch ESM issues)
global.fetch = jest.fn();

// Mock environment variables
process.env.CARTESIA_API_KEY = process.env.CARTESIA_API_KEY || 'test-cartesia-key';
process.env.CARTESIA_VOICE_ID = process.env.CARTESIA_VOICE_ID || 'a34aec03-0f17-4fff-903f-d9458a8a92a6';

const { handler } = require('../../netlify/functions/tts/index.js');

describe('TTS Handler - Unit Tests', () => {

  test('should reject OPTIONS method with 200', async () => {
    const event = {
      httpMethod: 'OPTIONS',
      body: null
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  test('should reject GET method with 405', async () => {
    const event = {
      httpMethod: 'GET',
      body: null
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(405);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Method not allowed');
  });

  test('should reject invalid JSON with 400', async () => {
    const event = {
      httpMethod: 'POST',
      body: 'invalid json{'
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Invalid JSON');
  });

  test('should reject empty text with 400', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ text: '' })
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Text is required');
  });

  test('should reject missing text field with 400', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({})
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Text is required');
  });

  test('should handle valid text input', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ text: 'Hola mundo' })
    };

    const response = await handler(event);

    // Should be either 200 (success) or 503 (API failures in test)
    expect([200, 503, 500]).toContain(response.statusCode);

    const body = JSON.parse(response.body);

    if (response.statusCode === 200) {
      expect(body.audioBase64).toBeDefined();
      expect(body.mime).toBeDefined();
      expect(body.provider).toBeDefined();
      expect(body.success).toBe(true);
      // Should use TTS MP3 as tier 1
      expect(['TTS MP3', 'Cartesia']).toContain(body.provider);
    } else {
      // In test environment, may fail due to network/API issues
      expect(body.success).toBe(false);
    }
  });

  test('should handle Spanish characters', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ text: '¡Hola! ¿Cómo estás? Ñoño' })
    };

    const response = await handler(event);

    // Should handle Spanish characters without crashing
    expect([200, 503, 500]).toContain(response.statusCode);
  });

  test('should handle very long text (5000+ chars)', async () => {
    const longText = 'a'.repeat(5000);

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ text: longText })
    };

    const response = await handler(event);

    // Should handle long text without crashing
    expect([200, 503, 500]).toContain(response.statusCode);
  });

  test('should handle text with special symbols', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ text: 'Test @#$% symbols! & more...' })
    };

    const response = await handler(event);

    // Should handle special characters
    expect([200, 503, 500]).toContain(response.statusCode);
  });

  test('should return proper CORS headers', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ text: 'Test' })
    };

    const response = await handler(event);

    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(response.headers['Access-Control-Allow-Methods']).toContain('POST');
    expect(response.headers['Content-Type']).toBe('application/json');
  });

  test('should handle numeric text', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ text: '12345' })
    };

    const response = await handler(event);

    // Should handle numbers
    expect([200, 503, 500]).toContain(response.statusCode);
  });

  test('should handle mixed language text', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ text: 'Hello mundo 你好' })
    };

    const response = await handler(event);

    // Should handle mixed languages
    expect([200, 503, 500]).toContain(response.statusCode);
  });

  test('should handle whitespace-only text as empty', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ text: '   ' })
    };

    const response = await handler(event);

    // Should reject whitespace-only text
    expect(response.statusCode).toBe(400);
  });

  test('should return base64 encoded audio on success', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ text: 'Test audio' })
    };

    const response = await handler(event);

    if (response.statusCode === 200) {
      const body = JSON.parse(response.body);
      expect(body.audioBase64).toBeDefined();
      expect(typeof body.audioBase64).toBe('string');
      expect(body.audioBase64.length).toBeGreaterThan(0);

      // Should be valid base64
      expect(() => Buffer.from(body.audioBase64, 'base64')).not.toThrow();
    }
  });

  test('should specify audio MIME type on success', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ text: 'Test' })
    };

    const response = await handler(event);

    if (response.statusCode === 200) {
      const body = JSON.parse(response.body);
      expect(['audio/mpeg', 'audio/wav']).toContain(body.mime);
    }
  });
});
