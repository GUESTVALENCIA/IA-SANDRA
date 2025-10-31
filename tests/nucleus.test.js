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

  test('should have brain module', () => {
    expect(SandraNucleus.brain).toBeDefined();
    expect(typeof SandraNucleus.brain.processMessage).toBe('function');
  });

  test('should have config with API keys', () => {
    expect(SandraNucleus.config).toBeDefined();
    expect(SandraNucleus.config.api).toBeDefined();
    expect(SandraNucleus.config.server).toBeDefined();
  });

  test('should detect intent from message', async () => {
    const intent = await SandraNucleus.brain.detectIntent('Hola, necesito ayuda');
    expect(intent).toBeDefined();
    expect(intent.intent).toBeDefined();
  });

  test('should have multimodal capabilities', () => {
    expect(SandraNucleus.multimodal).toBeDefined();
    expect(typeof SandraNucleus.multimodal.textToSpeech).toBe('function');
    expect(typeof SandraNucleus.multimodal.speechToText).toBe('function');
  });

  test('should have server configuration', () => {
    expect(SandraNucleus.server).toBeDefined();
    expect(SandraNucleus.server.app).toBeNull(); // Antes de inicializar
    expect(typeof SandraNucleus.server.initializeExpress).toBe('function');
  });

  test('should have guardian protocol', () => {
    expect(SandraNucleus.guardian).toBeDefined();
    expect(typeof SandraNucleus.guardian.validate).toBe('function');
  });
});

