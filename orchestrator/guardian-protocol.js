/**
 * Guardian Protocol - Sistema de Validación Multi-Agente
 * Protege y valida operaciones entre subagentes de Sandra
 */

class GuardianProtocol {
  constructor() {
    this.rules = new Map();
    this.agents = new Map();
    this.auditLog = [];
    this.maxAuditSize = 1000;
  }

  /**
   * Validar una operación de un agente
   * @param {string} agentId - ID del agente que realiza la operación
   * @param {string} operation - Tipo de operación
   * @param {Object} data - Datos de la operación
   * @returns {Object} Resultado de la validación
   */
  validate(agentId, operation, data = {}) {
    const validationId = `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();

    // Verificar que el agente esté registrado
    if (!this.agents.has(agentId)) {
      this.logAudit(validationId, agentId, operation, 'REJECTED', 'Agent not registered');
      return {
        valid: false,
        error: 'Agent not registered',
        validationId,
        timestamp
      };
    }

    const agent = this.agents.get(agentId);

    // Verificar permisos del agente
    if (!agent.permissions.includes(operation)) {
      this.logAudit(validationId, agentId, operation, 'REJECTED', 'Operation not permitted');
      return {
        valid: false,
        error: 'Operation not permitted for this agent',
        validationId,
        timestamp
      };
    }

    // Verificar reglas específicas si existen
    if (this.rules.has(operation)) {
      const rule = this.rules.get(operation);
      try {
        const ruleResult = rule(data, agent);
        if (!ruleResult.valid) {
          this.logAudit(validationId, agentId, operation, 'REJECTED', ruleResult.reason);
          return {
            valid: false,
            error: ruleResult.reason,
            validationId,
            timestamp
          };
        }
      } catch (error) {
        this.logAudit(validationId, agentId, operation, 'ERROR', error.message);
        return {
          valid: false,
          error: `Validation rule error: ${error.message}`,
          validationId,
          timestamp
        };
      }
    }

    // Validación exitosa
    this.logAudit(validationId, agentId, operation, 'APPROVED', null);
    return {
      valid: true,
      validationId,
      timestamp,
      agent: {
        id: agentId,
        role: agent.role,
        permissions: agent.permissions
      }
    };
  }

  /**
   * Registrar un agente en el sistema
   * @param {string} agentId - ID único del agente
   * @param {Object} config - Configuración del agente
   */
  registerAgent(agentId, config) {
    const agentConfig = {
      id: agentId,
      role: config.role || 'unknown',
      permissions: config.permissions || [],
      metadata: config.metadata || {},
      registeredAt: Date.now(),
      ...config
    };

    this.agents.set(agentId, agentConfig);
    console.log(`[GUARDIAN] Agent registered: ${agentId} (${agentConfig.role})`);
  }

  /**
   * Agregar una regla de validación personalizada
   * @param {string} operation - Tipo de operación
   * @param {Function} ruleFunction - Función de validación (data, agent) => {valid, reason}
   */
  addRule(operation, ruleFunction) {
    if (typeof ruleFunction !== 'function') {
      throw new Error('Rule must be a function');
    }
    this.rules.set(operation, ruleFunction);
    console.log(`[GUARDIAN] Rule added for operation: ${operation}`);
  }

  /**
   * Registrar evento en el log de auditoría
   */
  logAudit(validationId, agentId, operation, status, reason) {
    const auditEntry = {
      validationId,
      agentId,
      operation,
      status,
      reason,
      timestamp: Date.now()
    };

    this.auditLog.push(auditEntry);

    // Mantener el log dentro del límite
    if (this.auditLog.length > this.maxAuditSize) {
      this.auditLog.shift();
    }

    // Log solo para debugging
    if (status !== 'APPROVED') {
      console.log(`[GUARDIAN] ${status}: ${agentId} -> ${operation} - ${reason || 'OK'}`);
    }
  }

  /**
   * Obtener estado del protocolo
   */
  getStatus() {
    return {
      registeredAgents: this.agents.size,
      activeRules: this.rules.size,
      auditLogSize: this.auditLog.length,
      timestamp: Date.now()
    };
  }

  /**
   * Obtener log de auditoría
   * @param {number} limit - Número máximo de entradas
   */
  getAuditLog(limit = 100) {
    return this.auditLog.slice(-limit);
  }

  /**
   * Limpiar registro de un agente
   */
  unregisterAgent(agentId) {
    if (this.agents.has(agentId)) {
      this.agents.delete(agentId);
      console.log(`[GUARDIAN] Agent unregistered: ${agentId}`);
      return true;
    }
    return false;
  }
}

// Exportar instancia singleton
const guardianProtocol = new GuardianProtocol();

// Registrar agentes base de Sandra
guardianProtocol.registerAgent('sandra-nucleus', {
  role: 'nucleus',
  permissions: ['read', 'write', 'execute', 'memory', 'multimodal']
});

guardianProtocol.registerAgent('sandra-orchestrator', {
  role: 'orchestrator',
  permissions: ['read', 'write', 'execute', 'coordinate', 'metrics']
});

// Reglas por defecto
guardianProtocol.addRule('memory_write', (data, agent) => {
  if (data.size > 10 * 1024 * 1024) { // 10MB
    return { valid: false, reason: 'Memory write exceeds size limit' };
  }
  return { valid: true };
});

guardianProtocol.addRule('execute', (data, agent) => {
  if (data.command && data.command.includes('rm -rf')) {
    return { valid: false, reason: 'Dangerous command blocked' };
  }
  return { valid: true };
});

module.exports = { GuardianProtocol, guardianProtocol };

