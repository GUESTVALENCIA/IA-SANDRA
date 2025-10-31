/**
 * Tests para Safe LLM
 */

const { SafeLLM } = require('../orchestrator/llm/safe-llm');

describe('Safe LLM', () => {
  let safeLLM;

  beforeEach(() => {
    safeLLM = new SafeLLM({
      apiKey: process.env.OPENAI_API_KEY || 'test-key',
      model: 'gpt-4o',
      maxTokens: 100
    });
  });

  test('should create instance', () => {
    expect(safeLLM).toBeDefined();
    expect(safeLLM.model).toBe('gpt-4o');
  });

  test('should validate input messages', () => {
    const validMessages = [
      { role: 'user', content: 'Hello' }
    ];
    const validation = safeLLM.validateInput(validMessages, {});
    expect(validation.valid).toBe(true);
  });

  test('should reject invalid messages format', () => {
    const invalidMessages = 'not an array';
    const validation = safeLLM.validateInput(invalidMessages, {});
    expect(validation.valid).toBe(false);
    expect(validation.error).toBeDefined();
  });

  test('should reject messages without role', () => {
    const invalidMessages = [
      { content: 'No role' }
    ];
    const validation = safeLLM.validateInput(invalidMessages, {});
    expect(validation.valid).toBe(false);
  });

  test('should reject messages with invalid role', () => {
    const invalidMessages = [
      { role: 'invalid', content: 'Test' }
    ];
    const validation = safeLLM.validateInput(invalidMessages, {});
    expect(validation.valid).toBe(false);
  });
});

