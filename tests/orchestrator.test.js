/**
 * Tests básicos para el Orquestador de Sandra
 */

const { SandraOrchestrator } = require('../orchestrator/sandra-orchestrator');

describe('Sandra Orchestrator', () => {
  let orchestrator;

  beforeAll(async () => {
    orchestrator = new SandraOrchestrator();
    // No inicializamos completamente para evitar dependencias externas en tests
  });

  afterAll(() => {
    if (orchestrator && orchestrator.shutdown) {
      orchestrator.shutdown();
    }
  });

  test('should create orchestrator instance', () => {
    expect(orchestrator).toBeDefined();
    expect(orchestrator.services).toBeDefined();
    expect(orchestrator.circuitBreakers).toBeDefined();
  });

  test('should have metrics collector', () => {
    expect(orchestrator.metrics).toBeDefined();
    expect(typeof orchestrator.metrics.recordRequest).toBe('function');
  });

  test('should track conversation history', () => {
    const initialLength = orchestrator.conversationHistory.length;
    orchestrator.conversationHistory.push({
      role: 'user',
      message: 'Test message',
      timestamp: Date.now()
    });
    expect(orchestrator.conversationHistory.length).toBe(initialLength + 1);
  });
});

