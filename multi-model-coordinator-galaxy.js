/**
 * SANDRA IA GALAXY ENTERPRISE - MULTI-MODEL COORDINATOR v7.0
 * Sistema Avanzado de Coordinación Multi-LLM para Prompt Engineering Galaxy Enterprise
 * Integración con 248+ Agentes Especializados y Guardian Protocol
 */

const { EventEmitter } = require('events');
const { performance } = require('perf_hooks');

// Importar ecosistema Sandra IA Galaxy Enterprise
const logger = require('./backend/logger');
const metrics = require('./backend/metrics');
const { guardianProtocol } = require('./guardian-protocol');
const { multiAgentCoordinator } = require('./multi-agent-coordinator');

class MultiModelCoordinatorGalaxy extends EventEmitter {
  constructor() {
    super();
    this.name = "SANDRA_MULTI_MODEL_COORDINATOR_GALAXY";
    this.version = "7.0_GALAXY_ENTERPRISE";
    this.mode = "INTELLIGENT_MODEL_ORCHESTRATION";

    // Estado del coordinador
    this.coordinatorState = {
      status: 'INITIALIZING',
      activeModels: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalCost: 0,
      lastOptimization: null
    };

    // Configuración Galaxy Enterprise
    this.galaxyConfig = {
      enableIntelligentRouting: true,
      enableCostOptimization: true,
      enableLoadBalancing: true,
      enableFallbackStrategy: true,
      enablePerformanceMonitoring: true,
      maxRetries: 3,
      timeoutMs: 30000,
      costThresholdPerRequest: 0.50, // $0.50 max per request
      responseTimeTarget: 2000, // 2 seconds target
      qualityThreshold: 0.85 // 85% minimum quality score
    };

    // Pool de modelos LLM disponibles
    this.modelPool = {
      // OpenAI Models
      'gpt-4-turbo': {
        provider: 'OPENAI',
        type: 'TEXT_GENERATION',
        capabilities: ['text', 'reasoning', 'coding', 'analysis'],
        costPerToken: { input: 0.01, output: 0.03 }, // per 1K tokens
        maxTokens: 128000,
        quality: 0.95,
        speed: 0.80,
        availability: 0.99,
        specialties: ['complex_reasoning', 'code_generation', 'analysis'],
        status: 'AVAILABLE'
      },

      'gpt-4': {
        provider: 'OPENAI',
        type: 'TEXT_GENERATION',
        capabilities: ['text', 'reasoning', 'coding'],
        costPerToken: { input: 0.03, output: 0.06 },
        maxTokens: 8192,
        quality: 0.92,
        speed: 0.75,
        availability: 0.99,
        specialties: ['reasoning', 'writing', 'general'],
        status: 'AVAILABLE'
      },

      'gpt-3.5-turbo': {
        provider: 'OPENAI',
        type: 'TEXT_GENERATION',
        capabilities: ['text', 'simple_reasoning'],
        costPerToken: { input: 0.001, output: 0.002 },
        maxTokens: 16384,
        quality: 0.78,
        speed: 0.95,
        availability: 0.99,
        specialties: ['quick_responses', 'simple_tasks', 'cost_effective'],
        status: 'AVAILABLE'
      },

      // Anthropic Models
      'claude-3-5-sonnet': {
        provider: 'ANTHROPIC',
        type: 'TEXT_GENERATION',
        capabilities: ['text', 'reasoning', 'analysis', 'coding'],
        costPerToken: { input: 0.003, output: 0.015 },
        maxTokens: 200000,
        quality: 0.97,
        speed: 0.85,
        availability: 0.98,
        specialties: ['analysis', 'reasoning', 'large_context', 'safety'],
        status: 'AVAILABLE'
      },

      'claude-3-haiku': {
        provider: 'ANTHROPIC',
        type: 'TEXT_GENERATION',
        capabilities: ['text', 'quick_responses'],
        costPerToken: { input: 0.00025, output: 0.00125 },
        maxTokens: 200000,
        quality: 0.82,
        speed: 0.98,
        availability: 0.98,
        specialties: ['speed', 'cost_effective', 'simple_tasks'],
        status: 'AVAILABLE'
      },

      // Google Models
      'gemini-1.5-pro': {
        provider: 'GOOGLE',
        type: 'TEXT_GENERATION',
        capabilities: ['text', 'multimodal', 'reasoning'],
        costPerToken: { input: 0.00125, output: 0.00375 },
        maxTokens: 2000000,
        quality: 0.90,
        speed: 0.82,
        availability: 0.97,
        specialties: ['multimodal', 'large_context', 'reasoning'],
        status: 'AVAILABLE'
      },

      // Local/Open Source Models
      'llama-3-70b': {
        provider: 'LOCAL',
        type: 'TEXT_GENERATION',
        capabilities: ['text', 'reasoning'],
        costPerToken: { input: 0, output: 0 }, // Local cost
        maxTokens: 8192,
        quality: 0.88,
        speed: 0.70,
        availability: 0.95,
        specialties: ['privacy', 'local_processing', 'cost_free'],
        status: 'AVAILABLE'
      }
    };

    // Matriz de routing inteligente
    this.routingMatrix = {
      // Por tipo de tarea
      task_routing: {
        'COMPLEX_REASONING': ['claude-3-5-sonnet', 'gpt-4-turbo', 'gpt-4'],
        'CODE_GENERATION': ['gpt-4-turbo', 'claude-3-5-sonnet', 'gpt-4'],
        'QUICK_RESPONSE': ['claude-3-haiku', 'gpt-3.5-turbo', 'gemini-1.5-pro'],
        'COST_SENSITIVE': ['claude-3-haiku', 'gpt-3.5-turbo', 'llama-3-70b'],
        'LARGE_CONTEXT': ['claude-3-5-sonnet', 'gemini-1.5-pro', 'gpt-4-turbo'],
        'MULTIMODAL': ['gemini-1.5-pro', 'gpt-4-turbo'],
        'PRIVACY_REQUIRED': ['llama-3-70b']
      },

      // Por categoría de agente (248+ agentes)
      agent_routing: {
        'DEVELOPMENT_EXPERTS': ['gpt-4-turbo', 'claude-3-5-sonnet'],
        'AI_ML_SPECIALISTS': ['claude-3-5-sonnet', 'gpt-4-turbo'],
        'BUSINESS_LOGIC': ['gpt-4', 'claude-3-5-sonnet'],
        'USER_EXPERIENCE': ['gpt-4', 'gemini-1.5-pro'],
        'INTEGRATION_SERVICES': ['gpt-4-turbo', 'claude-3-5-sonnet'],
        'SPECIALIZED_DOMAINS': ['claude-3-5-sonnet', 'gpt-4']
      },

      // Por prioridad
      priority_routing: {
        'CRITICAL': ['gpt-4-turbo', 'claude-3-5-sonnet'],
        'HIGH': ['gpt-4', 'claude-3-5-sonnet', 'gemini-1.5-pro'],
        'MEDIUM': ['gpt-3.5-turbo', 'claude-3-haiku', 'gemini-1.5-pro'],
        'LOW': ['claude-3-haiku', 'gpt-3.5-turbo', 'llama-3-70b']
      }
    };

    // Performance tracking por modelo
    this.performanceTracker = {
      modelMetrics: new Map(),
      requestHistory: [],
      costAnalysis: new Map(),
      qualityScores: new Map(),
      errorRates: new Map()
    };

    // Load balancer inteligente
    this.loadBalancer = {
      currentLoads: new Map(),
      queueSizes: new Map(),
      healthChecks: new Map(),
      lastHealthCheck: new Date()
    };

    this.initialize();
  }

  async initialize() {
    logger.info('[MULTI-MODEL COORDINATOR] Initializing Galaxy Enterprise multi-model system');

    try {
      // 1. Inicializar modelos disponibles
      await this.initializeModelPool();

      // 2. Configurar sistema de routing
      await this.setupIntelligentRouting();

      // 3. Configurar load balancing
      await this.setupLoadBalancing();

      // 4. Configurar monitoring
      await this.setupPerformanceMonitoring();

      // 5. Integrar con Guardian Protocol
      await this.integrateGuardianProtocol();

      // 6. Configurar fallback strategy
      await this.setupFallbackStrategy();

      this.coordinatorState.status = 'GALAXY_ENTERPRISE_ACTIVE';

      logger.info('[MULTI-MODEL COORDINATOR] ✅ Galaxy Enterprise multi-model system ACTIVE');

      this.emit('multi-model-coordinator:ready', {
        system: this.name,
        version: this.version,
        availableModels: this.coordinatorState.activeModels,
        routing: Object.keys(this.routingMatrix.task_routing).length
      });

    } catch (error) {
      logger.error('[MULTI-MODEL COORDINATOR] Initialization failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // MODEL POOL MANAGEMENT
  // ============================================================================
  async initializeModelPool() {
    logger.info('[MULTI-MODEL COORDINATOR] Initializing model pool');

    let activeModels = 0;

    for (const [modelId, modelConfig] of Object.entries(this.modelPool)) {
      try {
        // Verificar disponibilidad del modelo
        const isAvailable = await this.checkModelAvailability(modelId, modelConfig);

        if (isAvailable) {
          modelConfig.status = 'AVAILABLE';
          activeModels++;

          // Inicializar métricas del modelo
          this.performanceTracker.modelMetrics.set(modelId, {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            totalCost: 0,
            qualityScore: modelConfig.quality,
            errorRate: 0,
            lastUsed: null
          });

          logger.debug(`[MULTI-MODEL COORDINATOR] Model ${modelId} initialized and available`);
        } else {
          modelConfig.status = 'UNAVAILABLE';
          logger.warn(`[MULTI-MODEL COORDINATOR] Model ${modelId} not available`);
        }

      } catch (error) {
        modelConfig.status = 'ERROR';
        logger.error(`[MULTI-MODEL COORDINATOR] Failed to initialize model ${modelId}:`, error);
      }
    }

    this.coordinatorState.activeModels = activeModels;
    logger.info(`[MULTI-MODEL COORDINATOR] ✅ Model pool initialized: ${activeModels} models available`);
  }

  async checkModelAvailability(modelId, modelConfig) {
    // Simulación de health check
    // En implementación real: hacer ping a API del proveedor

    try {
      switch (modelConfig.provider) {
        case 'OPENAI':
          return !!process.env.OPENAI_API_KEY;
        case 'ANTHROPIC':
          return !!process.env.ANTHROPIC_API_KEY;
        case 'GOOGLE':
          return !!process.env.GOOGLE_API_KEY;
        case 'LOCAL':
          return true; // Asume que está disponible localmente
        default:
          return false;
      }
    } catch (error) {
      logger.warn(`[MULTI-MODEL COORDINATOR] Health check failed for ${modelId}:`, error);
      return false;
    }
  }

  // ============================================================================
  // INTELLIGENT ROUTING SYSTEM
  // ============================================================================
  async setupIntelligentRouting() {
    logger.info('[MULTI-MODEL COORDINATOR] Setting up intelligent routing');

    this.intelligentRouter = {
      // Seleccionar mejor modelo para tarea
      selectOptimalModel: async (taskContext) => {
        const {
          taskType,
          agentCategory,
          priority = 'MEDIUM',
          contextSize = 0,
          requiresMultimodal = false,
          costConstraint = 'BALANCED',
          qualityRequirement = 0.85,
          speedRequirement = 'NORMAL'
        } = taskContext;

        // 1. Filtrar modelos candidatos por capacidades
        let candidates = this.filterModelsByCapabilities(taskContext);

        // 2. Aplicar routing matrix
        candidates = this.applyRoutingMatrix(candidates, taskType, agentCategory, priority);

        // 3. Optimizar por costo/calidad/velocidad
        candidates = this.optimizeModelSelection(candidates, {
          costConstraint,
          qualityRequirement,
          speedRequirement,
          contextSize
        });

        // 4. Aplicar load balancing
        const selectedModel = await this.applyLoadBalancing(candidates);

        if (!selectedModel) {
          throw new Error('No suitable model found for task requirements');
        }

        logger.debug('[MULTI-MODEL COORDINATOR] Selected model:', {
          modelId: selectedModel.id,
          taskType,
          agentCategory,
          priority
        });

        return selectedModel;
      },

      // Filtrar por capacidades
      filterModelsByCapabilities: (taskContext) => {
        const candidates = [];

        for (const [modelId, modelConfig] of Object.entries(this.modelPool)) {
          if (modelConfig.status !== 'AVAILABLE') continue;

          // Verificar capacidades requeridas
          if (taskContext.requiresMultimodal && !modelConfig.capabilities.includes('multimodal')) {
            continue;
          }

          // Verificar tamaño de contexto
          if (taskContext.contextSize > modelConfig.maxTokens) {
            continue;
          }

          // Verificar requisitos de calidad
          if (modelConfig.quality < taskContext.qualityRequirement) {
            continue;
          }

          candidates.push({
            id: modelId,
            config: modelConfig,
            score: 0 // Se calculará en optimización
          });
        }

        return candidates;
      },

      // Aplicar matriz de routing
      applyRoutingMatrix: (candidates, taskType, agentCategory, priority) => {
        const routingCandidates = [];

        // Obtener modelos preferidos según routing matrix
        const taskPreferred = this.routingMatrix.task_routing[taskType] || [];
        const agentPreferred = this.routingMatrix.agent_routing[agentCategory] || [];
        const priorityPreferred = this.routingMatrix.priority_routing[priority] || [];

        // Calcular score de routing para cada candidato
        for (const candidate of candidates) {
          let routingScore = 0;

          if (taskPreferred.includes(candidate.id)) routingScore += 3;
          if (agentPreferred.includes(candidate.id)) routingScore += 2;
          if (priorityPreferred.includes(candidate.id)) routingScore += 1;

          if (routingScore > 0) {
            candidate.routingScore = routingScore;
            routingCandidates.push(candidate);
          }
        }

        // Si no hay candidatos con score de routing, usar todos
        return routingCandidates.length > 0 ? routingCandidates : candidates;
      },

      // Optimizar selección por múltiples criterios
      optimizeModelSelection: (candidates, constraints) => {
        const {
          costConstraint,
          qualityRequirement,
          speedRequirement,
          contextSize
        } = constraints;

        for (const candidate of candidates) {
          let score = 0;

          // Factor de calidad (40% del score)
          score += (candidate.config.quality / 1.0) * 40;

          // Factor de velocidad (30% del score)
          const speedScore = speedRequirement === 'FAST' ? candidate.config.speed * 40 :
                           speedRequirement === 'SLOW_OK' ? 30 :
                           candidate.config.speed * 30;
          score += speedScore;

          // Factor de costo (30% del score)
          const costScore = this.calculateCostScore(candidate.config, contextSize, costConstraint);
          score += costScore;

          // Bonus por routing preference
          score += (candidate.routingScore || 0) * 5;

          // Penalty por load actual
          const currentLoad = this.loadBalancer.currentLoads.get(candidate.id) || 0;
          score -= currentLoad * 2;

          candidate.finalScore = score;
        }

        // Ordenar por score descendente
        return candidates.sort((a, b) => b.finalScore - a.finalScore);
      },

      calculateCostScore: (modelConfig, contextSize, costConstraint) => {
        const estimatedCost = this.estimateRequestCost(modelConfig, contextSize);

        switch (costConstraint) {
          case 'MINIMIZE':
            return Math.max(0, 30 - (estimatedCost * 100)); // Penalizar costo alto
          case 'BALANCED':
            return estimatedCost < 0.10 ? 25 : estimatedCost < 0.25 ? 20 : 15;
          case 'QUALITY_FIRST':
            return estimatedCost < 1.0 ? 20 : 10; // Menos peso al costo
          default:
            return 20;
        }
      }
    };

    // Asignar métodos al objeto principal
    this.filterModelsByCapabilities = this.intelligentRouter.filterModelsByCapabilities;
    this.applyRoutingMatrix = this.intelligentRouter.applyRoutingMatrix;
    this.optimizeModelSelection = this.intelligentRouter.optimizeModelSelection;

    logger.info('[MULTI-MODEL COORDINATOR] ✅ Intelligent routing configured');
  }

  // ============================================================================
  // LOAD BALANCING SYSTEM
  // ============================================================================
  async setupLoadBalancing() {
    logger.info('[MULTI-MODEL COORDINATOR] Setting up load balancing');

    this.loadBalancer = {
      currentLoads: new Map(),
      queueSizes: new Map(),
      healthChecks: new Map(),
      lastHealthCheck: new Date(),

      // Aplicar load balancing a candidatos
      applyLoadBalancing: async (candidates) => {
        if (candidates.length === 0) return null;

        // Filtrar por health status
        const healthyCandidates = candidates.filter(candidate => {
          const health = this.loadBalancer.healthChecks.get(candidate.id);
          return !health || health.status === 'HEALTHY';
        });

        if (healthyCandidates.length === 0) {
          logger.warn('[MULTI-MODEL COORDINATOR] No healthy candidates available');
          return candidates[0]; // Fallback al mejor candidato
        }

        // Seleccionar candidato con menor carga
        let bestCandidate = healthyCandidates[0];
        let lowestLoad = this.loadBalancer.currentLoads.get(bestCandidate.id) || 0;

        for (const candidate of healthyCandidates.slice(1)) {
          const currentLoad = this.loadBalancer.currentLoads.get(candidate.id) || 0;

          // Considerar tanto la carga como el score final
          const adjustedScore = candidate.finalScore - (currentLoad * 5);
          const bestAdjustedScore = bestCandidate.finalScore - (lowestLoad * 5);

          if (adjustedScore > bestAdjustedScore) {
            bestCandidate = candidate;
            lowestLoad = currentLoad;
          }
        }

        // Incrementar carga del modelo seleccionado
        this.loadBalancer.currentLoads.set(bestCandidate.id, lowestLoad + 1);

        return bestCandidate;
      },

      // Decrementar carga después de completar request
      releaseModelLoad: (modelId) => {
        const currentLoad = this.loadBalancer.currentLoads.get(modelId) || 0;
        this.loadBalancer.currentLoads.set(modelId, Math.max(0, currentLoad - 1));
      },

      // Health check periódico
      performHealthChecks: async () => {
        for (const [modelId, modelConfig] of Object.entries(this.modelPool)) {
          if (modelConfig.status !== 'AVAILABLE') continue;

          try {
            const isHealthy = await this.checkModelAvailability(modelId, modelConfig);

            this.loadBalancer.healthChecks.set(modelId, {
              status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
              lastCheck: new Date(),
              responseTime: 100 // Simulado
            });

          } catch (error) {
            this.loadBalancer.healthChecks.set(modelId, {
              status: 'ERROR',
              lastCheck: new Date(),
              error: error.message
            });
          }
        }

        this.loadBalancer.lastHealthCheck = new Date();
      }
    };

    // Asignar métodos al objeto principal
    this.applyLoadBalancing = this.loadBalancer.applyLoadBalancing;

    // Configurar health checks periódicos
    setInterval(() => {
      this.loadBalancer.performHealthChecks();
    }, 60000); // Cada minuto

    logger.info('[MULTI-MODEL COORDINATOR] ✅ Load balancing configured');
  }

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================
  async setupPerformanceMonitoring() {
    logger.info('[MULTI-MODEL COORDINATOR] Setting up performance monitoring');

    this.performanceMonitor = {
      // Registrar métricas de request
      recordRequestMetrics: (modelId, requestData, responseData) => {
        const metrics = this.performanceTracker.modelMetrics.get(modelId);
        if (!metrics) return;

        // Actualizar contadores
        metrics.totalRequests++;
        if (responseData.success) {
          metrics.successfulRequests++;
        } else {
          metrics.failedRequests++;
        }

        // Actualizar tiempo de respuesta promedio
        const responseTime = responseData.responseTime || 0;
        metrics.averageResponseTime = (
          (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) /
          metrics.totalRequests
        );

        // Actualizar costo total
        metrics.totalCost += responseData.cost || 0;

        // Calcular error rate
        metrics.errorRate = metrics.failedRequests / metrics.totalRequests;

        // Actualizar timestamp
        metrics.lastUsed = new Date();

        // Guardar en historial global
        this.performanceTracker.requestHistory.push({
          timestamp: new Date(),
          modelId,
          success: responseData.success,
          responseTime,
          cost: responseData.cost || 0,
          tokenCount: responseData.tokenCount || 0
        });

        // Mantener solo últimas 1000 entradas
        if (this.performanceTracker.requestHistory.length > 1000) {
          this.performanceTracker.requestHistory = this.performanceTracker.requestHistory.slice(-1000);
        }

        // Actualizar métricas globales
        this.coordinatorState.totalRequests++;
        if (responseData.success) {
          this.coordinatorState.successfulRequests++;
        } else {
          this.coordinatorState.failedRequests++;
        }

        this.coordinatorState.totalCost += responseData.cost || 0;
        this.coordinatorState.averageResponseTime = (
          (this.coordinatorState.averageResponseTime * (this.coordinatorState.totalRequests - 1) + responseTime) /
          this.coordinatorState.totalRequests
        );
      },

      // Generar reporte de performance
      generatePerformanceReport: () => {
        const report = {
          timestamp: new Date(),
          coordinator: {
            ...this.coordinatorState
          },
          models: {},
          insights: []
        };

        // Métricas por modelo
        for (const [modelId, metrics] of this.performanceTracker.modelMetrics) {
          report.models[modelId] = {
            ...metrics,
            efficiency: metrics.successfulRequests / Math.max(1, metrics.totalRequests),
            costPerSuccess: metrics.totalCost / Math.max(1, metrics.successfulRequests),
            avgCostPerRequest: metrics.totalCost / Math.max(1, metrics.totalRequests)
          };
        }

        // Generar insights automáticos
        report.insights = this.generatePerformanceInsights(report);

        return report;
      },

      generatePerformanceInsights: (report) => {
        const insights = [];

        // Identificar modelo más eficiente
        let bestModel = null;
        let bestEfficiency = 0;

        for (const [modelId, metrics] of Object.entries(report.models)) {
          if (metrics.efficiency > bestEfficiency) {
            bestEfficiency = metrics.efficiency;
            bestModel = modelId;
          }
        }

        if (bestModel) {
          insights.push({
            type: 'EFFICIENCY_LEADER',
            message: `Model ${bestModel} has highest efficiency: ${(bestEfficiency * 100).toFixed(1)}%`,
            value: bestEfficiency,
            model: bestModel
          });
        }

        // Identificar modelos con alto error rate
        for (const [modelId, metrics] of Object.entries(report.models)) {
          if (metrics.errorRate > 0.1) { // > 10% error rate
            insights.push({
              type: 'HIGH_ERROR_RATE',
              message: `Model ${modelId} has high error rate: ${(metrics.errorRate * 100).toFixed(1)}%`,
              value: metrics.errorRate,
              model: modelId,
              severity: 'WARNING'
            });
          }
        }

        // Análisis de costos
        const totalCost = Object.values(report.models).reduce((sum, m) => sum + m.totalCost, 0);
        if (totalCost > 100) { // Si el costo total supera $100
          insights.push({
            type: 'COST_OPTIMIZATION',
            message: `Total cost is high: $${totalCost.toFixed(2)}. Consider using more cost-effective models.`,
            value: totalCost,
            severity: 'INFO'
          });
        }

        return insights;
      }
    };

    logger.info('[MULTI-MODEL COORDINATOR] ✅ Performance monitoring configured');
  }

  // ============================================================================
  // GUARDIAN PROTOCOL INTEGRATION
  // ============================================================================
  async integrateGuardianProtocol() {
    logger.info('[MULTI-MODEL COORDINATOR] Integrating Guardian Protocol');

    this.guardianIntegration = {
      validateModelRequest: async (modelId, requestData) => {
        // Validar con Guardian Protocol
        const validation = await guardianProtocol.validateOperation({
          type: 'LLM_REQUEST',
          modelId: modelId,
          requestData: requestData,
          ceoAuthorized: true
        });

        if (!validation.valid) {
          throw new Error(`Guardian Protocol: LLM request validation failed - ${validation.reason}`);
        }

        return validation;
      },

      applyComplianceConstraints: (requestData) => {
        // Aplicar constraints de compliance
        return {
          ...requestData,
          guardianProtocolActive: true,
          complianceMode: 'ENTERPRISE',
          safetyFilters: true
        };
      }
    };

    logger.info('[MULTI-MODEL COORDINATOR] ✅ Guardian Protocol integrated');
  }

  // ============================================================================
  // FALLBACK STRATEGY
  // ============================================================================
  async setupFallbackStrategy() {
    logger.info('[MULTI-MODEL COORDINATOR] Setting up fallback strategy');

    this.fallbackStrategy = {
      primary: ['gpt-4-turbo', 'claude-3-5-sonnet'],
      secondary: ['gpt-4', 'claude-3-haiku'],
      emergency: ['gpt-3.5-turbo', 'gemini-1.5-pro'],
      local: ['llama-3-70b'],

      // Ejecutar con fallback automático
      executeWithFallback: async (taskContext, requestData) => {
        const fallbackChain = [
          ...this.fallbackStrategy.primary,
          ...this.fallbackStrategy.secondary,
          ...this.fallbackStrategy.emergency,
          ...this.fallbackStrategy.local
        ];

        let lastError = null;

        for (const modelId of fallbackChain) {
          const modelConfig = this.modelPool[modelId];

          if (!modelConfig || modelConfig.status !== 'AVAILABLE') {
            continue;
          }

          try {
            logger.debug(`[MULTI-MODEL COORDINATOR] Attempting request with model: ${modelId}`);

            const result = await this.executeModelRequest(modelId, requestData, taskContext);

            if (result.success) {
              logger.info(`[MULTI-MODEL COORDINATOR] ✅ Request successful with model: ${modelId}`);
              return result;
            }

          } catch (error) {
            lastError = error;
            logger.warn(`[MULTI-MODEL COORDINATOR] Model ${modelId} failed:`, error.message);

            // Incrementar contador de fallos para el modelo
            const metrics = this.performanceTracker.modelMetrics.get(modelId);
            if (metrics) {
              metrics.failedRequests++;
            }
          }
        }

        // Si todos los modelos fallan
        throw new Error(`All models in fallback chain failed. Last error: ${lastError?.message || 'Unknown'}`);
      }
    };

    logger.info('[MULTI-MODEL COORDINATOR] ✅ Fallback strategy configured');
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================
  async executeModelRequest(modelId, requestData, taskContext = {}) {
    const startTime = performance.now();
    let result = null;

    try {
      // 1. Validar con Guardian Protocol
      await this.guardianIntegration.validateModelRequest(modelId, requestData);

      // 2. Aplicar compliance constraints
      const compliantRequest = this.guardianIntegration.applyComplianceConstraints(requestData);

      // 3. Obtener configuración del modelo
      const modelConfig = this.modelPool[modelId];
      if (!modelConfig || modelConfig.status !== 'AVAILABLE') {
        throw new Error(`Model ${modelId} is not available`);
      }

      // 4. Ejecutar request según el proveedor
      result = await this.callModelAPI(modelId, modelConfig, compliantRequest);

      // 5. Procesar respuesta
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      const cost = this.calculateRequestCost(modelConfig, result);

      const processedResult = {
        success: true,
        modelId: modelId,
        provider: modelConfig.provider,
        response: result.response,
        responseTime: responseTime,
        cost: cost,
        tokenCount: result.tokenCount || 0,
        quality: result.quality || modelConfig.quality,
        timestamp: new Date()
      };

      // 6. Registrar métricas
      this.performanceMonitor.recordRequestMetrics(modelId, compliantRequest, processedResult);

      // 7. Liberar carga del load balancer
      this.loadBalancer.releaseModelLoad(modelId);

      // 8. Emit evento de éxito
      this.emit('model-request:success', {
        modelId,
        responseTime,
        cost,
        taskContext
      });

      return processedResult;

    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Registrar fallo
      this.performanceMonitor.recordRequestMetrics(modelId, requestData, {
        success: false,
        responseTime: responseTime,
        error: error.message
      });

      // Liberar carga del load balancer
      this.loadBalancer.releaseModelLoad(modelId);

      // Emit evento de error
      this.emit('model-request:error', {
        modelId,
        error: error.message,
        responseTime,
        taskContext
      });

      throw error;
    }
  }

  async executeOptimalRequest(taskContext, requestData) {
    logger.debug('[MULTI-MODEL COORDINATOR] Executing optimal request', taskContext);

    try {
      // 1. Seleccionar modelo óptimo
      const optimalModel = await this.intelligentRouter.selectOptimalModel(taskContext);

      // 2. Ejecutar con el modelo seleccionado
      const result = await this.executeModelRequest(optimalModel.id, requestData, taskContext);

      return {
        ...result,
        selectedModel: optimalModel,
        selectionReason: 'OPTIMAL_ROUTING'
      };

    } catch (error) {
      logger.warn('[MULTI-MODEL COORDINATOR] Optimal request failed, trying fallback');

      // 3. Si falla, usar fallback strategy
      const fallbackResult = await this.fallbackStrategy.executeWithFallback(taskContext, requestData);

      return {
        ...fallbackResult,
        selectionReason: 'FALLBACK_STRATEGY'
      };
    }
  }

  // ============================================================================
  // MODEL API INTEGRATION
  // ============================================================================
  async callModelAPI(modelId, modelConfig, requestData) {
    const { provider } = modelConfig;

    switch (provider) {
      case 'OPENAI':
        return await this.callOpenAI(modelId, modelConfig, requestData);

      case 'ANTHROPIC':
        return await this.callAnthropic(modelId, modelConfig, requestData);

      case 'GOOGLE':
        return await this.callGoogle(modelId, modelConfig, requestData);

      case 'LOCAL':
        return await this.callLocalModel(modelId, modelConfig, requestData);

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async callOpenAI(modelId, modelConfig, requestData) {
    const { prompt, systemMessage = "You are a helpful assistant.", temperature = 0.1 } = requestData;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: temperature,
        max_tokens: requestData.maxTokens || 4000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      response: data.choices[0]?.message?.content || '',
      tokenCount: data.usage?.total_tokens || 0,
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0
    };
  }

  async callAnthropic(modelId, modelConfig, requestData) {
    const { prompt, systemMessage = "You are a helpful assistant.", temperature = 0.1 } = requestData;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: requestData.maxTokens || 4000,
        temperature: temperature,
        system: systemMessage,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      response: data.content[0]?.text || '',
      tokenCount: data.usage?.input_tokens + data.usage?.output_tokens || 0,
      inputTokens: data.usage?.input_tokens || 0,
      outputTokens: data.usage?.output_tokens || 0
    };
  }

  async callGoogle(modelId, modelConfig, requestData) {
    // Implementación para Google Gemini
    throw new Error('Google Gemini integration not yet implemented');
  }

  async callLocalModel(modelId, modelConfig, requestData) {
    // Implementación para modelos locales (Ollama, etc.)
    throw new Error('Local model integration not yet implemented');
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  estimateRequestCost(modelConfig, contextSize = 1000, outputSize = 500) {
    const inputCost = (contextSize / 1000) * modelConfig.costPerToken.input;
    const outputCost = (outputSize / 1000) * modelConfig.costPerToken.output;
    return inputCost + outputCost;
  }

  calculateRequestCost(modelConfig, result) {
    if (!result.inputTokens || !result.outputTokens) {
      return 0; // No se puede calcular sin datos de tokens
    }

    const inputCost = (result.inputTokens / 1000) * modelConfig.costPerToken.input;
    const outputCost = (result.outputTokens / 1000) * modelConfig.costPerToken.output;

    return inputCost + outputCost;
  }

  getSystemStatus() {
    return {
      system: this.name,
      version: this.version,
      status: this.coordinatorState.status,
      models: {
        available: this.coordinatorState.activeModels,
        total: Object.keys(this.modelPool).length
      },
      performance: {
        totalRequests: this.coordinatorState.totalRequests,
        successRate: this.coordinatorState.successfulRequests / Math.max(1, this.coordinatorState.totalRequests),
        averageResponseTime: this.coordinatorState.averageResponseTime,
        totalCost: this.coordinatorState.totalCost
      },
      routing: {
        taskTypes: Object.keys(this.routingMatrix.task_routing).length,
        agentCategories: Object.keys(this.routingMatrix.agent_routing).length,
        priorities: Object.keys(this.routingMatrix.priority_routing).length
      },
      lastHealthCheck: this.loadBalancer.lastHealthCheck
    };
  }

  async generateStatusReport() {
    const performanceReport = this.performanceMonitor.generatePerformanceReport();
    const systemStatus = this.getSystemStatus();

    return {
      timestamp: new Date(),
      coordinator: systemStatus,
      performance: performanceReport,
      recommendations: this.generateOptimizationRecommendations(performanceReport)
    };
  }

  generateOptimizationRecommendations(performanceReport) {
    const recommendations = [];

    // Análisis de eficiencia
    const models = Object.entries(performanceReport.models);
    const avgEfficiency = models.reduce((sum, [_, m]) => sum + m.efficiency, 0) / models.length;

    if (avgEfficiency < 0.9) {
      recommendations.push({
        type: 'EFFICIENCY_IMPROVEMENT',
        message: 'Overall model efficiency is below 90%. Consider reviewing routing strategy.',
        priority: 'MEDIUM'
      });
    }

    // Análisis de costos
    const totalCost = this.coordinatorState.totalCost;
    const avgCostPerRequest = totalCost / Math.max(1, this.coordinatorState.totalRequests);

    if (avgCostPerRequest > 0.25) {
      recommendations.push({
        type: 'COST_OPTIMIZATION',
        message: 'Average cost per request is high. Consider using more cost-effective models for simple tasks.',
        priority: 'HIGH'
      });
    }

    // Análisis de velocidad
    if (this.coordinatorState.averageResponseTime > 3000) {
      recommendations.push({
        type: 'PERFORMANCE_OPTIMIZATION',
        message: 'Average response time is above 3 seconds. Consider prioritizing faster models.',
        priority: 'MEDIUM'
      });
    }

    return recommendations;
  }
}

// ============================================================================
// EXPORT Y AUTO-INICIALIZACIÓN
// ============================================================================
const multiModelCoordinatorGalaxy = new MultiModelCoordinatorGalaxy();

module.exports = {
  MultiModelCoordinatorGalaxy,
  multiModelCoordinatorGalaxy
};

// Auto-test si se ejecuta directamente
if (require.main === module) {
  console.log('[MULTI-MODEL COORDINATOR] Testing Galaxy Enterprise multi-model system...');

  multiModelCoordinatorGalaxy.on('multi-model-coordinator:ready', async (data) => {
    console.log('[MULTI-MODEL COORDINATOR] ✅ Ready:', data);

    try {
      // Test de selección de modelo
      const taskContext = {
        taskType: 'CODE_GENERATION',
        agentCategory: 'DEVELOPMENT_EXPERTS',
        priority: 'HIGH',
        contextSize: 2000,
        qualityRequirement: 0.90
      };

      const optimalModel = await multiModelCoordinatorGalaxy.intelligentRouter.selectOptimalModel(taskContext);
      console.log('[MULTI-MODEL COORDINATOR] ✅ Optimal model selected:', optimalModel.id);

      // Test de request
      const requestData = {
        prompt: 'Create a simple React component for a button',
        systemMessage: 'You are an expert React developer.',
        maxTokens: 1000
      };

      // Simular request (comentado para testing sin APIs reales)
      // const result = await multiModelCoordinatorGalaxy.executeOptimalRequest(taskContext, requestData);
      // console.log('[MULTI-MODEL COORDINATOR] ✅ Request executed:', result.success);

      // Test de estado del sistema
      const status = multiModelCoordinatorGalaxy.getSystemStatus();
      console.log('[MULTI-MODEL COORDINATOR] System status:', status);

    } catch (error) {
      console.error('[MULTI-MODEL COORDINATOR] ❌ Test failed:', error);
    }
  });
}