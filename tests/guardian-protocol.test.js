/**
 * Tests para Guardian Protocol
 */

const { guardianProtocol } = require('../orchestrator/guardian-protocol');

describe('Guardian Protocol', () => {
  beforeEach(() => {
    // Limpiar agentes de prueba
    guardianProtocol.unregisterAgent('test-agent');
  });

  test('should validate allowed operation', () => {
    guardianProtocol.registerAgent('test-agent', {
      role: 'test',
      permissions: ['read', 'write']
    });

    const result = guardianProtocol.validate('test-agent', 'read', {});
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('should reject unauthorized operation', () => {
    guardianProtocol.registerAgent('test-agent', {
      role: 'test',
      permissions: ['read']
    });

    const result = guardianProtocol.validate('test-agent', 'write', {});
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('should reject unregistered agent', () => {
    const result = guardianProtocol.validate('non-existent', 'read', {});
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not registered');
  });

  test('should get status', () => {
    const status = guardianProtocol.getStatus();
    expect(status).toHaveProperty('registeredAgents');
    expect(status).toHaveProperty('activeRules');
    expect(typeof status.registeredAgents).toBe('number');
  });
});

