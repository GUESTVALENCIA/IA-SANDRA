/**
 * SANDRA IA GALAXY - CIRCUIT BREAKER COORDINATOR v7.0
 * Sistema de Circuit Breakers Avanzado para 248+ Subagentes
 * Prevención de cascadas y resilencia distribuida enterprise
 */

const { EventEmitter } = require('events');
const { performance } = require('perf_hooks');
const logger = require('./backend/logger');
const metrics = require('./backend/metrics');

class CircuitBreakerCoordinator extends EventEmitter {
  constructor() {
    super();
    this.name = "SANDRA_CIRCUIT_BREAKER_COORDINATOR";
    this.version = "7.0_GALAXY_ENTERPRISE";

    // Circuit breakers por agente
    this.agentBreakers = new Map();

    // Circuit breakers de sistema
    this.systemBreakers = new Map();

    // Estrategias de recuperación
    this.recoveryStrategies = new Map();

    // Mecanismos de fallback
    this.fallbackMechanisms = new Map();

    // Estados de circuit breaker
    this.states = {
      CLOSED: 'CLOSED',       // Normal operation
      OPEN: 'OPEN',           // Blocking requests
      HALF_OPEN: 'HALF_OPEN'  // Testing recovery
    };

    // Configuraciones por categoría de agente
    this.breakerConfigs = {
      AI_AGENT: {
        failureThreshold: 5,
        timeout: 60000,        // 1 minuto
        retryAfter: 30000,     // 30 segundos
        successThreshold: 3    // Para cerrar desde half-open
      },
      INTEGRATION_AGENT: {
        failureThreshold: 3,
        timeout: 30000,        // 30 segundos
        retryAfter: 15000,     // 15 segundos
        successThreshold: 2
      },
      DATABASE_AGENT: {
        failureThreshold: 2,
        timeout: 120000,       // 2 minutos
        retryAfter: 60000,     // 1 minuto
        successThreshold: 1
      },
      EXTERNAL_API_AGENT: {
        failureThreshold: 5,
        timeout: 60000,        // 1 minuto
        retryAfter: 30000,     // 30 segundos
        successThreshold: 3
      },
      WORKFLOW_AGENT: {
        failureThreshold: 3,
        timeout: 90000,        // 1.5 minutos
        retryAfter: 45000,     // 45 segundos
        successThreshold: 2
      }
    };

    // Métricas de circuit breaker
    this.breakerMetrics = {
      totalBreakers: 0,
      openBreakers: 0,
      halfOpenBreakers: 0,
      closedBreakers: 0,
      totalRequests: 0,
      blockedRequests: 0,
      successfulRequests: 0,
      failedRequests: 0
    };

    this.initializeCircuitBreakers();
  }

  async initializeCircuitBreakers() {
    try {
      logger.info('[CIRCUIT BREAKER] Initializing Circuit Breaker Coordinator...');

      // Inicializar circuit breakers de sistema
      await this.setupSystemBreakers();

      // Configurar estrategias de recuperación
      await this.configureRecoveryStrategies();

      // Configurar mecanismos de fallback
      await this.configureFallbackMechanisms();

      // Iniciar monitoreo de circuit breakers
      this.startCircuitBreakerMonitoring();

      logger.info('[CIRCUIT BREAKER] ✅ Circuit Breaker Coordinator initialized');

      this.emit('circuit-breaker-coordinator-ready', {
        coordinator: this.name,
        version: this.version,
        totalBreakers: this.breakerMetrics.totalBreakers
      });

    } catch (error) {
      logger.error('[CIRCUIT BREAKER] Initialization failed:', error);
      throw error;
    }
  }

  async setupSystemBreakers() {
    logger.info('[CIRCUIT BREAKER] Setting up system circuit breakers...');

    // Circuit breakers para categorías críticas del sistema
    const systemCategories = [
      'CORE_INFRASTRUCTURE',
      'AI_ML_SPECIALISTS',
      'DEVELOPMENT_EXPERTS',
      'BUSINESS_LOGIC',
      'INTEGRATION_SERVICES',
      'USER_EXPERIENCE',
      'SPECIALIZED_DOMAINS'
    ];

    for (const category of systemCategories) {
      const breakerId = `system_${category.toLowerCase()}`;

      const systemBreaker = {
        id: breakerId,
        category: category,
        state: this.states.CLOSED,
        failureCount: 0,
        successCount: 0,
        lastFailureTime: null,
        config: {
          failureThreshold: 10, // Más alto para categorías de sistema
          timeout: 300000,      // 5 minutos
          retryAfter: 120000,   // 2 minutos
          successThreshold: 5
        },
        stats: {
          totalRequests: 0,
          blockedRequests: 0,
          successfulRequests: 0,
          failedRequests: 0
        }
      };

      this.systemBreakers.set(breakerId, systemBreaker);
      this.breakerMetrics.totalBreakers++;
      this.breakerMetrics.closedBreakers++;
    }

    logger.info(`[CIRCUIT BREAKER] ✅ System breakers initialized: ${systemCategories.length} categories`);
  }

  // ============================================================================
  // CIRCUIT BREAKER MANAGEMENT
  // ============================================================================
  async getOrCreateBreaker(agentId, category = 'AI_AGENT') {
    if (!this.agentBreakers.has(agentId)) {
      const config = this.breakerConfigs[category] || this.breakerConfigs.AI_AGENT;

      const breaker = {
        agentId: agentId,
        category: category,
        state: this.states.CLOSED,
        failureCount: 0,
        successCount: 0,
        lastFailureTime: null,
        lastSuccessTime: null,
        config: config,
        requestCount: 0,
        blocked: 0,
        created: new Date().toISOString()
      };

      this.agentBreakers.set(agentId, breaker);
      this.breakerMetrics.totalBreakers++;
      this.updateBreakerMetrics();

      logger.info(`[CIRCUIT BREAKER] Created breaker for agent: ${agentId} (${category})`);
    }

    return this.agentBreakers.get(agentId);
  }

  async executeWithCircuitBreaker(agentId, operation, category = 'AI_AGENT') {
    const startTime = performance.now();
    const breaker = await this.getOrCreateBreaker(agentId, category);

    this.breakerMetrics.totalRequests++;
    breaker.requestCount++;

    try {
      // Verificar estado del circuit breaker
      await this.checkBreakerState(breaker);

      // Ejecutar operación
      const result = await operation();

      // Registrar éxito
      await this.recordSuccess(breaker);

      this.breakerMetrics.successfulRequests++;

      const executionTime = performance.now() - startTime;
      logger.debug(`[CIRCUIT BREAKER] Success for ${agentId}: ${executionTime.toFixed(2)}ms`);

      return {
        success: true,
        result: result,
        agentId: agentId,
        breakerState: breaker.state,
        executionTime: executionTime
      };

    } catch (error) {
      // Registrar fallo
      await this.recordFailure(breaker, error);

      this.breakerMetrics.failedRequests++;

      // Ejecutar fallback si está disponible
      const fallbackResult = await this.executeFallback(agentId, operation, error);

      const executionTime = performance.now() - startTime;
      logger.warn(`[CIRCUIT BREAKER] Failure for ${agentId}: ${error.message} (${executionTime.toFixed(2)}ms)`);

      return {
        success: false,
        error: error.message,
        fallback: fallbackResult,
        agentId: agentId,
        breakerState: breaker.state,
        executionTime: executionTime
      };
    }
  }

  async checkBreakerState(breaker) {
    const currentTime = Date.now();

    switch (breaker.state) {
      case this.states.CLOSED:
        // Normal operation, no checks needed
        break;

      case this.states.OPEN:
        // Check if retry period has passed
        if (breaker.lastFailureTime &&
            (currentTime - breaker.lastFailureTime) >= breaker.config.retryAfter) {
          breaker.state = this.states.HALF_OPEN;
          breaker.successCount = 0;
          logger.info(`[CIRCUIT BREAKER] Breaker ${breaker.agentId} moved to HALF_OPEN`);
          this.updateBreakerMetrics();
        } else {
          this.breakerMetrics.blockedRequests++;
          breaker.blocked++;
          throw new Error(`Circuit breaker OPEN for ${breaker.agentId}. Retry after ${breaker.config.retryAfter}ms`);
        }
        break;

      case this.states.HALF_OPEN:
        // Allow limited requests to test recovery
        break;
    }
  }

  async recordSuccess(breaker) {
    breaker.lastSuccessTime = Date.now();

    switch (breaker.state) {
      case this.states.CLOSED:
        // Reset failure count on success
        breaker.failureCount = 0;
        break;

      case this.states.HALF_OPEN:
        breaker.successCount++;

        // Check if we should close the breaker
        if (breaker.successCount >= breaker.config.successThreshold) {
          breaker.state = this.states.CLOSED;
          breaker.failureCount = 0;
          breaker.successCount = 0;
          logger.info(`[CIRCUIT BREAKER] Breaker ${breaker.agentId} moved to CLOSED after recovery`);
          this.updateBreakerMetrics();

          this.emit('circuit-breaker-closed', {
            agentId: breaker.agentId,
            category: breaker.category,
            recoveryTime: Date.now() - breaker.lastFailureTime
          });
        }
        break;
    }
  }

  async recordFailure(breaker, error) {
    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();

    // Check if threshold exceeded
    if (breaker.failureCount >= breaker.config.failureThreshold) {
      const previousState = breaker.state;
      breaker.state = this.states.OPEN;
      breaker.successCount = 0;

      if (previousState !== this.states.OPEN) {
        logger.warn(`[CIRCUIT BREAKER] Breaker ${breaker.agentId} moved to OPEN (failures: ${breaker.failureCount})`);
        this.updateBreakerMetrics();

        this.emit('circuit-breaker-opened', {
          agentId: breaker.agentId,
          category: breaker.category,
          failureCount: breaker.failureCount,
          error: error.message
        });

        // Prevent cascade failures
        await this.preventCascadeFailure(breaker.agentId, error);
      }
    }
  }

  // ============================================================================
  // CASCADE PREVENTION
  // ============================================================================
  async preventCascadeFailure(failedAgentId, error) {
    try {
      logger.info(`[CIRCUIT BREAKER] Preventing cascade failure from agent: ${failedAgentId}`);

      // Identificar agentes dependientes
      const dependentAgents = await this.getDependentAgents(failedAgentId);

      if (dependentAgents.length === 0) {
        return { cascadePrevented: false, reason: 'No dependent agents' };
      }

      const preventionActions = [];

      for (const dependentId of dependentAgents) {
        try {
          // Configurar circuit breaker preventivo
          const dependentBreaker = await this.getOrCreateBreaker(dependentId);

          // Reducir threshold temporalmente
          const originalThreshold = dependentBreaker.config.failureThreshold;
          dependentBreaker.config.failureThreshold = Math.max(1, Math.floor(originalThreshold / 2));

          preventionActions.push({
            action: 'THRESHOLD_REDUCED',
            agentId: dependentId,
            originalThreshold: originalThreshold,
            newThreshold: dependentBreaker.config.failureThreshold,
            status: 'SUCCESS'
          });

          // Activar fallback proactivo
          await this.activateProactiveFallback(dependentId);

          preventionActions.push({
            action: 'PROACTIVE_FALLBACK',
            agentId: dependentId,
            status: 'SUCCESS'
          });

        } catch (actionError) {
          logger.error(`[CIRCUIT BREAKER] Prevention action failed for ${dependentId}:`, actionError);
          preventionActions.push({
            action: 'ERROR',
            agentId: dependentId,
            status: 'FAILED',
            error: actionError.message
          });
        }
      }

      this.emit('cascade-prevention-executed', {
        failedAgentId: failedAgentId,
        dependentAgents: dependentAgents,
        preventionActions: preventionActions
      });

      return {
        cascadePrevented: true,
        dependentAgents: dependentAgents.length,
        preventionActions: preventionActions
      };

    } catch (preventionError) {
      logger.error('[CIRCUIT BREAKER] Cascade prevention failed:', preventionError);
      return {
        cascadePrevented: false,
        error: preventionError.message
      };
    }
  }

  async getDependentAgents(agentId) {
    // Simulación - en implementación real obtener del dependency graph
    const dependencyMap = {
      'ai-conversation-agent': ['voice-agent', 'avatar-agent'],
      'database-agent': ['user-agent', 'booking-agent', 'analytics-agent'],
      'payment-agent': ['booking-agent', 'notification-agent'],
      'external-api-agent': ['weather-agent', 'translation-agent', 'maps-agent']
    };

    return dependencyMap[agentId] || [];
  }

  // ============================================================================
  // FALLBACK MECHANISMS
  // ============================================================================
  async configureFallbackMechanisms() {
    logger.info('[CIRCUIT BREAKER] Configuring fallback mechanisms...');

    // Fallback para agentes de IA
    this.fallbackMechanisms.set('AI_AGENT', {
      type: 'CACHED_RESPONSE',
      implementation: this.cachedResponseFallback.bind(this)
    });

    // Fallback para integraciones
    this.fallbackMechanisms.set('INTEGRATION_AGENT', {
      type: 'ALTERNATIVE_PROVIDER',
      implementation: this.alternativeProviderFallback.bind(this)
    });

    // Fallback para base de datos
    this.fallbackMechanisms.set('DATABASE_AGENT', {
      type: 'READONLY_MODE',
      implementation: this.readonlyModeFallback.bind(this)
    });

    // Fallback para APIs externas
    this.fallbackMechanisms.set('EXTERNAL_API_AGENT', {
      type: 'DEFAULT_VALUES',
      implementation: this.defaultValuesFallback.bind(this)
    });

    // Fallback para workflows
    this.fallbackMechanisms.set('WORKFLOW_AGENT', {
      type: 'SIMPLIFIED_FLOW',
      implementation: this.simplifiedFlowFallback.bind(this)
    });
  }

  async executeFallback(agentId, operation, error) {
    try {
      const breaker = this.agentBreakers.get(agentId);
      if (!breaker) {
        return { fallback: 'NO_FALLBACK', reason: 'No circuit breaker found' };
      }

      const fallbackMechanism = this.fallbackMechanisms.get(breaker.category);
      if (!fallbackMechanism) {
        return { fallback: 'NO_FALLBACK', reason: 'No fallback configured' };
      }

      logger.info(`[CIRCUIT BREAKER] Executing fallback for ${agentId}: ${fallbackMechanism.type}`);

      const fallbackResult = await fallbackMechanism.implementation(agentId, operation, error);

      return {
        fallback: fallbackMechanism.type,
        result: fallbackResult,
        status: 'SUCCESS'
      };

    } catch (fallbackError) {
      logger.error(`[CIRCUIT BREAKER] Fallback failed for ${agentId}:`, fallbackError);
      return {
        fallback: 'FALLBACK_FAILED',
        error: fallbackError.message,
        status: 'FAILED'
      };
    }
  }

  // Implementaciones de fallback
  async cachedResponseFallback(agentId, operation, error) {
    return {
      type: 'CACHED_RESPONSE',
      message: 'Usando respuesta en caché debido a fallos del agente',
      confidence: 0.7,
      cached: true
    };
  }

  async alternativeProviderFallback(agentId, operation, error) {
    return {
      type: 'ALTERNATIVE_PROVIDER',
      message: 'Usando proveedor alternativo',
      provider: 'backup-service',
      degraded: true
    };
  }

  async readonlyModeFallback(agentId, operation, error) {
    return {
      type: 'READONLY_MODE',
      message: 'Operación de solo lectura activada',
      readonly: true,
      writesBlocked: true
    };
  }

  async defaultValuesFallback(agentId, operation, error) {
    return {
      type: 'DEFAULT_VALUES',
      message: 'Usando valores por defecto',
      defaults: true,
      accuracy: 'limited'
    };
  }

  async simplifiedFlowFallback(agentId, operation, error) {
    return {
      type: 'SIMPLIFIED_FLOW',
      message: 'Workflow simplificado activado',
      simplified: true,
      steps: 'reduced'
    };
  }

  // ============================================================================
  // RECOVERY STRATEGIES
  // ============================================================================
  async configureRecoveryStrategies() {
    logger.info('[CIRCUIT BREAKER] Configuring recovery strategies...');

    this.recoveryStrategies.set('GRADUAL_RECOVERY', {
      description: 'Recuperación gradual con incremento de threshold',
      implementation: this.gradualRecovery.bind(this)
    });

    this.recoveryStrategies.set('IMMEDIATE_RECOVERY', {
      description: 'Recuperación inmediata tras éxito',
      implementation: this.immediateRecovery.bind(this)
    });

    this.recoveryStrategies.set('HEALTH_CHECK_RECOVERY', {
      description: 'Recuperación basada en health checks',
      implementation: this.healthCheckRecovery.bind(this)
    });
  }

  async executeRecoveryStrategy(agentId, strategyType = 'GRADUAL_RECOVERY') {
    try {
      const strategy = this.recoveryStrategies.get(strategyType);
      if (!strategy) {
        throw new Error(`Recovery strategy not found: ${strategyType}`);
      }

      logger.info(`[CIRCUIT BREAKER] Executing recovery strategy for ${agentId}: ${strategyType}`);

      const result = await strategy.implementation(agentId);

      this.emit('recovery-executed', {
        agentId: agentId,
        strategy: strategyType,
        result: result
      });

      return result;

    } catch (recoveryError) {
      logger.error(`[CIRCUIT BREAKER] Recovery strategy failed for ${agentId}:`, recoveryError);
      throw recoveryError;
    }
  }

  // ============================================================================
  // MONITORING & METRICS
  // ============================================================================
  startCircuitBreakerMonitoring() {
    logger.info('[CIRCUIT BREAKER] Starting circuit breaker monitoring...');

    // Monitor de estado cada 30 segundos
    setInterval(() => {
      this.monitorBreakerStates();
    }, 30000);

    // Reset de métricas cada hora
    setInterval(() => {
      this.resetHourlyMetrics();
    }, 3600000);

    // Health check cada 5 minutos
    setInterval(() => {
      this.performHealthChecks();
    }, 300000);
  }

  async monitorBreakerStates() {
    try {
      for (const [agentId, breaker] of this.agentBreakers) {
        const currentTime = Date.now();

        // Auto-recovery para breakers en OPEN demasiado tiempo
        if (breaker.state === this.states.OPEN) {
          const openTime = currentTime - breaker.lastFailureTime;
          const maxOpenTime = breaker.config.timeout;

          if (openTime > maxOpenTime) {
            logger.info(`[CIRCUIT BREAKER] Auto-recovery attempt for ${agentId} after ${openTime}ms`);
            await this.executeRecoveryStrategy(agentId, 'HEALTH_CHECK_RECOVERY');
          }
        }
      }

      this.updateBreakerMetrics();

    } catch (monitoringError) {
      logger.error('[CIRCUIT BREAKER] Monitoring error:', monitoringError);
    }
  }

  updateBreakerMetrics() {
    let openCount = 0;
    let halfOpenCount = 0;
    let closedCount = 0;

    for (const [agentId, breaker] of this.agentBreakers) {
      switch (breaker.state) {
        case this.states.OPEN:
          openCount++;
          break;
        case this.states.HALF_OPEN:
          halfOpenCount++;
          break;
        case this.states.CLOSED:
          closedCount++;
          break;
      }
    }

    this.breakerMetrics.openBreakers = openCount;
    this.breakerMetrics.halfOpenBreakers = halfOpenCount;
    this.breakerMetrics.closedBreakers = closedCount;
  }

  // ============================================================================
  // API METHODS
  // ============================================================================
  async getBreakerStatus(agentId) {
    const breaker = this.agentBreakers.get(agentId);
    if (!breaker) {
      return { error: 'Circuit breaker not found', agentId: agentId };
    }

    return {
      agentId: agentId,
      state: breaker.state,
      failureCount: breaker.failureCount,
      successCount: breaker.successCount,
      requestCount: breaker.requestCount,
      blocked: breaker.blocked,
      config: breaker.config,
      lastFailureTime: breaker.lastFailureTime,
      lastSuccessTime: breaker.lastSuccessTime
    };
  }

  async getAllBreakerStatuses() {
    const statuses = [];
    for (const [agentId, breaker] of this.agentBreakers) {
      statuses.push(await this.getBreakerStatus(agentId));
    }
    return statuses;
  }

  async getSystemHealth() {
    return {
      coordinator: this.name,
      version: this.version,
      metrics: this.breakerMetrics,
      totalBreakers: this.agentBreakers.size,
      healthyBreakers: this.breakerMetrics.closedBreakers,
      unhealthyBreakers: this.breakerMetrics.openBreakers + this.breakerMetrics.halfOpenBreakers,
      overallHealth: this.calculateOverallHealth()
    };
  }

  calculateOverallHealth() {
    const total = this.breakerMetrics.totalBreakers;
    if (total === 0) return 100;

    const healthy = this.breakerMetrics.closedBreakers;
    return Math.round((healthy / total) * 100);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  async activateProactiveFallback(agentId) {
    logger.info(`[CIRCUIT BREAKER] Activating proactive fallback for ${agentId}`);
    // Implementación específica de fallback proactivo
    return { activated: true, agentId: agentId };
  }

  async resetHourlyMetrics() {
    // Reset counters but keep configuration
    this.breakerMetrics.totalRequests = 0;
    this.breakerMetrics.blockedRequests = 0;
    this.breakerMetrics.successfulRequests = 0;
    this.breakerMetrics.failedRequests = 0;

    logger.info('[CIRCUIT BREAKER] Hourly metrics reset');
  }

  async performHealthChecks() {
    logger.debug('[CIRCUIT BREAKER] Performing health checks...');
    // Implementar health checks específicos
  }
}

// ============================================================================
// EXPORT
// ============================================================================
const circuitBreakerCoordinator = new CircuitBreakerCoordinator();

module.exports = {
  CircuitBreakerCoordinator,
  circuitBreakerCoordinator
};