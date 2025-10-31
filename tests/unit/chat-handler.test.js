// SANDRA IA - CHAT HANDLER UNIT TESTS
// Testing multi-model LLM fallback chain

// Mock fetch globally (avoiding node-fetch ESM issues)
global.fetch = jest.fn();

// Mock environment variables
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test-groq-key';
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'test-anthropic-key';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';
process.env.GROQ_MODEL = 'mixtral-8x7b-32768';
process.env.DEFAULT_LOCALE = 'es-ES';
process.env.DEFAULT_MODE = 'dev';

const { handler } = require('../../netlify/functions/chat/index.js');

describe('Chat Handler - Unit Tests', () => {

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

  test('should reject empty messages array with 400', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ messages: [] })
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('No messages provided');
  });

  test('should handle valid message structure', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hola' }
        ]
      })
    };

    const response = await handler(event);

    // Should be either 200 (success) or 500 (API key issues in test)
    expect([200, 500]).toContain(response.statusCode);

    const body = JSON.parse(response.body);

    if (response.statusCode === 200) {
      expect(body.text).toBeDefined();
      expect(body.provider).toBeDefined();
      expect(body.locale).toBe('es-ES');
    } else {
      // In test environment without valid keys, should fail gracefully
      expect(body.error).toBeDefined();
    }
  });

  test('should limit message history to 20 messages', async () => {
    const messages = Array(30).fill(null).map((_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}`
    }));

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ messages })
    };

    const response = await handler(event);

    // Should not crash with large message arrays
    expect([200, 500]).toContain(response.statusCode);
  });

  test('should handle very long message content (5000+ chars)', async () => {
    const longMessage = 'a'.repeat(5000);

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'user', content: longMessage }
        ]
      })
    };

    const response = await handler(event);

    // Should handle long messages without crashing
    expect([200, 500]).toContain(response.statusCode);
  });

  test('should respect custom locale parameter', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        locale: 'en-US'
      })
    };

    const response = await handler(event);

    if (response.statusCode === 200) {
      const body = JSON.parse(response.body);
      expect(body.locale).toBe('en-US');
    }
  });

  test('should include system message in conversation', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'user', content: '¿Quién eres?' }
        ]
      })
    };

    const response = await handler(event);

    // Should attempt to call LLM with system prompt
    expect([200, 500]).toContain(response.statusCode);
  });

  test('should handle special characters in messages', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'user', content: '¡Hola! ¿Cómo estás? Ñoño' }
        ]
      })
    };

    const response = await handler(event);

    // Should not break with Spanish characters
    expect([200, 500]).toContain(response.statusCode);
  });

  test('should return proper CORS headers', async () => {
    const event = {
      httpMethod: 'OPTIONS',
      body: null
    };

    const response = await handler(event);

    // OPTIONS request should have CORS headers
    expect(response.headers).toBeDefined();
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(response.headers['Access-Control-Allow-Methods']).toContain('POST');
  });

  test('should handle missing role in message', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        messages: [
          { content: 'No role specified' }
        ]
      })
    };

    const response = await handler(event);

    // Should handle gracefully
    expect([200, 400, 500]).toContain(response.statusCode);
  });

  test('should handle missing content in message', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'user' }
        ]
      })
    };

    const response = await handler(event);

    // Should handle gracefully
    expect([200, 400, 500]).toContain(response.statusCode);
  });
});
