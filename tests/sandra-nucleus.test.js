/**
 * Tests para Sandra Nucleus Core
 */

const SandraNucleus = require('../orchestrator/sandra-nucleus-core');

describe('Sandra Nucleus Core', () => {
  test('should have version and mode', () => {
    expect(SandraNucleus.version).toBeDefined();
    expect(SandraNucleus.mode).toBeDefined();
    expect(typeof SandraNucleus.version).toBe('string');
  });

  test('should have config object', () => {
    expect(SandraNucleus.config).toBeDefined();
    expect(SandraNucleus.config.api).toBeDefined();
    expect(SandraNucleus.config.server).toBeDefined();
  });

  test('should have brain module', () => {
    expect(SandraNucleus.brain).toBeDefined();
    expect(typeof SandraNucleus.brain.processMessage).toBe('function');
    expect(typeof SandraNucleus.brain.detectIntent).toBe('function');
    expect(typeof SandraNucleus.brain.generateResponse).toBe('function');
  });

  test('should have multimodal module', () => {
    expect(SandraNucleus.multimodal).toBeDefined();
    expect(typeof SandraNucleus.multimodal.textToSpeech).toBe('function');
    expect(typeof SandraNucleus.multimodal.speechToText).toBe('function');
  });

  test('should have subagents module', () => {
    expect(SandraNucleus.subagents).toBeDefined();
    expect(typeof SandraNucleus.subagents.getStatus).toBe('function');
  });

  test('should have guardian protocol', () => {
    expect(SandraNucleus.guardian).toBeDefined();
    expect(typeof SandraNucleus.guardian.validate).toBe('function');
  });

  test('should detect intent', async () => {
    const intent = await SandraNucleus.brain.detectIntent('Hola, quiero reservar', {});
    expect(intent).toBeDefined();
    expect(intent.intent).toBeDefined();
  });

  test('should have memory functions', async () => {
    const sessionId = 'test-session';
    const memory = await SandraNucleus.brain.getMemory(sessionId);
    expect(Array.isArray(memory)).toBe(true);
  });
});

