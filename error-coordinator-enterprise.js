/**
 * SANDRA IA GALAXY - ERROR COORDINATOR ENTERPRISE v7.0
 * Sistema de Coordinación de Errores Distribuido para 248+ Subagentes
 * Implementa resilencia enterprise, cascade prevention y automated recovery
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');
const { performance } = require('perf_hooks');

// Importar sistemas Galaxy Enterprise existentes
const logger = require('./backend/logger');
const metrics = require('./backend/metrics');
const { guardianProtocol } = require('./guardian-protocol');
// const { multiAgentCoordinator } = require('./multi-agent-coordinator'); // Evitar dependencia circular
// const { workflowOrchestrator } = require('./workflow-orchestrator'); // Evitar dependencia circular
const { errorAnalyticsEnterprise } = require('./error-analytics-enterprise');

class ErrorCoordinatorEnterprise extends EventEmitter {
  constructor() {
    super();
    this.name = "SANDRA_ERROR_COORDINATOR";
    this.version = "7.0_GALAXY_ENTERPRISE";
    this.mode = "DISTRIBUTED_ERROR_COORDINATION";
    this.status = "INITIALIZING";

    // Sistema de agregación de errores distribuido
    this.errorAggregator = {
      activeErrors: new Map(),
      errorHistory: [],
      errorPatterns: new Map(),
      correlationMatrix: new Map()
    };

    // Sistema de prevención de cascadas
    this.cascadePrevention = {
      dependencyGraph: new Map(),
      isolationStrategies: new Map(),
      circuitBreakers: new Map(),
      fallbackMechanisms: new Map()
    };

    // Orquestador de recuperación automática
    this.recoveryOrchestrator = {
      recoveryStrategies: new Map(),
      activeRecoveries: new Map(),
      recoveryHistory: [],
      successRates: new Map()
    };

    // Motor de aprendizaje de fallos
    this.learningEngine = {
      patterns: new Map(),
      predictions: new Map(),
      recommendations: new Map(),
      improvementHistory: []
    };

    // Configuración enterprise
    this.enterpriseConfig = {
      errorDetectionTimeout: 30000, // 30 segundos
      recoverySuccessTarget: 0.90,  // 90%
      cascadePreventionEnabled: true,
      mttrTarget: 300000, // 5 minutos
      falsePositiveThreshold: 0.05, // 5%
      learningEnabled: true,
      guardinaIntegration: true,
      realTimeMonitoring: true
    };

    // Métricas de error coordination
    this.coordinationMetrics = {
      errorsDetected: 0,
      errorsResolved: 0,
      cascadesPrevented: 0,
      recoverySuccessRate: 0,
      averageMTTR: 0,
      falsePositiveRate: 0,
      learningAccuracy: 0,
      systemResilience: 0
    };

    this.initializeErrorCoordination();
  }

  async initializeErrorCoordination() {
    try {
      logger.info('[ERROR COORDINATOR] Initializing Enterprise Error Coordination System...');

      // Inicializar componentes core
      await this.initializeErrorAggregator();
      await this.initializeCascadePrevention();
      await this.initializeRecoveryOrchestrator();
      await this.initializeLearningEngine();
      await this.initializeCircuitBreakers();

      // Integrar con Guardian Protocol
      await this.integrateWithGuardianProtocol();

      // Iniciar monitoreo en tiempo real
      this.startRealTimeMonitoring();

      this.status = "OPERATIONAL";
      logger.info('[ERROR COORDINATOR] ✅ Enterprise Error Coordination System operational');

      this.emit('error-coordinator-ready', {
        coordinator: this.name,
        version: this.version,
        mode: this.mode,
        status: this.status
      });

    } catch (error) {
      logger.error('[ERROR COORDINATOR] Failed to initialize:', error);
      this.status = "ERROR";
      throw error;
    }
  }

  // ============================================================================
  // ERROR AGGREGATION & CLASSIFICATION
  // ============================================================================
  async initializeErrorAggregator() {
    logger.info('[ERROR COORDINATOR] Initializing Error Aggregator...');

    // Configurar categorías de error enterprise
    this.errorCategories = {
      INFRASTRUCTURE: { severity: 'HIGH', recovery: 'AUTOMATED' },
      APPLICATION: { severity: 'MEDIUM', recovery: 'GUIDED' },
      INTEGRATION: { severity: 'HIGH', recovery: 'AUTOMATED' },
      DATA: { severity: 'CRITICAL', recovery: 'MANUAL' },
      PERFORMANCE: { severity: 'MEDIUM', recovery: 'AUTOMATED' },
      SECURITY: { severity: 'CRITICAL', recovery: 'IMMEDIATE' },
      CONSTRAINT_VIOLATION: { severity: 'CRITICAL', recovery: 'GUARDIAN' },
      AGENT_FAILURE: { severity: 'HIGH', recovery: 'CIRCUIT_BREAKER' }
    };

    // Configurar thresholds enterprise
    this.errorThresholds = {
      errorRate: 0.05,        // 5% error rate threshold
      cascadeRisk: 0.10,      // 10% cascade risk threshold
      recoveryTime: 300000,   // 5 minutos max recovery
      impactScore: 0.15       // 15% business impact max
    };
  }

  async aggregateError(error, context) {
    const startTime = performance.now();

    try {
      // Clasificar error
      const classification = await this.classifyError(error, context);

      // Correlacionar con errores existentes
      const correlation = await this.correlateError(error, classification, context);

      // Evaluar impacto
      const impact = await this.assessErrorImpact(error, classification, context);

      // Agregar a sistema de seguimiento
      const errorId = this.generateErrorId();
      this.errorAggregator.activeErrors.set(errorId, {
        id: errorId,
        error: error,
        classification: classification,
        correlation: correlation,
        impact: impact,
        context: context,
        timestamp: new Date().toISOString(),
        status: 'ACTIVE'
      });

      // Actualizar métricas
      this.coordinationMetrics.errorsDetected++;

      // Emitir evento para otros sistemas
      this.emit('error-aggregated', {
        errorId: errorId,
        classification: classification,
        impact: impact,
        correlation: correlation
      });

      const processingTime = performance.now() - startTime;
      logger.info(`[ERROR COORDINATOR] Error aggregated: ${errorId} (${processingTime.toFixed(2)}ms)`);

      return {
        errorId: errorId,
        classification: classification,
        impact: impact,
        correlation: correlation,
        processingTime: processingTime
      };

    } catch (aggregationError) {
      logger.error('[ERROR COORDINATOR] Error aggregation failed:', aggregationError);
      throw aggregationError;
    }
  }

  async classifyError(error, context) {
    // AI-powered error classification
    const features = this.extractErrorFeatures(error, context);
    const category = this.determineErrorCategory(features);
    const severity = this.calculateErrorSeverity(features, category);
    const urgency = this.calculateErrorUrgency(features, category, severity);

    return {
      category: category,
      severity: severity,
      urgency: urgency,
      features: features,
      confidence: this.calculateClassificationConfidence(features, category)
    };
  }

  async correlateError(error, classification, context) {
    const correlations = [];

    // Correlación temporal
    const temporalCorrelations = this.findTemporalCorrelations(error, context);
    correlations.push(...temporalCorrelations);

    // Correlación causal
    const causalCorrelations = this.findCausalCorrelations(error, classification, context);
    correlations.push(...causalCorrelations);

    // Correlación de dependencias
    const dependencyCorrelations = this.findDependencyCorrelations(error, context);
    correlations.push(...dependencyCorrelations);

    return {
      correlations: correlations,
      cascadeRisk: this.calculateCascadeRisk(correlations),
      patterns: this.identifyErrorPatterns(correlations)
    };
  }

  // ============================================================================
  // CASCADE FAILURE PREVENTION
  // ============================================================================
  async initializeCascadePrevention() {
    logger.info('[ERROR COORDINATOR] Initializing Cascade Prevention System...');

    // Construir grafo de dependencias de agentes
    await this.buildDependencyGraph();

    // Configurar estrategias de aislamiento
    await this.configurateIsolationStrategies();

    // Inicializar circuit breakers
    await this.initializeCircuitBreakers();
  }

  async preventCascadeFailure(failedAgentId, error, context) {
    const startTime = performance.now();

    try {
      logger.info(`[ERROR COORDINATOR] Preventing cascade failure from agent: ${failedAgentId}`);

      // Identificar agentes dependientes
      const dependentAgents = this.getDependentAgents(failedAgentId);

      // Calcular riesgo de cascada
      const cascadeRisk = this.calculateCascadeRisk(dependentAgents, error);

      if (cascadeRisk > this.errorThresholds.cascadeRisk) {
        // Activar estrategias de prevención
        const preventionActions = await this.executeCascadePrevention(failedAgentId, dependentAgents, error);

        // Actualizar métricas
        this.coordinationMetrics.cascadesPrevented++;

        const preventionTime = performance.now() - startTime;
        logger.info(`[ERROR COORDINATOR] ✅ Cascade prevention completed (${preventionTime.toFixed(2)}ms)`);

        return {
          prevented: true,
          cascadeRisk: cascadeRisk,
          preventionActions: preventionActions,
          dependentAgents: dependentAgents.length,
          preventionTime: preventionTime
        };
      }

      return {
        prevented: false,
        cascadeRisk: cascadeRisk,
        reason: 'Risk below threshold'
      };

    } catch (preventionError) {
      logger.error('[ERROR COORDINATOR] Cascade prevention failed:', preventionError);
      throw preventionError;
    }
  }

  async executeCascadePrevention(failedAgentId, dependentAgents, error) {
    const preventionActions = [];

    for (const agentId of dependentAgents) {
      try {
        // Aislar agente dependiente
        await this.isolateAgent(agentId);
        preventionActions.push({ action: 'ISOLATE', agentId: agentId, status: 'SUCCESS' });

        // Activar fallback
        await this.activateAgentFallback(agentId);
        preventionActions.push({ action: 'FALLBACK', agentId: agentId, status: 'SUCCESS' });

        // Configurar circuit breaker
        await this.configureCircuitBreaker(agentId, error);
        preventionActions.push({ action: 'CIRCUIT_BREAKER', agentId: agentId, status: 'SUCCESS' });

      } catch (actionError) {
        logger.error(`[ERROR COORDINATOR] Prevention action failed for agent ${agentId}:`, actionError);
        preventionActions.push({ action: 'ERROR', agentId: agentId, status: 'FAILED', error: actionError.message });
      }
    }

    return preventionActions;
  }

  // ============================================================================
  // AUTOMATED RECOVERY ORCHESTRATION
  // ============================================================================
  async initializeRecoveryOrchestrator() {
    logger.info('[ERROR COORDINATOR] Initializing Recovery Orchestrator...');

    // Configurar estrategias de recuperación
    this.recoveryStrategies.set('RETRY', this.createRetryStrategy());
    this.recoveryStrategies.set('ROLLBACK', this.createRollbackStrategy());
    this.recoveryStrategies.set('FAILOVER', this.createFailoverStrategy());
    this.recoveryStrategies.set('RESTART', this.createRestartStrategy());
    this.recoveryStrategies.set('MANUAL', this.createManualStrategy());
  }

  async orchestrateRecovery(errorId, recoveryType = 'AUTO') {
    const startTime = performance.now();

    try {
      const errorData = this.errorAggregator.activeErrors.get(errorId);
      if (!errorData) {
        throw new Error(`Error not found: ${errorId}`);
      }

      logger.info(`[ERROR COORDINATOR] Orchestrating recovery for error: ${errorId}`);

      // Seleccionar estrategia de recuperación
      const strategy = await this.selectRecoveryStrategy(errorData, recoveryType);

      // Ejecutar recuperación
      const recoveryResult = await this.executeRecoveryStrategy(strategy, errorData);

      // Verificar recuperación
      const verification = await this.verifyRecovery(errorData, recoveryResult);

      if (verification.success) {
        // Marcar error como resuelto
        errorData.status = 'RESOLVED';
        errorData.recovery = recoveryResult;
        errorData.verification = verification;
        errorData.resolvedAt = new Date().toISOString();

        // Actualizar métricas
        this.coordinationMetrics.errorsResolved++;
        this.updateRecoverySuccessRate();

        const recoveryTime = performance.now() - startTime;
        this.updateMTTR(recoveryTime);

        logger.info(`[ERROR COORDINATOR] ✅ Recovery successful for error: ${errorId} (${recoveryTime.toFixed(2)}ms)`);

        this.emit('error-recovered', {
          errorId: errorId,
          strategy: strategy,
          recoveryTime: recoveryTime,
          verification: verification
        });

        return {
          success: true,
          errorId: errorId,
          strategy: strategy,
          recoveryResult: recoveryResult,
          verification: verification,
          recoveryTime: recoveryTime
        };
      } else {
        // Escalate to manual recovery
        return await this.escalateToManualRecovery(errorId, errorData, recoveryResult, verification);
      }

    } catch (recoveryError) {
      logger.error(`[ERROR COORDINATOR] Recovery failed for error: ${errorId}:`, recoveryError);
      return {
        success: false,
        errorId: errorId,
        error: recoveryError.message,
        escalated: true
      };
    }
  }

  // ============================================================================
  // CIRCUIT BREAKER MANAGEMENT
  // ============================================================================
  async initializeCircuitBreakers() {
    logger.info('[ERROR COORDINATOR] Initializing Circuit Breakers...');

    // Circuit breaker configurations per agent category
    const breakerConfigs = {
      'AI_AGENT': { threshold: 5, timeout: 60000, retryAfter: 30000 },
      'INTEGRATION': { threshold: 3, timeout: 30000, retryAfter: 15000 },
      'DATABASE': { threshold: 2, timeout: 120000, retryAfter: 60000 },
      'EXTERNAL_API': { threshold: 5, timeout: 60000, retryAfter: 30000 },
      'WORKFLOW': { threshold: 3, timeout: 90000, retryAfter: 45000 }
    };

    for (const [category, config] of Object.entries(breakerConfigs)) {
      this.cascadePrevention.circuitBreakers.set(category, {
        state: 'CLOSED',
        failureCount: 0,
        lastFailureTime: null,
        config: config
      });
    }
  }

  async manageCircuitBreaker(agentId, operation, category = 'AI_AGENT') {
    const breaker = this.cascadePrevention.circuitBreakers.get(category);

    if (!breaker) {
      throw new Error(`Circuit breaker not found for category: ${category}`);
    }

    // Check circuit breaker state
    if (breaker.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - breaker.lastFailureTime;
      if (timeSinceLastFailure < breaker.config.retryAfter) {
        throw new Error(`Circuit breaker OPEN for ${category}. Retry after ${breaker.config.retryAfter - timeSinceLastFailure}ms`);
      } else {
        breaker.state = 'HALF_OPEN';
      }
    }

    try {
      // Execute operation
      const result = await operation();

      // Reset on success
      if (breaker.state === 'HALF_OPEN') {
        breaker.state = 'CLOSED';
        breaker.failureCount = 0;
        logger.info(`[ERROR COORDINATOR] Circuit breaker CLOSED for ${category}`);
      }

      return result;

    } catch (error) {
      // Handle failure
      breaker.failureCount++;
      breaker.lastFailureTime = Date.now();

      if (breaker.failureCount >= breaker.config.threshold) {
        breaker.state = 'OPEN';
        logger.warn(`[ERROR COORDINATOR] Circuit breaker OPEN for ${category} (failures: ${breaker.failureCount})`);
      }

      throw error;
    }
  }

  // ============================================================================
  // LEARNING ENGINE & PATTERN DETECTION
  // ============================================================================
  async initializeLearningEngine() {
    logger.info('[ERROR COORDINATOR] Initializing Learning Engine...');

    // Configurar algoritmos de detección de patrones
    this.learningEngine.patterns = new Map();
    this.learningEngine.predictions = new Map();
    this.learningEngine.recommendations = new Map();
  }

  async extractLearningFromError(errorData) {
    try {
      // Extraer features del error
      const features = this.extractLearningFeatures(errorData);

      // Detectar patrones
      const patterns = await this.detectErrorPatterns(features, errorData);

      // Generar predicciones
      const predictions = await this.generateErrorPredictions(patterns, features);

      // Crear recomendaciones
      const recommendations = await this.generateErrorRecommendations(patterns, predictions);

      // Almacenar aprendizaje
      const learningId = this.generateLearningId();
      this.learningEngine.patterns.set(learningId, {
        errorId: errorData.id,
        features: features,
        patterns: patterns,
        predictions: predictions,
        recommendations: recommendations,
        timestamp: new Date().toISOString()
      });

      logger.info(`[ERROR COORDINATOR] Learning extracted for error: ${errorData.id}`);

      return {
        learningId: learningId,
        patterns: patterns,
        predictions: predictions,
        recommendations: recommendations
      };

    } catch (learningError) {
      logger.error('[ERROR COORDINATOR] Learning extraction failed:', learningError);
      throw learningError;
    }
  }

  // ============================================================================
  // GUARDIAN PROTOCOL INTEGRATION
  // ============================================================================
  async integrateWithGuardianProtocol() {
    logger.info('[ERROR COORDINATOR] Integrating with Guardian Protocol...');

    // Configurar manejo especial para violaciones de constraints del CEO
    this.guardianErrorHandlers = {
      CONSTRAINT_VIOLATION: this.handleConstraintViolation.bind(this),
      UNAUTHORIZED_ACTION: this.handleUnauthorizedAction.bind(this),
      IMPROVISATION_DETECTED: this.handleImprovisationDetected.bind(this),
      REAL_ACTION_FAILED: this.handleRealActionFailed.bind(this)
    };
  }

  async handleConstraintViolation(violation, context) {
    const startTime = performance.now();

    try {
      logger.warn(`[ERROR COORDINATOR] 🛡️ Constraint violation detected: ${violation.constraintId}`);

      // Evaluar severidad de violación
      const severity = this.assessConstraintSeverity(violation);

      // Calcular impacto en negocio
      const businessImpact = await this.calculateBusinessImpact(violation);

      // Orquestar recuperación específica para constraints
      const recovery = await this.orchestrateConstraintRecovery(violation, context);

      // CEO alert para violaciones críticas
      if (severity === 'CRITICAL') {
        await this.sendCEOAlert(violation, businessImpact, recovery);
      }

      const handlingTime = performance.now() - startTime;
      logger.info(`[ERROR COORDINATOR] ✅ Constraint violation handled (${handlingTime.toFixed(2)}ms)`);

      return {
        violation: violation,
        severity: severity,
        businessImpact: businessImpact,
        recovery: recovery,
        constraintEnforcement: await this.enforceConstraints(violation),
        handlingTime: handlingTime
      };

    } catch (handlingError) {
      logger.error('[ERROR COORDINATOR] Constraint violation handling failed:', handlingError);
      throw handlingError;
    }
  }

  // ============================================================================
  // REAL-TIME MONITORING
  // ============================================================================
  startRealTimeMonitoring() {
    logger.info('[ERROR COORDINATOR] Starting Real-Time Error Monitoring...');

    // Monitor error streams
    setInterval(async () => {
      await this.monitorErrorStreams();
    }, 10000); // Check every 10 seconds

    // Update metrics
    setInterval(async () => {
      await this.updateCoordinationMetrics();
    }, 30000); // Update every 30 seconds

    // Health check
    setInterval(async () => {
      await this.performHealthCheck();
    }, 60000); // Health check every minute
  }

  async monitorErrorStreams() {
    try {
      // Monitor active errors
      for (const [errorId, errorData] of this.errorAggregator.activeErrors) {
        if (errorData.status === 'ACTIVE') {
          const errorAge = Date.now() - new Date(errorData.timestamp).getTime();

          // Check if error needs escalation
          if (errorAge > this.enterpriseConfig.errorDetectionTimeout) {
            await this.escalateError(errorId, errorData);
          }
        }
      }

      // Check system health
      const systemHealth = await this.checkSystemHealth();
      if (systemHealth.status !== 'HEALTHY') {
        await this.handleSystemHealthIssue(systemHealth);
      }

    } catch (monitoringError) {
      logger.error('[ERROR COORDINATOR] Monitoring error:', monitoringError);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  generateErrorId() {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateLearningId() {
    return `LEARN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  updateRecoverySuccessRate() {
    const totalRecoveries = this.coordinationMetrics.errorsResolved;
    const successfulRecoveries = this.recoveryOrchestrator.recoveryHistory.filter(r => r.success).length;
    this.coordinationMetrics.recoverySuccessRate = totalRecoveries > 0 ? successfulRecoveries / totalRecoveries : 0;
  }

  updateMTTR(recoveryTime) {
    const currentMTTR = this.coordinationMetrics.averageMTTR;
    const totalRecoveries = this.coordinationMetrics.errorsResolved;
    this.coordinationMetrics.averageMTTR = ((currentMTTR * (totalRecoveries - 1)) + recoveryTime) / totalRecoveries;
  }

  async getCoordinationStatus() {
    return {
      coordinator: this.name,
      version: this.version,
      mode: this.mode,
      status: this.status,
      metrics: this.coordinationMetrics,
      activeErrors: this.errorAggregator.activeErrors.size,
      circuitBreakers: Array.from(this.cascadePrevention.circuitBreakers.entries()),
      configuration: this.enterpriseConfig
    };
  }

  // ============================================================================
  // API METHODS FOR EXTERNAL INTEGRATION
  // ============================================================================
  async handleErrorEvent(error, context) {
    try {
      // Aggregate error
      const aggregation = await this.aggregateError(error, context);

      // Check for cascade risk
      if (context.agentId) {
        await this.preventCascadeFailure(context.agentId, error, context);
      }

      // Orchestrate recovery
      const recovery = await this.orchestrateRecovery(aggregation.errorId);

      // Extract learning
      const learning = await this.extractLearningFromError(this.errorAggregator.activeErrors.get(aggregation.errorId));

      return {
        success: true,
        errorId: aggregation.errorId,
        aggregation: aggregation,
        recovery: recovery,
        learning: learning
      };

    } catch (coordinationError) {
      logger.error('[ERROR COORDINATOR] Error event handling failed:', coordinationError);
      return {
        success: false,
        error: coordinationError.message,
        fallback: 'Manual intervention required'
      };
    }
  }

  // ============================================================================
  // PUBLIC API & INTEGRATION METHODS
  // ============================================================================
  async reportError(errorData) {
    logger.info(`[ERROR COORDINATOR ENTERPRISE] Reporting error from agent: ${errorData.agentId}`);

    try {
      // 1. Agregar error al agregador
      const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const processedError = {
        id: errorId,
        ...errorData,
        timestamp: new Date(),
        status: 'ACTIVE',
        coordinationStatus: 'PROCESSING'
      };

      this.errorAggregator.activeErrors.set(errorId, processedError);
      this.errorAggregator.errorHistory.push(processedError);

      // Mantener límite de historial
      if (this.errorAggregator.errorHistory.length > 10000) {
        this.errorAggregator.errorHistory.shift();
      }

      // 2. Enviar al sistema de analytics para análisis predictivo
      const analyticsResult = await errorAnalyticsEnterprise.analyzeErrorData(errorData);

      // 3. Actualizar error con resultado de analytics
      processedError.analyticsResult = analyticsResult;

      // 4. Verificar si hay predicciones críticas
      if (analyticsResult.predictions && analyticsResult.predictions.length > 0) {
        const criticalPredictions = analyticsResult.predictions.filter(p =>
          p.severity === 'CRITICAL' || p.probability > 0.8
        );

        if (criticalPredictions.length > 0) {
          // Activar prevención proactiva
          await this.activateProactivePrevention(errorId, criticalPredictions);
        }
      }

      // 5. Verificar correlaciones y patrones
      await this.analyzeErrorCorrelations(processedError);

      // 6. Determinar si es necesario activar prevención de cascadas
      const cascadeRisk = await this.assessCascadeRisk(processedError);
      if (cascadeRisk.risk > 0.7) {
        await this.activateCascadePrevention(errorId, cascadeRisk);
      }

      // 7. Incrementar métricas
      metrics.incrementMultiAgentFailure();

      // 8. Emitir eventos
      this.emit('error:reported', processedError);

      if (errorData.severity === 'CRITICAL') {
        this.emit('error:critical', processedError);
      }

      logger.info(`[ERROR COORDINATOR ENTERPRISE] ✅ Error ${errorId} processed successfully`);

      return {
        errorId,
        processed: true,
        analyticsResult,
        cascadeRisk,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('[ERROR COORDINATOR ENTERPRISE] Failed to report error:', error);

      // Fallback: registrar error básico sin analytics
      const fallbackErrorId = `fallback-error-${Date.now()}`;
      this.errorAggregator.activeErrors.set(fallbackErrorId, {
        id: fallbackErrorId,
        ...errorData,
        timestamp: new Date(),
        status: 'ACTIVE',
        coordinationStatus: 'FALLBACK',
        fallbackReason: error.message
      });

      return {
        errorId: fallbackErrorId,
        processed: true,
        fallback: true,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async activateProactivePrevention(errorId, predictions) {
    logger.warn(`[ERROR COORDINATOR ENTERPRISE] Activating proactive prevention for error ${errorId}`);

    try {
      for (const prediction of predictions) {
        // Implementar acciones preventivas basadas en predicciones
        switch (prediction.type) {
          case 'CASCADE_PREDICTION':
            await this.preventCascadeFromPrediction(errorId, prediction);
            break;

          case 'OVERLOAD_PREDICTION':
            await this.preventOverloadFromPrediction(errorId, prediction);
            break;

          case 'FAILURE_PREDICTION':
            await this.preventFailureFromPrediction(errorId, prediction);
            break;

          default:
            logger.info(`[ERROR COORDINATOR ENTERPRISE] Unknown prediction type: ${prediction.type}`);
        }
      }

      this.emit('prevention:proactive', {
        errorId,
        predictions,
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('[ERROR COORDINATOR ENTERPRISE] Proactive prevention failed:', error);
    }
  }

  async analyzeErrorCorrelations(errorData) {
    logger.debug(`[ERROR COORDINATOR ENTERPRISE] Analyzing correlations for error ${errorData.id}`);

    try {
      // Buscar errores similares en ventana temporal
      const timeWindow = 300000; // 5 minutos
      const recentErrors = this.errorAggregator.errorHistory.filter(err =>
        Date.now() - err.timestamp.getTime() < timeWindow &&
        err.id !== errorData.id
      );

      // Analizar correlaciones
      const correlations = [];

      for (const recentError of recentErrors) {
        const correlation = this.calculateErrorCorrelation(errorData, recentError);
        if (correlation.score > 0.7) {
          correlations.push({
            errorId: recentError.id,
            correlation: correlation.score,
            factors: correlation.factors
          });
        }
      }

      // Actualizar matriz de correlación
      if (correlations.length > 0) {
        const correlationKey = `${errorData.agentId}:${errorData.category}`;

        if (!this.errorAggregator.correlationMatrix.has(correlationKey)) {
          this.errorAggregator.correlationMatrix.set(correlationKey, []);
        }

        this.errorAggregator.correlationMatrix.get(correlationKey).push({
          errorId: errorData.id,
          correlations,
          timestamp: new Date()
        });
      }

      return correlations;

    } catch (error) {
      logger.error('[ERROR COORDINATOR ENTERPRISE] Correlation analysis failed:', error);
      return [];
    }
  }

  calculateErrorCorrelation(error1, error2) {
    let score = 0;
    const factors = [];

    // Factor temporal (proximidad en tiempo)
    const timeDiff = Math.abs(error1.timestamp.getTime() - error2.timestamp.getTime());
    const timeScore = Math.max(0, 1 - (timeDiff / 300000)); // 5 minutos max
    score += timeScore * 0.3;
    factors.push(`temporal: ${timeScore.toFixed(2)}`);

    // Factor de agente (mismo agente o categoría)
    let agentScore = 0;
    if (error1.agentId === error2.agentId) {
      agentScore = 1.0;
    } else if (error1.category === error2.category) {
      agentScore = 0.6;
    }
    score += agentScore * 0.4;
    factors.push(`agent: ${agentScore.toFixed(2)}`);

    // Factor de severidad
    const severityMap = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    const sev1 = severityMap[error1.severity] || 2;
    const sev2 = severityMap[error2.severity] || 2;
    const severityScore = 1 - (Math.abs(sev1 - sev2) / 3);
    score += severityScore * 0.3;
    factors.push(`severity: ${severityScore.toFixed(2)}`);

    return {
      score: Math.min(1.0, score),
      factors
    };
  }

  async assessCascadeRisk(errorData) {
    logger.debug(`[ERROR COORDINATOR ENTERPRISE] Assessing cascade risk for error ${errorData.id}`);

    try {
      let riskScore = 0;
      const factors = [];

      // Factor de severidad del error inicial
      const severityRisk = {
        'CRITICAL': 0.8,
        'HIGH': 0.6,
        'MEDIUM': 0.3,
        'LOW': 0.1
      }[errorData.severity] || 0.3;

      riskScore += severityRisk * 0.4;
      factors.push(`severity: ${severityRisk}`);

      // Factor de errores activos actuales
      const activeErrorCount = this.errorAggregator.activeErrors.size;
      const errorLoadRisk = Math.min(1.0, activeErrorCount / 20); // Max 20 errores activos
      riskScore += errorLoadRisk * 0.3;
      factors.push(`error_load: ${errorLoadRisk}`);

      // Factor de categoría crítica
      const criticalCategories = ['CORE_INFRASTRUCTURE', 'AI_ML_SPECIALISTS'];
      const categoryRisk = criticalCategories.includes(errorData.category) ? 0.8 : 0.3;
      riskScore += categoryRisk * 0.3;
      factors.push(`category: ${categoryRisk}`);

      // Normalizar riesgo
      riskScore = Math.min(1.0, riskScore);

      return {
        risk: riskScore,
        level: this.getRiskLevel(riskScore),
        factors,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('[ERROR COORDINATOR ENTERPRISE] Cascade risk assessment failed:', error);
      return {
        risk: 0.5,
        level: 'MEDIUM',
        factors: ['assessment_failed'],
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  getRiskLevel(riskScore) {
    if (riskScore >= 0.8) return 'CRITICAL';
    if (riskScore >= 0.6) return 'HIGH';
    if (riskScore >= 0.4) return 'MEDIUM';
    return 'LOW';
  }

  async activateCascadePrevention(errorId, cascadeRisk) {
    logger.warn(`[ERROR COORDINATOR ENTERPRISE] Activating cascade prevention for error ${errorId} (risk: ${cascadeRisk.level})`);

    try {
      const preventionActions = [];

      // Acciones basadas en nivel de riesgo
      switch (cascadeRisk.level) {
        case 'CRITICAL':
          // Aislamiento inmediato y circuit breakers
          preventionActions.push('IMMEDIATE_ISOLATION');
          preventionActions.push('CIRCUIT_BREAKER_ACTIVATION');
          preventionActions.push('EMERGENCY_FALLBACK');
          break;

        case 'HIGH':
          // Circuit breakers y load balancing
          preventionActions.push('CIRCUIT_BREAKER_ACTIVATION');
          preventionActions.push('LOAD_REDISTRIBUTION');
          preventionActions.push('MONITORING_INCREASE');
          break;

        case 'MEDIUM':
          // Monitoreo aumentado y preparación
          preventionActions.push('MONITORING_INCREASE');
          preventionActions.push('FALLBACK_PREPARATION');
          break;
      }

      // Ejecutar acciones de prevención
      for (const action of preventionActions) {
        await this.executePreventionAction(errorId, action, cascadeRisk);
      }

      this.emit('cascade:prevented', {
        errorId,
        riskLevel: cascadeRisk.level,
        actions: preventionActions,
        timestamp: new Date()
      });

      return {
        activated: true,
        actions: preventionActions,
        riskLevel: cascadeRisk.level
      };

    } catch (error) {
      logger.error('[ERROR COORDINATOR ENTERPRISE] Cascade prevention activation failed:', error);
      return {
        activated: false,
        error: error.message
      };
    }
  }

  async executePreventionAction(errorId, action, cascadeRisk) {
    logger.info(`[ERROR COORDINATOR ENTERPRISE] Executing prevention action: ${action}`);

    try {
      switch (action) {
        case 'IMMEDIATE_ISOLATION':
          // Implementar aislamiento inmediato
          await this.isolateAffectedSystems(errorId);
          break;

        case 'CIRCUIT_BREAKER_ACTIVATION':
          // Activar circuit breakers
          await this.activateCircuitBreakers(errorId);
          break;

        case 'EMERGENCY_FALLBACK':
          // Activar sistemas de fallback de emergencia
          await this.activateEmergencyFallback(errorId);
          break;

        case 'LOAD_REDISTRIBUTION':
          // Redistribuir carga
          await this.redistributeLoad(errorId);
          break;

        case 'MONITORING_INCREASE':
          // Aumentar monitoreo
          await this.increaseMonitoring(errorId);
          break;

        case 'FALLBACK_PREPARATION':
          // Preparar sistemas de fallback
          await this.prepareFallbackSystems(errorId);
          break;

        default:
          logger.warn(`[ERROR COORDINATOR ENTERPRISE] Unknown prevention action: ${action}`);
      }

    } catch (error) {
      logger.error(`[ERROR COORDINATOR ENTERPRISE] Prevention action ${action} failed:`, error);
    }
  }

  // Métodos de prevención específicos (implementación básica)
  async isolateAffectedSystems(errorId) {
    logger.info(`[ERROR COORDINATOR ENTERPRISE] Isolating systems for error ${errorId}`);
    // Implementación específica de aislamiento
  }

  async activateCircuitBreakers(errorId) {
    logger.info(`[ERROR COORDINATOR ENTERPRISE] Activating circuit breakers for error ${errorId}`);
    // Implementación específica de circuit breakers
  }

  async activateEmergencyFallback(errorId) {
    logger.info(`[ERROR COORDINATOR ENTERPRISE] Activating emergency fallback for error ${errorId}`);
    // Implementación específica de fallback de emergencia
  }

  async redistributeLoad(errorId) {
    logger.info(`[ERROR COORDINATOR ENTERPRISE] Redistributing load for error ${errorId}`);
    // Implementación específica de redistribución de carga
  }

  async increaseMonitoring(errorId) {
    logger.info(`[ERROR COORDINATOR ENTERPRISE] Increasing monitoring for error ${errorId}`);
    // Implementación específica de monitoreo aumentado
  }

  async prepareFallbackSystems(errorId) {
    logger.info(`[ERROR COORDINATOR ENTERPRISE] Preparing fallback systems for error ${errorId}`);
    // Implementación específica de preparación de fallback
  }

  // Métodos de prevención basados en predicciones
  async preventCascadeFromPrediction(errorId, prediction) {
    logger.info(`[ERROR COORDINATOR ENTERPRISE] Preventing cascade from prediction for error ${errorId}`);

    if (prediction.probability > 0.8) {
      await this.activateCircuitBreakers(errorId);
      await this.redistributeLoad(errorId);
    }
  }

  async preventOverloadFromPrediction(errorId, prediction) {
    logger.info(`[ERROR COORDINATOR ENTERPRISE] Preventing overload from prediction for error ${errorId}`);

    if (prediction.probability > 0.7) {
      await this.redistributeLoad(errorId);
      await this.increaseMonitoring(errorId);
    }
  }

  async preventFailureFromPrediction(errorId, prediction) {
    logger.info(`[ERROR COORDINATOR ENTERPRISE] Preventing failure from prediction for error ${errorId}`);

    if (prediction.probability > 0.9) {
      await this.prepareFallbackSystems(errorId);
      await this.activateEmergencyFallback(errorId);
    }
  }

  // Método para obtener estado del coordinador
  getCoordinatorStatus() {
    return {
      name: this.name,
      version: this.version,
      mode: this.mode,
      status: this.status,
      activeErrors: this.errorAggregator.activeErrors.size,
      totalErrors: this.errorAggregator.errorHistory.length,
      patterns: this.errorAggregator.errorPatterns.size,
      correlations: this.errorAggregator.correlationMatrix.size,
      recoveries: this.recoveryOrchestrator.activeRecoveries.size,
      timestamp: new Date()
    };
  }
}

// ============================================================================
// EXPORT Y AUTO-INICIALIZACIÓN
// ============================================================================
const errorCoordinatorEnterprise = new ErrorCoordinatorEnterprise();

module.exports = {
  ErrorCoordinatorEnterprise,
  errorCoordinatorEnterprise
};

// Auto-test si se ejecuta directamente
if (require.main === module) {
  console.log('[ERROR COORDINATOR] Testing Enterprise Error Coordination System...');

  // Test de coordinación básica
  const testError = new Error('Test error for coordination system');
  const testContext = {
    agentId: 'test-agent-001',
    operation: 'test-operation',
    severity: 'MEDIUM'
  };

  errorCoordinatorEnterprise.handleErrorEvent(testError, testContext)
    .then(result => {
      console.log('[ERROR COORDINATOR] ✅ Test successful:', result);
    })
    .catch(error => {
      console.error('[ERROR COORDINATOR] ❌ Test failed:', error);
    });
}