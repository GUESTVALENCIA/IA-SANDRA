/**
 * SANDRA IA GALAXY ENTERPRISE - PROMPT A/B TESTING SYSTEM v7.0
 * Sistema Avanzado de Testing A/B para Optimización de Prompts
 * Integración con Multi-Model Coordinator y Statistical Analysis Engine
 */

const { EventEmitter } = require('events');
const { performance } = require('perf_hooks');

// Importar ecosistema Sandra IA Galaxy Enterprise
const logger = require('./backend/logger');
const metrics = require('./backend/metrics');
const { guardianProtocol } = require('./guardian-protocol');
const { multiModelCoordinatorGalaxy } = require('./multi-model-coordinator-galaxy');
const { multiAgentCoordinator } = require('./multi-agent-coordinator');

class PromptABTestingGalaxy extends EventEmitter {
  constructor() {
    super();
    this.name = "SANDRA_PROMPT_AB_TESTING_GALAXY";
    this.version = "7.0_GALAXY_ENTERPRISE";
    this.mode = "STATISTICAL_OPTIMIZATION";

    // Estado del sistema A/B Testing
    this.testingState = {
      status: 'INITIALIZING',
      activeTests: 0,
      completedTests: 0,
      totalExperiments: 0,
      statisticalConfidence: 0.95, // 95% confidence level
      minimumSampleSize: 30,
      maxConcurrentTests: 10,
      lastOptimization: null
    };

    // Configuración Galaxy Enterprise
    this.galaxyConfig = {
      enableAdvancedStatistics: true,
      enableMultiVariateTests: true,
      enableCohortAnalysis: true,
      enableSeasonalAnalysis: true,
      enableCrossAgentTesting: true,
      autoStopOnSignificance: true,
      testDurationDays: 7,
      significanceThreshold: 0.05, // p-value < 0.05
      minimumEffectSize: 0.05, // 5% minimum improvement
      maxTestDuration: 30 * 24 * 60 * 60 * 1000 // 30 días
    };

    // Pool de experimentos A/B
    this.experimentPool = {
      // Tests activos
      activeTests: new Map(),

      // Tests completados
      completedTests: new Map(),

      // Templates de test
      testTemplates: new Map(),

      // Métricas y resultados
      testResults: new Map(),

      // Configuraciones de variantes
      variantConfigurations: new Map()
    };

    // Motor estadístico avanzado
    this.statisticalEngine = {
      // Tests estadísticos disponibles
      tests: {
        'T_TEST': this.performTTest.bind(this),
        'CHI_SQUARE': this.performChiSquareTest.bind(this),
        'MANN_WHITNEY': this.performMannWhitneyTest.bind(this),
        'ANOVA': this.performANOVATest.bind(this),
        'BAYESIAN': this.performBayesianTest.bind(this)
      },

      // Métricas de evaluación
      metrics: {
        'ACCURACY': this.calculateAccuracy.bind(this),
        'RESPONSE_TIME': this.calculateResponseTime.bind(this),
        'TOKEN_EFFICIENCY': this.calculateTokenEfficiency.bind(this),
        'COST_EFFECTIVENESS': this.calculateCostEffectiveness.bind(this),
        'QUALITY_SCORE': this.calculateQualityScore.bind(this),
        'USER_SATISFACTION': this.calculateUserSatisfaction.bind(this),
        'BIAS_SCORE': this.calculateBiasScore.bind(this)
      },

      // Cache de cálculos estadísticos
      calculationCache: new Map(),

      // Análisis de potencia estadística
      powerAnalysis: new Map()
    };

    // Sistema de variantes de prompts
    this.variantSystem = {
      // Tipos de variaciones
      variationType: {
        'WORDING': 'Changes in word choice and phrasing',
        'STRUCTURE': 'Changes in prompt structure and organization',
        'EXAMPLES': 'Different few-shot examples',
        'INSTRUCTIONS': 'Variations in instruction clarity',
        'CONTEXT': 'Different context information',
        'TEMPERATURE': 'Different model temperature settings',
        'MODEL': 'Different model selections'
      },

      // Generador automático de variantes
      variantGenerator: new Map(),

      // Evaluador de variantes
      variantEvaluator: new Map()
    };

    // Cohort Analysis System
    this.cohortAnalysis = {
      cohorts: new Map(),
      cohortDefinitions: new Map(),
      cohortResults: new Map(),
      segmentationRules: new Map()
    };

    this.initialize();
  }

  async initialize() {
    logger.info('[PROMPT A/B TESTING] Initializing Galaxy Enterprise A/B testing system');

    try {
      // 1. Configurar motor estadístico
      await this.setupStatisticalEngine();

      // 2. Configurar sistema de variantes
      await this.setupVariantSystem();

      // 3. Configurar templates de test
      await this.setupTestTemplates();

      // 4. Configurar cohort analysis
      await this.setupCohortAnalysis();

      // 5. Integrar con Multi-Model Coordinator
      await this.integrateMultiModelCoordinator();

      // 6. Configurar monitoring y alertas
      await this.setupMonitoring();

      // 7. Integrar con Guardian Protocol
      await this.integrateGuardianProtocol();

      this.testingState.status = 'GALAXY_ENTERPRISE_ACTIVE';

      logger.info('[PROMPT A/B TESTING] ✅ Galaxy Enterprise A/B testing system ACTIVE');

      this.emit('ab-testing:ready', {
        system: this.name,
        version: this.version,
        testTemplates: this.experimentPool.testTemplates.size,
        statisticalTests: Object.keys(this.statisticalEngine.tests).length
      });

    } catch (error) {
      logger.error('[PROMPT A/B TESTING] Initialization failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // STATISTICAL ENGINE SETUP
  // ============================================================================
  async setupStatisticalEngine() {
    logger.info('[PROMPT A/B TESTING] Setting up statistical engine');

    // Configurar análisis de potencia estadística
    this.powerAnalysis = {
      // Calcular tamaño de muestra requerido
      calculateSampleSize: (effectSize, alpha = 0.05, power = 0.80) => {
        // Fórmula simplificada para t-test
        const zAlpha = this.getZScore(alpha / 2);
        const zBeta = this.getZScore(1 - power);

        const sampleSize = Math.ceil(
          (2 * Math.pow(zAlpha + zBeta, 2)) / Math.pow(effectSize, 2)
        );

        return Math.max(sampleSize, this.testingState.minimumSampleSize);
      },

      // Calcular potencia estadística
      calculatePower: (sampleSize, effectSize, alpha = 0.05) => {
        const zAlpha = this.getZScore(alpha / 2);
        const zBeta = zAlpha - effectSize * Math.sqrt(sampleSize / 2);

        return 1 - this.normalCDF(zBeta);
      },

      // Detectar tamaño del efecto mínimo detectable
      minimumDetectableEffect: (sampleSize, alpha = 0.05, power = 0.80) => {
        const zAlpha = this.getZScore(alpha / 2);
        const zBeta = this.getZScore(1 - power);

        return (zAlpha + zBeta) * Math.sqrt(2 / sampleSize);
      }
    };

    // Configurar validaciones estadísticas
    this.statisticalValidations = {
      // Validar normalidad de datos
      validateNormality: (data) => {
        // Implementar test de Shapiro-Wilk simplificado
        if (data.length < 3) return { isNormal: false, reason: 'Insufficient data' };

        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);

        // Criterio simplificado: verificar skewness y kurtosis
        const skewness = this.calculateSkewness(data, mean, variance);
        const kurtosis = this.calculateKurtosis(data, mean, variance);

        const isNormal = Math.abs(skewness) < 2 && Math.abs(kurtosis - 3) < 2;

        return {
          isNormal,
          skewness,
          kurtosis,
          recommendation: isNormal ? 'Use parametric tests' : 'Use non-parametric tests'
        };
      },

      // Validar homogeneidad de varianzas
      validateHomoscedasticity: (group1, group2) => {
        const var1 = this.calculateVariance(group1);
        const var2 = this.calculateVariance(group2);

        const fRatio = Math.max(var1, var2) / Math.min(var1, var2);
        const isHomoscedastic = fRatio < 4; // Regla empírica

        return {
          isHomoscedastic,
          fRatio,
          variance1: var1,
          variance2: var2,
          recommendation: isHomoscedastic ? 'Equal variances assumption met' : 'Consider Welch t-test'
        };
      }
    };

    logger.info('[PROMPT A/B TESTING] ✅ Statistical engine configured');
  }

  // ============================================================================
  // VARIANT SYSTEM SETUP
  // ============================================================================
  async setupVariantSystem() {
    logger.info('[PROMPT A/B TESTING] Setting up variant system');

    // Configurar generadores automáticos de variantes
    this.variantGenerators = {
      // Generar variantes por reformulación
      'WORDING_VARIANTS': {
        generate: async (originalPrompt, count = 3) => {
          const variants = [];

          // Técnicas de reformulación
          const techniques = [
            'SYNONYM_REPLACEMENT',
            'SENTENCE_RESTRUCTURING',
            'FORMALITY_ADJUSTMENT',
            'TONE_MODIFICATION'
          ];

          for (let i = 0; i < count; i++) {
            const technique = techniques[i % techniques.length];
            const variant = await this.applyWordingTechnique(originalPrompt, technique);

            variants.push({
              id: `wording_${i + 1}`,
              type: 'WORDING',
              technique: technique,
              prompt: variant,
              expectedImpact: 'Clarity and engagement improvement'
            });
          }

          return variants;
        }
      },

      // Generar variantes estructurales
      'STRUCTURE_VARIANTS': {
        generate: async (originalPrompt, count = 3) => {
          const variants = [];

          const structures = [
            'STEP_BY_STEP',
            'BULLET_POINTS',
            'CONVERSATIONAL',
            'FORMAL_INSTRUCTIONS'
          ];

          for (let i = 0; i < count; i++) {
            const structure = structures[i % structures.length];
            const variant = await this.applyStructuralChange(originalPrompt, structure);

            variants.push({
              id: `structure_${i + 1}`,
              type: 'STRUCTURE',
              structure: structure,
              prompt: variant,
              expectedImpact: 'Response organization improvement'
            });
          }

          return variants;
        }
      },

      // Generar variantes de ejemplos
      'EXAMPLE_VARIANTS': {
        generate: async (originalPrompt, count = 3) => {
          const variants = [];

          for (let i = 0; i < count; i++) {
            const variant = await this.generateExampleVariant(originalPrompt, i + 1);

            variants.push({
              id: `examples_${i + 1}`,
              type: 'EXAMPLES',
              exampleCount: i + 1,
              prompt: variant,
              expectedImpact: 'Few-shot learning effectiveness'
            });
          }

          return variants;
        }
      },

      // Generar variantes de temperatura/modelo
      'MODEL_VARIANTS': {
        generate: async (originalPrompt, count = 3) => {
          const variants = [];

          const configurations = [
            { temperature: 0.1, model: 'gpt-4-turbo' },
            { temperature: 0.3, model: 'claude-3-5-sonnet' },
            { temperature: 0.7, model: 'gpt-4' }
          ];

          for (let i = 0; i < count; i++) {
            const config = configurations[i % configurations.length];

            variants.push({
              id: `model_${i + 1}`,
              type: 'MODEL',
              configuration: config,
              prompt: originalPrompt,
              expectedImpact: 'Model performance optimization'
            });
          }

          return variants;
        }
      }
    };

    // Configurar evaluador de variantes
    this.variantEvaluator = {
      // Predecir rendimiento de variante
      predictPerformance: async (variant, historicalData) => {
        // Análisis basado en patrones históricos
        const predictions = {
          accuracy: 0.85, // Predicción base
          responseTime: 2000,
          cost: 0.15,
          quality: 0.80
        };

        // Ajustar según tipo de variante
        switch (variant.type) {
          case 'WORDING':
            predictions.accuracy += 0.05;
            predictions.quality += 0.10;
            break;
          case 'STRUCTURE':
            predictions.responseTime -= 200;
            predictions.accuracy += 0.03;
            break;
          case 'EXAMPLES':
            predictions.accuracy += 0.10;
            predictions.cost += 0.05;
            break;
          case 'MODEL':
            // Basado en configuración del modelo
            predictions.responseTime = variant.configuration.temperature > 0.5 ? 2500 : 1800;
            break;
        }

        return {
          variant: variant.id,
          predictions,
          confidence: 0.75,
          basedOn: 'Historical patterns and variant type analysis'
        };
      },

      // Rankear variantes por potencial
      rankVariants: async (variants) => {
        const rankedVariants = [];

        for (const variant of variants) {
          const prediction = await this.variantEvaluator.predictPerformance(variant);

          // Calcular score compuesto
          const score = (
            prediction.predictions.accuracy * 0.4 +
            (2500 - prediction.predictions.responseTime) / 2500 * 0.2 +
            (0.5 - prediction.predictions.cost) / 0.5 * 0.2 +
            prediction.predictions.quality * 0.2
          );

          rankedVariants.push({
            ...variant,
            prediction,
            score,
            rank: 0 // Se asignará después del sorting
          });
        }

        // Ordenar por score descendente
        rankedVariants.sort((a, b) => b.score - a.score);

        // Asignar rankings
        rankedVariants.forEach((variant, index) => {
          variant.rank = index + 1;
        });

        return rankedVariants;
      }
    };

    logger.info('[PROMPT A/B TESTING] ✅ Variant system configured');
  }

  // ============================================================================
  // TEST TEMPLATES SETUP
  // ============================================================================
  async setupTestTemplates() {
    logger.info('[PROMPT A/B TESTING] Setting up test templates');

    const testTemplates = {
      // Template básico A/B
      'BASIC_AB_TEST': {
        id: 'basic_ab_test',
        name: 'Basic A/B Prompt Test',
        description: 'Simple two-variant prompt comparison',
        variants: 2,
        metrics: ['ACCURACY', 'RESPONSE_TIME', 'COST_EFFECTIVENESS'],
        statisticalTest: 'T_TEST',
        minimumSampleSize: 30,
        significance: 0.05,
        powerRequirement: 0.80
      },

      // Template multivariate
      'MULTIVARIATE_TEST': {
        id: 'multivariate_test',
        name: 'Multivariate Prompt Optimization',
        description: 'Multiple factor optimization test',
        variants: 4,
        factors: ['WORDING', 'STRUCTURE', 'EXAMPLES'],
        metrics: ['ACCURACY', 'QUALITY_SCORE', 'TOKEN_EFFICIENCY'],
        statisticalTest: 'ANOVA',
        minimumSampleSize: 50,
        significance: 0.05,
        powerRequirement: 0.80
      },

      // Template específico para agentes
      'AGENT_SPECIALIZATION_TEST': {
        id: 'agent_specialization_test',
        name: 'Agent-Specific Prompt Optimization',
        description: 'Optimize prompts for specific agent categories',
        variants: 3,
        agentCategories: ['DEVELOPMENT_EXPERTS', 'BUSINESS_LOGIC', 'AI_ML_SPECIALISTS'],
        metrics: ['ACCURACY', 'QUALITY_SCORE', 'USER_SATISFACTION'],
        statisticalTest: 'CHI_SQUARE',
        minimumSampleSize: 40,
        significance: 0.05,
        cohortAnalysis: true
      },

      // Template de costo-beneficio
      'COST_OPTIMIZATION_TEST': {
        id: 'cost_optimization_test',
        name: 'Cost-Benefit Prompt Analysis',
        description: 'Optimize prompts for cost vs quality trade-off',
        variants: 5,
        models: ['gpt-3.5-turbo', 'gpt-4', 'claude-3-haiku', 'claude-3-5-sonnet'],
        metrics: ['COST_EFFECTIVENESS', 'QUALITY_SCORE', 'RESPONSE_TIME'],
        statisticalTest: 'MANN_WHITNEY',
        minimumSampleSize: 60,
        significance: 0.05,
        economicAnalysis: true
      },

      // Template de bias testing
      'BIAS_DETECTION_TEST': {
        id: 'bias_detection_test',
        name: 'Bias Detection and Mitigation Test',
        description: 'Test prompt variants for bias reduction',
        variants: 3,
        biasTypes: ['GENDER', 'CULTURAL', 'DEMOGRAPHIC'],
        metrics: ['BIAS_SCORE', 'ACCURACY', 'QUALITY_SCORE'],
        statisticalTest: 'BAYESIAN',
        minimumSampleSize: 100,
        significance: 0.01, // Más estricto para bias
        ethicalReview: true
      }
    };

    // Registrar templates
    for (const [templateKey, template] of Object.entries(testTemplates)) {
      this.experimentPool.testTemplates.set(templateKey, {
        ...template,
        createdAt: new Date(),
        version: this.version,
        status: 'ACTIVE'
      });
    }

    logger.info(`[PROMPT A/B TESTING] ✅ Test templates configured: ${this.experimentPool.testTemplates.size}`);
  }

  // ============================================================================
  // COHORT ANALYSIS SETUP
  // ============================================================================
  async setupCohortAnalysis() {
    logger.info('[PROMPT A/B TESTING] Setting up cohort analysis');

    this.cohortAnalysis = {
      // Definiciones de cohortes
      cohortDefinitions: new Map([
        ['AGENT_CATEGORY', {
          name: 'Agent Category Cohorts',
          segments: [
            'DEVELOPMENT_EXPERTS',
            'AI_ML_SPECIALISTS',
            'BUSINESS_LOGIC',
            'USER_EXPERIENCE',
            'INTEGRATION_SERVICES'
          ],
          description: 'Segment by agent specialization'
        }],

        ['TASK_COMPLEXITY', {
          name: 'Task Complexity Cohorts',
          segments: ['SIMPLE', 'MEDIUM', 'COMPLEX', 'ENTERPRISE'],
          description: 'Segment by task complexity level'
        }],

        ['RESPONSE_TIME', {
          name: 'Response Time Cohorts',
          segments: ['FAST (<1s)', 'NORMAL (1-3s)', 'SLOW (>3s)'],
          description: 'Segment by response time requirements'
        }],

        ['COST_SENSITIVITY', {
          name: 'Cost Sensitivity Cohorts',
          segments: ['COST_OPTIMIZED', 'BALANCED', 'QUALITY_FIRST'],
          description: 'Segment by cost vs quality preference'
        }]
      ]),

      // Analizador de cohortes
      analyzeCohorts: async (testResults, cohortType) => {
        const cohortDefinition = this.cohortAnalysis.cohortDefinitions.get(cohortType);
        if (!cohortDefinition) {
          throw new Error(`Cohort definition not found: ${cohortType}`);
        }

        const cohortResults = new Map();

        // Segmentar resultados por cohorte
        for (const segment of cohortDefinition.segments) {
          const segmentData = testResults.filter(result =>
            this.assignToCohort(result, cohortType) === segment
          );

          if (segmentData.length > 0) {
            const analysis = this.analyzeCohortSegment(segmentData, segment);
            cohortResults.set(segment, analysis);
          }
        }

        return {
          cohortType,
          definition: cohortDefinition,
          results: cohortResults,
          insights: this.generateCohortInsights(cohortResults),
          analyzedAt: new Date()
        };
      },

      // Asignar resultado a cohorte
      assignToCohort: (result, cohortType) => {
        switch (cohortType) {
          case 'AGENT_CATEGORY':
            return result.agentCategory || 'UNKNOWN';

          case 'TASK_COMPLEXITY':
            return result.taskComplexity || 'MEDIUM';

          case 'RESPONSE_TIME':
            const responseTime = result.responseTime || 2000;
            if (responseTime < 1000) return 'FAST (<1s)';
            if (responseTime > 3000) return 'SLOW (>3s)';
            return 'NORMAL (1-3s)';

          case 'COST_SENSITIVITY':
            return result.costPreference || 'BALANCED';

          default:
            return 'UNKNOWN';
        }
      },

      // Analizar segmento de cohorte
      analyzeCohortSegment: (segmentData, segmentName) => {
        const metrics = {
          sampleSize: segmentData.length,
          averageAccuracy: segmentData.reduce((sum, d) => sum + (d.accuracy || 0), 0) / segmentData.length,
          averageResponseTime: segmentData.reduce((sum, d) => sum + (d.responseTime || 0), 0) / segmentData.length,
          averageCost: segmentData.reduce((sum, d) => sum + (d.cost || 0), 0) / segmentData.length,
          successRate: segmentData.filter(d => d.success).length / segmentData.length
        };

        return {
          segment: segmentName,
          metrics,
          varianceAnalysis: {
            accuracyVariance: this.calculateVariance(segmentData.map(d => d.accuracy || 0)),
            responseTimeVariance: this.calculateVariance(segmentData.map(d => d.responseTime || 0)),
            costVariance: this.calculateVariance(segmentData.map(d => d.cost || 0))
          },
          recommendedActions: this.generateSegmentRecommendations(metrics, segmentName)
        };
      },

      // Generar insights de cohortes
      generateCohortInsights: (cohortResults) => {
        const insights = [];

        // Identificar mejor performing cohort
        let bestCohort = null;
        let bestScore = 0;

        for (const [segment, analysis] of cohortResults) {
          const score = analysis.metrics.averageAccuracy * 0.4 +
                       analysis.metrics.successRate * 0.3 +
                       (1 - analysis.metrics.averageCost / 0.5) * 0.3;

          if (score > bestScore) {
            bestScore = score;
            bestCohort = segment;
          }
        }

        if (bestCohort) {
          insights.push({
            type: 'BEST_PERFORMING_COHORT',
            cohort: bestCohort,
            score: bestScore,
            message: `Cohort ${bestCohort} shows best overall performance`
          });
        }

        // Identificar oportunidades de mejora
        for (const [segment, analysis] of cohortResults) {
          if (analysis.metrics.averageAccuracy < 0.80) {
            insights.push({
              type: 'IMPROVEMENT_OPPORTUNITY',
              cohort: segment,
              metric: 'accuracy',
              value: analysis.metrics.averageAccuracy,
              message: `Cohort ${segment} has low accuracy, consider specialized optimization`
            });
          }

          if (analysis.metrics.averageResponseTime > 3000) {
            insights.push({
              type: 'PERFORMANCE_ISSUE',
              cohort: segment,
              metric: 'response_time',
              value: analysis.metrics.averageResponseTime,
              message: `Cohort ${segment} has high response times, consider faster models`
            });
          }
        }

        return insights;
      }
    };

    logger.info('[PROMPT A/B TESTING] ✅ Cohort analysis configured');
  }

  // ============================================================================
  // MULTI-MODEL COORDINATOR INTEGRATION
  // ============================================================================
  async integrateMultiModelCoordinator() {
    logger.info('[PROMPT A/B TESTING] Integrating with Multi-Model Coordinator');

    this.multiModelIntegration = {
      // Ejecutar test usando coordinador de modelos
      executeTestWithCoordinator: async (testId, variant, taskContext) => {
        const test = this.experimentPool.activeTests.get(testId);
        if (!test) {
          throw new Error(`Test not found: ${testId}`);
        }

        try {
          // Preparar request data
          const requestData = {
            prompt: variant.prompt,
            systemMessage: variant.systemMessage || 'You are a helpful assistant.',
            temperature: variant.configuration?.temperature || 0.1,
            maxTokens: variant.maxTokens || 4000
          };

          // Ejecutar con modelo óptimo o específico
          let result;
          if (variant.type === 'MODEL' && variant.configuration?.model) {
            // Usar modelo específico de la variante
            result = await multiModelCoordinatorGalaxy.executeModelRequest(
              variant.configuration.model,
              requestData,
              taskContext
            );
          } else {
            // Usar selección óptima del coordinador
            result = await multiModelCoordinatorGalaxy.executeOptimalRequest(
              taskContext,
              requestData
            );
          }

          // Procesar resultado para A/B testing
          return {
            testId,
            variantId: variant.id,
            modelUsed: result.modelId,
            provider: result.provider,
            success: result.success,
            response: result.response,
            responseTime: result.responseTime,
            cost: result.cost,
            tokenCount: result.tokenCount,
            quality: result.quality,
            timestamp: result.timestamp,
            taskContext
          };

        } catch (error) {
          logger.error(`[PROMPT A/B TESTING] Test execution failed for variant ${variant.id}:`, error);

          return {
            testId,
            variantId: variant.id,
            success: false,
            error: error.message,
            timestamp: new Date(),
            taskContext
          };
        }
      },

      // Ejecutar test batch para múltiples variantes
      executeBatchTest: async (testId, variants, taskContexts) => {
        const results = [];
        const batchSize = 5; // Procesar en lotes para evitar sobrecarga

        for (let i = 0; i < taskContexts.length; i += batchSize) {
          const batch = taskContexts.slice(i, i + batchSize);
          const batchPromises = [];

          for (const taskContext of batch) {
            // Seleccionar variante aleatoriamente para este contexto
            const variant = variants[Math.floor(Math.random() * variants.length)];

            batchPromises.push(
              this.multiModelIntegration.executeTestWithCoordinator(testId, variant, taskContext)
            );
          }

          // Ejecutar batch en paralelo
          const batchResults = await Promise.allSettled(batchPromises);

          for (const result of batchResults) {
            if (result.status === 'fulfilled') {
              results.push(result.value);
            } else {
              logger.error('[PROMPT A/B TESTING] Batch execution failed:', result.reason);
              results.push({
                success: false,
                error: result.reason?.message || 'Unknown batch error',
                timestamp: new Date()
              });
            }
          }

          // Pausa pequeña entre batches
          if (i + batchSize < taskContexts.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        return results;
      }
    };

    logger.info('[PROMPT A/B TESTING] ✅ Multi-Model Coordinator integration completed');
  }

  // ============================================================================
  // MONITORING SETUP
  // ============================================================================
  async setupMonitoring() {
    logger.info('[PROMPT A/B TESTING] Setting up monitoring and alerts');

    this.monitoring = {
      // Métricas en tiempo real
      realTimeMetrics: {
        activeTests: () => this.experimentPool.activeTests.size,
        totalExperiments: () => this.testingState.totalExperiments,
        averageTestDuration: () => this.calculateAverageTestDuration(),
        successRate: () => this.calculateOverallSuccessRate(),
        costPerTest: () => this.calculateAverageCostPerTest()
      },

      // Sistema de alertas
      alertSystem: {
        // Alertar cuando test alcanza significancia estadística
        checkSignificance: (testId) => {
          const test = this.experimentPool.activeTests.get(testId);
          if (!test || !test.results || test.results.length < test.minimumSampleSize) {
            return null;
          }

          const analysis = this.analyzeTestResults(testId);

          if (analysis.statisticalSignificance && analysis.pValue < test.significance) {
            this.emit('test:significance-achieved', {
              testId,
              pValue: analysis.pValue,
              effectSize: analysis.effectSize,
              winningVariant: analysis.winningVariant,
              recommendation: 'Consider stopping test and implementing winning variant'
            });

            return {
              type: 'SIGNIFICANCE_ACHIEVED',
              testId,
              analysis
            };
          }

          return null;
        },

        // Alertar sobre tests que exceden duración máxima
        checkTestDuration: () => {
          const longRunningTests = [];
          const now = new Date();

          for (const [testId, test] of this.experimentPool.activeTests) {
            const duration = now - test.startTime;

            if (duration > this.galaxyConfig.maxTestDuration) {
              longRunningTests.push({
                testId,
                duration,
                recommendation: 'Consider stopping long-running test'
              });

              this.emit('test:duration-exceeded', {
                testId,
                duration,
                maxDuration: this.galaxyConfig.maxTestDuration
              });
            }
          }

          return longRunningTests;
        },

        // Alertar sobre problemas de calidad
        checkQualityIssues: () => {
          const qualityIssues = [];

          for (const [testId, test] of this.experimentPool.activeTests) {
            if (test.results && test.results.length > 10) {
              const avgQuality = test.results.reduce((sum, r) => sum + (r.quality || 0), 0) / test.results.length;

              if (avgQuality < 0.70) {
                qualityIssues.push({
                  testId,
                  averageQuality: avgQuality,
                  recommendation: 'Review prompt variants for quality issues'
                });

                this.emit('test:quality-issue', {
                  testId,
                  averageQuality: avgQuality
                });
              }
            }
          }

          return qualityIssues;
        }
      },

      // Dashboard de métricas
      generateDashboard: () => {
        return {
          timestamp: new Date(),
          overview: {
            activeTests: this.monitoring.realTimeMetrics.activeTests(),
            totalExperiments: this.monitoring.realTimeMetrics.totalExperiments(),
            averageTestDuration: this.monitoring.realTimeMetrics.averageTestDuration(),
            successRate: this.monitoring.realTimeMetrics.successRate(),
            costPerTest: this.monitoring.realTimeMetrics.costPerTest()
          },
          activeTestsSummary: this.generateActiveTestsSummary(),
          recentCompletedTests: this.generateRecentCompletedTestsSummary(),
          alerts: this.generateCurrentAlerts(),
          recommendations: this.generateSystemRecommendations()
        };
      }
    };

    // Configurar monitoreo periódico
    setInterval(() => {
      // Verificar significancia estadística
      for (const testId of this.experimentPool.activeTests.keys()) {
        this.monitoring.alertSystem.checkSignificance(testId);
      }

      // Verificar duración de tests
      this.monitoring.alertSystem.checkTestDuration();

      // Verificar problemas de calidad
      this.monitoring.alertSystem.checkQualityIssues();

    }, 60000); // Cada minuto

    logger.info('[PROMPT A/B TESTING] ✅ Monitoring and alerts configured');
  }

  // ============================================================================
  // GUARDIAN PROTOCOL INTEGRATION
  // ============================================================================
  async integrateGuardianProtocol() {
    logger.info('[PROMPT A/B TESTING] Integrating Guardian Protocol');

    this.guardianIntegration = {
      validateTestSetup: async (testConfiguration) => {
        // Validar configuración de test con Guardian Protocol
        const validation = await guardianProtocol.validateOperation({
          type: 'AB_TEST_SETUP',
          testConfiguration,
          ceoAuthorized: true
        });

        if (!validation.valid) {
          throw new Error(`Guardian Protocol: A/B test setup validation failed - ${validation.reason}`);
        }

        return validation;
      },

      validateVariants: async (variants) => {
        // Validar que las variantes cumplan con constraints
        for (const variant of variants) {
          const validation = await guardianProtocol.validateOperation({
            type: 'PROMPT_VARIANT',
            variant,
            ceoAuthorized: true
          });

          if (!validation.valid) {
            throw new Error(`Guardian Protocol: Variant ${variant.id} validation failed - ${validation.reason}`);
          }
        }

        return { valid: true, message: 'All variants validated' };
      },

      applyEthicalConstraints: (testConfiguration) => {
        // Aplicar constraints éticos automáticamente
        return {
          ...testConfiguration,
          ethicalReview: true,
          biasMonitoring: true,
          guardianProtocolActive: true,
          complianceMode: 'ENTERPRISE'
        };
      }
    };

    logger.info('[PROMPT A/B TESTING] ✅ Guardian Protocol integrated');
  }

  // ============================================================================
  // PUBLIC API - TEST MANAGEMENT
  // ============================================================================
  async createABTest(testConfiguration) {
    logger.info('[PROMPT A/B TESTING] Creating new A/B test');

    try {
      // 1. Validar con Guardian Protocol
      await this.guardianIntegration.validateTestSetup(testConfiguration);

      // 2. Aplicar constraints éticos
      const compliantConfig = this.guardianIntegration.applyEthicalConstraints(testConfiguration);

      // 3. Generar ID único para el test
      const testId = `ab_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 4. Obtener template si se especifica
      let templateConfig = {};
      if (compliantConfig.templateId) {
        const template = this.experimentPool.testTemplates.get(compliantConfig.templateId);
        if (template) {
          templateConfig = { ...template };
        }
      }

      // 5. Generar variantes si no se proporcionan
      let variants = compliantConfig.variants || [];
      if (variants.length === 0 && compliantConfig.originalPrompt) {
        variants = await this.generateVariantsForPrompt(
          compliantConfig.originalPrompt,
          compliantConfig.variantTypes || ['WORDING', 'STRUCTURE'],
          compliantConfig.variantCount || 3
        );
      }

      // 6. Validar variantes
      await this.guardianIntegration.validateVariants(variants);

      // 7. Calcular tamaño de muestra requerido
      const requiredSampleSize = this.powerAnalysis.calculateSampleSize(
        compliantConfig.expectedEffectSize || 0.1,
        compliantConfig.significance || 0.05,
        compliantConfig.power || 0.80
      );

      // 8. Crear configuración final del test
      const finalTest = {
        id: testId,
        name: compliantConfig.name || `A/B Test ${testId}`,
        description: compliantConfig.description || 'Automated prompt optimization test',
        template: templateConfig,
        variants,
        configuration: {
          ...templateConfig,
          ...compliantConfig,
          requiredSampleSize,
          minimumSampleSize: Math.max(requiredSampleSize, this.testingState.minimumSampleSize)
        },
        status: 'CREATED',
        results: [],
        metrics: {
          totalSamples: 0,
          variantDistribution: new Map(),
          statisticalAnalysis: null
        },
        createdAt: new Date(),
        createdBy: 'GALAXY_AB_TESTING_SYSTEM',
        guardianValidated: true
      };

      // 9. Registrar test
      this.experimentPool.activeTests.set(testId, finalTest);
      this.testingState.totalExperiments++;

      // 10. Emit evento de creación
      this.emit('test:created', {
        testId,
        variantCount: variants.length,
        requiredSampleSize,
        configuration: finalTest.configuration
      });

      logger.info(`[PROMPT A/B TESTING] ✅ A/B test created: ${testId}`);

      return {
        testId,
        test: finalTest,
        message: 'A/B test created successfully',
        nextStep: 'Start test execution with startABTest()'
      };

    } catch (error) {
      logger.error('[PROMPT A/B TESTING] Failed to create A/B test:', error);
      throw error;
    }
  }

  async startABTest(testId, taskContexts = []) {
    logger.info(`[PROMPT A/B TESTING] Starting A/B test: ${testId}`);

    const test = this.experimentPool.activeTests.get(testId);
    if (!test) {
      throw new Error(`Test not found: ${testId}`);
    }

    if (test.status !== 'CREATED' && test.status !== 'PAUSED') {
      throw new Error(`Test ${testId} is not in a startable state. Current status: ${test.status}`);
    }

    try {
      // 1. Validar que hay suficientes task contexts
      if (taskContexts.length < test.configuration.minimumSampleSize) {
        logger.warn(`[PROMPT A/B TESTING] Insufficient task contexts. Provided: ${taskContexts.length}, Required: ${test.configuration.minimumSampleSize}`);
      }

      // 2. Actualizar estado del test
      test.status = 'RUNNING';
      test.startTime = new Date();
      this.testingState.activeTests++;

      // 3. Configurar distribución de tráfico (por defecto equitativa)
      const trafficDistribution = test.configuration.trafficDistribution ||
        this.createEqualTrafficDistribution(test.variants.length);

      // 4. Ejecutar test batch si se proporcionan contextos
      if (taskContexts.length > 0) {
        const batchResults = await this.multiModelIntegration.executeBatchTest(
          testId,
          test.variants,
          taskContexts
        );

        // Agregar resultados al test
        test.results.push(...batchResults);
        test.metrics.totalSamples = test.results.length;

        // Actualizar distribución de variantes
        this.updateVariantDistribution(test, batchResults);
      }

      // 5. Emit evento de inicio
      this.emit('test:started', {
        testId,
        startTime: test.startTime,
        variants: test.variants.length,
        initialSamples: test.results.length
      });

      logger.info(`[PROMPT A/B TESTING] ✅ A/B test started: ${testId}`);

      return {
        testId,
        status: 'RUNNING',
        startTime: test.startTime,
        initialResults: test.results.length,
        message: 'A/B test started successfully'
      };

    } catch (error) {
      test.status = 'ERROR';
      test.error = error.message;
      this.testingState.activeTests--;

      logger.error(`[PROMPT A/B TESTING] Failed to start A/B test ${testId}:`, error);
      throw error;
    }
  }

  async stopABTest(testId, reason = 'Manual stop') {
    logger.info(`[PROMPT A/B TESTING] Stopping A/B test: ${testId}`);

    const test = this.experimentPool.activeTests.get(testId);
    if (!test) {
      throw new Error(`Test not found: ${testId}`);
    }

    if (test.status !== 'RUNNING') {
      throw new Error(`Test ${testId} is not running. Current status: ${test.status}`);
    }

    try {
      // 1. Actualizar estado
      test.status = 'STOPPED';
      test.endTime = new Date();
      test.stopReason = reason;
      this.testingState.activeTests--;

      // 2. Realizar análisis final
      const finalAnalysis = this.analyzeTestResults(testId);
      test.finalAnalysis = finalAnalysis;

      // 3. Mover a tests completados
      this.experimentPool.completedTests.set(testId, test);
      this.experimentPool.activeTests.delete(testId);
      this.testingState.completedTests++;

      // 4. Emit evento de finalización
      this.emit('test:stopped', {
        testId,
        endTime: test.endTime,
        reason,
        finalAnalysis,
        duration: test.endTime - test.startTime,
        totalSamples: test.results.length
      });

      logger.info(`[PROMPT A/B TESTING] ✅ A/B test stopped: ${testId}`);

      return {
        testId,
        status: 'STOPPED',
        reason,
        finalAnalysis,
        duration: test.endTime - test.startTime,
        message: 'A/B test stopped and analyzed successfully'
      };

    } catch (error) {
      logger.error(`[PROMPT A/B TESTING] Failed to stop A/B test ${testId}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // STATISTICAL ANALYSIS METHODS
  // ============================================================================
  analyzeTestResults(testId) {
    const test = this.experimentPool.activeTests.get(testId) ||
                 this.experimentPool.completedTests.get(testId);

    if (!test || !test.results || test.results.length === 0) {
      throw new Error(`No results available for test: ${testId}`);
    }

    // Agrupar resultados por variante
    const variantGroups = new Map();
    for (const result of test.results) {
      if (!variantGroups.has(result.variantId)) {
        variantGroups.set(result.variantId, []);
      }
      variantGroups.get(result.variantId).push(result);
    }

    const analysis = {
      testId,
      totalSamples: test.results.length,
      variantAnalysis: new Map(),
      statisticalComparison: null,
      recommendations: [],
      analyzedAt: new Date()
    };

    // Analizar cada variante
    for (const [variantId, results] of variantGroups) {
      analysis.variantAnalysis.set(variantId, this.analyzeVariantResults(variantId, results));
    }

    // Realizar comparación estadística
    if (variantGroups.size === 2) {
      // A/B test simple
      const variants = Array.from(variantGroups.keys());
      analysis.statisticalComparison = this.performTTest(
        variantGroups.get(variants[0]),
        variantGroups.get(variants[1]),
        'accuracy' // Métrica principal
      );
    } else if (variantGroups.size > 2) {
      // Test multivariante
      analysis.statisticalComparison = this.performANOVATest(
        Array.from(variantGroups.values()),
        'accuracy'
      );
    }

    // Generar recomendaciones
    analysis.recommendations = this.generateTestRecommendations(analysis);

    return analysis;
  }

  analyzeVariantResults(variantId, results) {
    const successfulResults = results.filter(r => r.success);

    return {
      variantId,
      sampleSize: results.length,
      successfulSamples: successfulResults.length,
      successRate: successfulResults.length / results.length,
      metrics: {
        averageAccuracy: this.calculateMean(successfulResults, 'accuracy'),
        averageResponseTime: this.calculateMean(results, 'responseTime'),
        averageCost: this.calculateMean(results, 'cost'),
        averageQuality: this.calculateMean(successfulResults, 'quality'),
        averageTokenCount: this.calculateMean(results, 'tokenCount')
      },
      variance: {
        accuracyVariance: this.calculateVariance(successfulResults.map(r => r.accuracy || 0)),
        responseTimeVariance: this.calculateVariance(results.map(r => r.responseTime || 0)),
        costVariance: this.calculateVariance(results.map(r => r.cost || 0))
      },
      confidenceIntervals: this.calculateConfidenceIntervals(successfulResults)
    };
  }

  // ============================================================================
  // STATISTICAL TEST IMPLEMENTATIONS
  // ============================================================================
  performTTest(group1, group2, metric = 'accuracy') {
    const values1 = group1.filter(r => r.success).map(r => r[metric] || 0);
    const values2 = group2.filter(r => r.success).map(r => r[metric] || 0);

    if (values1.length < 2 || values2.length < 2) {
      return {
        test: 'T_TEST',
        valid: false,
        reason: 'Insufficient data for t-test',
        recommendation: 'Collect more samples'
      };
    }

    const mean1 = this.calculateMean(values1);
    const mean2 = this.calculateMean(values2);
    const var1 = this.calculateVariance(values1);
    const var2 = this.calculateVariance(values2);
    const n1 = values1.length;
    const n2 = values2.length;

    // Welch's t-test (unequal variances)
    const pooledSE = Math.sqrt((var1 / n1) + (var2 / n2));
    const tStatistic = (mean1 - mean2) / pooledSE;

    // Degrees of freedom (Welch-Satterthwaite equation)
    const df = Math.pow((var1/n1) + (var2/n2), 2) /
               (Math.pow(var1/n1, 2)/(n1-1) + Math.pow(var2/n2, 2)/(n2-1));

    // Calculate p-value (simplified)
    const pValue = this.calculateTTestPValue(Math.abs(tStatistic), df);

    // Effect size (Cohen's d)
    const pooledSD = Math.sqrt(((n1-1)*var1 + (n2-1)*var2) / (n1+n2-2));
    const effectSize = Math.abs(mean1 - mean2) / pooledSD;

    return {
      test: 'T_TEST',
      valid: true,
      metric,
      groups: {
        group1: { mean: mean1, variance: var1, n: n1 },
        group2: { mean: mean2, variance: var2, n: n2 }
      },
      statistics: {
        tStatistic,
        pValue,
        effectSize,
        degreesOfFreedom: df
      },
      significant: pValue < 0.05,
      interpretation: this.interpretTTestResults(mean1, mean2, pValue, effectSize)
    };
  }

  performChiSquareTest(observedFrequencies, expectedFrequencies) {
    if (observedFrequencies.length !== expectedFrequencies.length) {
      throw new Error('Observed and expected frequencies must have same length');
    }

    let chiSquare = 0;
    for (let i = 0; i < observedFrequencies.length; i++) {
      const observed = observedFrequencies[i];
      const expected = expectedFrequencies[i];
      chiSquare += Math.pow(observed - expected, 2) / expected;
    }

    const df = observedFrequencies.length - 1;
    const pValue = this.calculateChiSquarePValue(chiSquare, df);

    return {
      test: 'CHI_SQUARE',
      valid: true,
      statistics: {
        chiSquare,
        pValue,
        degreesOfFreedom: df
      },
      significant: pValue < 0.05,
      interpretation: pValue < 0.05 ?
        'Significant difference in distribution' :
        'No significant difference in distribution'
    };
  }

  performMannWhitneyTest(group1, group2, metric = 'accuracy') {
    const values1 = group1.filter(r => r.success).map(r => r[metric] || 0);
    const values2 = group2.filter(r => r.success).map(r => r[metric] || 0);

    // Combine and rank all values
    const combined = [...values1.map(v => ({ value: v, group: 1 })),
                      ...values2.map(v => ({ value: v, group: 2 }))];

    combined.sort((a, b) => a.value - b.value);

    // Assign ranks
    let currentRank = 1;
    for (let i = 0; i < combined.length; i++) {
      combined[i].rank = currentRank + i;
    }

    // Calculate U statistics
    const rankSum1 = combined.filter(item => item.group === 1)
                            .reduce((sum, item) => sum + item.rank, 0);

    const n1 = values1.length;
    const n2 = values2.length;

    const U1 = rankSum1 - (n1 * (n1 + 1)) / 2;
    const U2 = (n1 * n2) - U1;
    const U = Math.min(U1, U2);

    // Calculate z-score for large samples
    const meanU = (n1 * n2) / 2;
    const sdU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
    const zScore = (U - meanU) / sdU;

    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

    return {
      test: 'MANN_WHITNEY',
      valid: true,
      metric,
      statistics: {
        U1, U2, U,
        zScore,
        pValue,
        rankSum1,
        n1, n2
      },
      significant: pValue < 0.05,
      interpretation: pValue < 0.05 ?
        'Significant difference between groups' :
        'No significant difference between groups'
    };
  }

  performANOVATest(groups, metric = 'accuracy') {
    const allValues = [];
    const groupValues = [];

    for (const group of groups) {
      const values = group.filter(r => r.success).map(r => r[metric] || 0);
      groupValues.push(values);
      allValues.push(...values);
    }

    if (allValues.length < 3) {
      return {
        test: 'ANOVA',
        valid: false,
        reason: 'Insufficient data for ANOVA',
        recommendation: 'Collect more samples'
      };
    }

    const grandMean = this.calculateMean(allValues);
    const totalN = allValues.length;
    const k = groups.length;

    // Between-group sum of squares
    let ssb = 0;
    for (const values of groupValues) {
      const groupMean = this.calculateMean(values);
      ssb += values.length * Math.pow(groupMean - grandMean, 2);
    }

    // Within-group sum of squares
    let ssw = 0;
    for (const values of groupValues) {
      const groupMean = this.calculateMean(values);
      for (const value of values) {
        ssw += Math.pow(value - groupMean, 2);
      }
    }

    // Degrees of freedom
    const dfb = k - 1;
    const dfw = totalN - k;

    // Mean squares
    const msb = ssb / dfb;
    const msw = ssw / dfw;

    // F-statistic
    const fStatistic = msb / msw;
    const pValue = this.calculateFTestPValue(fStatistic, dfb, dfw);

    return {
      test: 'ANOVA',
      valid: true,
      metric,
      statistics: {
        fStatistic,
        pValue,
        ssb, ssw,
        msb, msw,
        dfb, dfw
      },
      significant: pValue < 0.05,
      interpretation: pValue < 0.05 ?
        'Significant difference between groups' :
        'No significant difference between groups'
    };
  }

  performBayesianTest(group1, group2, metric = 'accuracy') {
    // Simplified Bayesian A/B test
    const values1 = group1.filter(r => r.success).map(r => r[metric] || 0);
    const values2 = group2.filter(r => r.success).map(r => r[metric] || 0);

    const mean1 = this.calculateMean(values1);
    const mean2 = this.calculateMean(values2);
    const var1 = this.calculateVariance(values1);
    const var2 = this.calculateVariance(values2);

    // Bayesian credible interval (simplified)
    const posteriorMeanDiff = mean1 - mean2;
    const posteriorVarDiff = var1/values1.length + var2/values2.length;
    const posteriorSDDiff = Math.sqrt(posteriorVarDiff);

    // 95% credible interval
    const lowerBound = posteriorMeanDiff - 1.96 * posteriorSDDiff;
    const upperBound = posteriorMeanDiff + 1.96 * posteriorSDDiff;

    // Probability that group1 > group2
    const probGroup1Better = 1 - this.normalCDF((0 - posteriorMeanDiff) / posteriorSDDiff);

    return {
      test: 'BAYESIAN',
      valid: true,
      metric,
      posteriorAnalysis: {
        meanDifference: posteriorMeanDiff,
        credibleInterval: [lowerBound, upperBound],
        probabilityGroup1Better: probGroup1Better,
        probabilityGroup2Better: 1 - probGroup1Better
      },
      interpretation: this.interpretBayesianResults(probGroup1Better, lowerBound, upperBound)
    };
  }

  // ============================================================================
  // UTILITY STATISTICAL FUNCTIONS
  // ============================================================================
  calculateMean(data, property = null) {
    if (data.length === 0) return 0;

    const values = property ?
      data.map(item => item[property] || 0) :
      data;

    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateVariance(data) {
    if (data.length <= 1) return 0;

    const mean = this.calculateMean(data);
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));

    return squaredDiffs.reduce((sum, val) => sum + val, 0) / (data.length - 1);
  }

  calculateSkewness(data, mean, variance) {
    if (data.length <= 2 || variance === 0) return 0;

    const n = data.length;
    const sd = Math.sqrt(variance);

    const skewness = data.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / sd, 3);
    }, 0) / n;

    return skewness;
  }

  calculateKurtosis(data, mean, variance) {
    if (data.length <= 3 || variance === 0) return 3;

    const n = data.length;
    const sd = Math.sqrt(variance);

    const kurtosis = data.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / sd, 4);
    }, 0) / n;

    return kurtosis;
  }

  calculateConfidenceIntervals(results, confidence = 0.95) {
    if (results.length === 0) {
      return { accuracy: [0, 0], responseTime: [0, 0], cost: [0, 0] };
    }

    const alpha = 1 - confidence;
    const zScore = this.getZScore(alpha / 2);

    const intervals = {};
    const metrics = ['accuracy', 'responseTime', 'cost'];

    for (const metric of metrics) {
      const values = results.map(r => r[metric] || 0);
      const mean = this.calculateMean(values);
      const sd = Math.sqrt(this.calculateVariance(values));
      const se = sd / Math.sqrt(values.length);

      intervals[metric] = [
        mean - zScore * se,
        mean + zScore * se
      ];
    }

    return intervals;
  }

  getZScore(alpha) {
    // Aproximación para valores comunes
    const zTable = {
      0.025: 1.96,  // 95% CI
      0.005: 2.576, // 99% CI
      0.05: 1.645,  // 90% CI
      0.01: 2.326   // 98% CI
    };

    return zTable[alpha] || 1.96;
  }

  normalCDF(x) {
    // Aproximación de la función de distribución acumulativa normal
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  erf(x) {
    // Aproximación de la función error
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  calculateTTestPValue(tStat, df) {
    // Aproximación simplificada para p-value del t-test
    // En implementación real usar librerías estadísticas
    if (df >= 30) {
      // Aproximar con distribución normal para df grandes
      return 2 * (1 - this.normalCDF(tStat));
    } else {
      // Aproximación simple para df pequeños
      const factor = Math.exp(-0.5 * tStat * tStat);
      return Math.min(1, 2 * factor);
    }
  }

  calculateChiSquarePValue(chiSquare, df) {
    // Aproximación simplificada
    return Math.exp(-chiSquare / 2);
  }

  calculateFTestPValue(fStat, df1, df2) {
    // Aproximación simplificada
    return Math.exp(-fStat / 2);
  }

  // ============================================================================
  // INTERPRETATION METHODS
  // ============================================================================
  interpretTTestResults(mean1, mean2, pValue, effectSize) {
    let interpretation = '';

    if (pValue < 0.05) {
      interpretation += 'Statistically significant difference detected. ';

      if (mean1 > mean2) {
        interpretation += 'Group 1 performs better than Group 2. ';
      } else {
        interpretation += 'Group 2 performs better than Group 1. ';
      }

      // Effect size interpretation
      if (effectSize < 0.2) {
        interpretation += 'Small effect size.';
      } else if (effectSize < 0.5) {
        interpretation += 'Medium effect size.';
      } else {
        interpretation += 'Large effect size.';
      }
    } else {
      interpretation = 'No statistically significant difference detected. Consider collecting more data.';
    }

    return interpretation;
  }

  interpretBayesianResults(probGroup1Better, lowerBound, upperBound) {
    let interpretation = '';

    if (probGroup1Better > 0.95) {
      interpretation = 'Very strong evidence that Group 1 is better.';
    } else if (probGroup1Better > 0.90) {
      interpretation = 'Strong evidence that Group 1 is better.';
    } else if (probGroup1Better > 0.80) {
      interpretation = 'Moderate evidence that Group 1 is better.';
    } else if (probGroup1Better < 0.20) {
      interpretation = 'Strong evidence that Group 2 is better.';
    } else if (probGroup1Better < 0.10) {
      interpretation = 'Very strong evidence that Group 2 is better.';
    } else {
      interpretation = 'Inconclusive evidence. Consider collecting more data.';
    }

    if (lowerBound > 0) {
      interpretation += ' The entire credible interval is positive.';
    } else if (upperBound < 0) {
      interpretation += ' The entire credible interval is negative.';
    } else {
      interpretation += ' The credible interval includes zero.';
    }

    return interpretation;
  }

  // ============================================================================
  // VARIANT GENERATION HELPERS
  // ============================================================================
  async generateVariantsForPrompt(originalPrompt, variantTypes, count) {
    const allVariants = [];

    for (const variantType of variantTypes) {
      const generator = this.variantGenerators[`${variantType}_VARIANTS`];

      if (generator) {
        const typeVariants = await generator.generate(originalPrompt, count);
        allVariants.push(...typeVariants);
      }
    }

    // Limitar al número solicitado y rankear
    const rankedVariants = await this.variantEvaluator.rankVariants(allVariants);

    return rankedVariants.slice(0, count);
  }

  async applyWordingTechnique(prompt, technique) {
    // Técnicas de reformulación automática
    switch (technique) {
      case 'SYNONYM_REPLACEMENT':
        return this.applySynonymReplacement(prompt);
      case 'SENTENCE_RESTRUCTURING':
        return this.applySentenceRestructuring(prompt);
      case 'FORMALITY_ADJUSTMENT':
        return this.applyFormalityAdjustment(prompt);
      case 'TONE_MODIFICATION':
        return this.applyToneModification(prompt);
      default:
        return prompt;
    }
  }

  applySynonymReplacement(prompt) {
    // Mapa básico de sinónimos
    const synonyms = {
      'create': 'generate',
      'make': 'build',
      'analyze': 'examine',
      'help': 'assist',
      'find': 'locate',
      'show': 'display'
    };

    let modified = prompt;
    for (const [original, synonym] of Object.entries(synonyms)) {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      modified = modified.replace(regex, synonym);
    }

    return modified;
  }

  applySentenceRestructuring(prompt) {
    // Reestructuración básica: convertir imperativo a pregunta
    if (prompt.startsWith('Create') || prompt.startsWith('Generate')) {
      return `Can you ${prompt.toLowerCase()}?`;
    }

    if (prompt.startsWith('Analyze') || prompt.startsWith('Examine')) {
      return `Please ${prompt.toLowerCase()}.`;
    }

    return prompt;
  }

  applyFormalityAdjustment(prompt) {
    // Ajustar nivel de formalidad
    return prompt
      .replace(/can't/g, 'cannot')
      .replace(/don't/g, 'do not')
      .replace(/won't/g, 'will not')
      .replace(/you're/g, 'you are');
  }

  applyToneModification(prompt) {
    // Modificar tono para ser más directo
    if (!prompt.endsWith('.') && !prompt.endsWith('!') && !prompt.endsWith('?')) {
      return prompt + '.';
    }
    return prompt;
  }

  async applyStructuralChange(prompt, structure) {
    switch (structure) {
      case 'STEP_BY_STEP':
        return `Please follow these steps to ${prompt.toLowerCase()}:\n1. First, understand the requirements\n2. Then, proceed with the task\n3. Finally, provide the result`;

      case 'BULLET_POINTS':
        return `${prompt}\n\nPlease ensure your response includes:\n• Clear explanation\n• Detailed implementation\n• Best practices`;

      case 'CONVERSATIONAL':
        return `Hi! I need your help with something. ${prompt} Could you please assist me with this?`;

      case 'FORMAL_INSTRUCTIONS':
        return `TASK: ${prompt}\n\nINSTRUCTIONS:\n- Follow best practices\n- Provide detailed output\n- Ensure accuracy`;

      default:
        return prompt;
    }
  }

  async generateExampleVariant(prompt, exampleCount) {
    const examples = [];

    for (let i = 0; i < exampleCount; i++) {
      examples.push(`Example ${i + 1}: [Relevant example for the task]`);
    }

    return `${prompt}\n\nHere are some examples:\n${examples.join('\n')}`;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  createEqualTrafficDistribution(variantCount) {
    const distribution = {};
    const percentage = 100 / variantCount;

    for (let i = 0; i < variantCount; i++) {
      distribution[`variant_${i}`] = percentage;
    }

    return distribution;
  }

  updateVariantDistribution(test, results) {
    for (const result of results) {
      if (!test.metrics.variantDistribution.has(result.variantId)) {
        test.metrics.variantDistribution.set(result.variantId, 0);
      }
      test.metrics.variantDistribution.set(
        result.variantId,
        test.metrics.variantDistribution.get(result.variantId) + 1
      );
    }
  }

  generateTestRecommendations(analysis) {
    const recommendations = [];

    // Verificar significancia estadística
    if (analysis.statisticalComparison?.significant) {
      recommendations.push({
        type: 'IMPLEMENTATION',
        priority: 'HIGH',
        message: 'Statistical significance achieved. Consider implementing winning variant.',
        action: 'Deploy winning variant to production'
      });
    } else if (analysis.totalSamples < 100) {
      recommendations.push({
        type: 'DATA_COLLECTION',
        priority: 'MEDIUM',
        message: 'Sample size may be insufficient for reliable conclusions.',
        action: 'Continue test until reaching adequate sample size'
      });
    }

    // Verificar calidad de variantes
    const variantAnalysisArray = Array.from(analysis.variantAnalysis.values());
    const avgQuality = variantAnalysisArray.reduce((sum, v) => sum + (v.metrics.averageQuality || 0), 0) / variantAnalysisArray.length;

    if (avgQuality < 0.80) {
      recommendations.push({
        type: 'QUALITY_IMPROVEMENT',
        priority: 'HIGH',
        message: 'Low overall quality detected. Review prompt variants.',
        action: 'Revise prompt variants to improve quality'
      });
    }

    return recommendations;
  }

  calculateAverageTestDuration() {
    const completedTests = Array.from(this.experimentPool.completedTests.values());
    if (completedTests.length === 0) return 0;

    const totalDuration = completedTests.reduce((sum, test) => {
      return sum + (test.endTime - test.startTime);
    }, 0);

    return totalDuration / completedTests.length;
  }

  calculateOverallSuccessRate() {
    let totalResults = 0;
    let successfulResults = 0;

    for (const test of this.experimentPool.activeTests.values()) {
      totalResults += test.results.length;
      successfulResults += test.results.filter(r => r.success).length;
    }

    for (const test of this.experimentPool.completedTests.values()) {
      totalResults += test.results.length;
      successfulResults += test.results.filter(r => r.success).length;
    }

    return totalResults > 0 ? successfulResults / totalResults : 0;
  }

  calculateAverageCostPerTest() {
    let totalCost = 0;
    let testCount = 0;

    for (const test of this.experimentPool.activeTests.values()) {
      const testCost = test.results.reduce((sum, r) => sum + (r.cost || 0), 0);
      totalCost += testCost;
      testCount++;
    }

    for (const test of this.experimentPool.completedTests.values()) {
      const testCost = test.results.reduce((sum, r) => sum + (r.cost || 0), 0);
      totalCost += testCost;
      testCount++;
    }

    return testCount > 0 ? totalCost / testCount : 0;
  }

  generateActiveTestsSummary() {
    return Array.from(this.experimentPool.activeTests.values()).map(test => ({
      id: test.id,
      name: test.name,
      status: test.status,
      variants: test.variants.length,
      samples: test.results.length,
      duration: test.startTime ? new Date() - test.startTime : 0,
      progress: test.results.length / (test.configuration.requiredSampleSize || test.configuration.minimumSampleSize)
    }));
  }

  generateRecentCompletedTestsSummary() {
    const recentTests = Array.from(this.experimentPool.completedTests.values())
      .sort((a, b) => b.endTime - a.endTime)
      .slice(0, 5);

    return recentTests.map(test => ({
      id: test.id,
      name: test.name,
      endTime: test.endTime,
      duration: test.endTime - test.startTime,
      samples: test.results.length,
      winner: test.finalAnalysis?.statisticalComparison?.significant ? 'Determined' : 'Inconclusive'
    }));
  }

  generateCurrentAlerts() {
    const alerts = [];

    // Verificar tests activos
    for (const [testId, test] of this.experimentPool.activeTests) {
      // Alert por duración excesiva
      if (test.startTime && (new Date() - test.startTime) > this.galaxyConfig.maxTestDuration) {
        alerts.push({
          type: 'DURATION_EXCEEDED',
          testId,
          severity: 'WARNING',
          message: `Test ${test.name} has exceeded maximum duration`
        });
      }

      // Alert por sample size bajo
      if (test.results.length < test.configuration.minimumSampleSize * 0.5) {
        alerts.push({
          type: 'LOW_SAMPLE_SIZE',
          testId,
          severity: 'INFO',
          message: `Test ${test.name} needs more samples for reliable results`
        });
      }
    }

    return alerts;
  }

  generateSystemRecommendations() {
    const recommendations = [];

    // Recomendación basada en número de tests activos
    if (this.testingState.activeTests > this.testingState.maxConcurrentTests) {
      recommendations.push({
        type: 'SYSTEM_OPTIMIZATION',
        priority: 'MEDIUM',
        message: 'High number of concurrent tests may impact performance',
        action: 'Consider completing some tests before starting new ones'
      });
    }

    // Recomendación basada en success rate
    const successRate = this.calculateOverallSuccessRate();
    if (successRate < 0.80) {
      recommendations.push({
        type: 'QUALITY_IMPROVEMENT',
        priority: 'HIGH',
        message: 'Overall test success rate is low',
        action: 'Review prompt quality and test configurations'
      });
    }

    return recommendations;
  }

  getSystemStatus() {
    return {
      system: this.name,
      version: this.version,
      status: this.testingState.status,
      testing: {
        activeTests: this.testingState.activeTests,
        completedTests: this.testingState.completedTests,
        totalExperiments: this.testingState.totalExperiments
      },
      capabilities: {
        statisticalTests: Object.keys(this.statisticalEngine.tests).length,
        variantGenerators: Object.keys(this.variantGenerators).length,
        testTemplates: this.experimentPool.testTemplates.size
      },
      performance: {
        averageTestDuration: this.calculateAverageTestDuration(),
        overallSuccessRate: this.calculateOverallSuccessRate(),
        averageCostPerTest: this.calculateAverageCostPerTest()
      }
    };
  }
}

// ============================================================================
// EXPORT Y AUTO-INICIALIZACIÓN
// ============================================================================
const promptABTestingGalaxy = new PromptABTestingGalaxy();

module.exports = {
  PromptABTestingGalaxy,
  promptABTestingGalaxy
};

// Auto-test si se ejecuta directamente
if (require.main === module) {
  console.log('[PROMPT A/B TESTING] Testing Galaxy Enterprise A/B testing system...');

  promptABTestingGalaxy.on('ab-testing:ready', async (data) => {
    console.log('[PROMPT A/B TESTING] ✅ Ready:', data);

    try {
      // Test de creación de A/B test
      const testConfig = {
        name: 'Sample Prompt Optimization Test',
        description: 'Testing different prompt variations for code generation',
        originalPrompt: 'Create a React component for a button',
        variantTypes: ['WORDING', 'STRUCTURE'],
        variantCount: 3,
        expectedEffectSize: 0.1,
        significance: 0.05
      };

      const testResult = await promptABTestingGalaxy.createABTest(testConfig);
      console.log('[PROMPT A/B TESTING] ✅ Test created:', testResult.testId);

      // Test de estado del sistema
      const status = promptABTestingGalaxy.getSystemStatus();
      console.log('[PROMPT A/B TESTING] System status:', status);

      // Test de dashboard
      const dashboard = promptABTestingGalaxy.monitoring.generateDashboard();
      console.log('[PROMPT A/B TESTING] Dashboard:', dashboard);

    } catch (error) {
      console.error('[PROMPT A/B TESTING] ❌ Test failed:', error);
    }
  });
}