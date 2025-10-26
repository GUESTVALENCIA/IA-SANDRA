/**
 * SANDRA IA GALAXY ENTERPRISE - PROMPT EVALUATOR v7.0
 * Sistema Avanzado de Evaluación de Calidad de Prompts
 * Integración con Multi-Model Coordinator, A/B Testing y ML Analytics
 */

const { EventEmitter } = require('events');
const { performance } = require('perf_hooks');

// Importar ecosistema Sandra IA Galaxy Enterprise
const logger = require('./backend/logger');
const metrics = require('./backend/metrics');
const { guardianProtocol } = require('./guardian-protocol');
const { multiModelCoordinatorGalaxy } = require('./multi-model-coordinator-galaxy');
const { promptABTestingGalaxy } = require('./prompt-ab-testing-galaxy');
const { knowledgeSynthesizerGalaxyEnterprise } = require('./knowledge-synthesizer-galaxy-enterprise');

class PromptEvaluatorGalaxy extends EventEmitter {
  constructor() {
    super();
    this.name = "SANDRA_PROMPT_EVALUATOR_GALAXY";
    this.version = "7.0_GALAXY_ENTERPRISE";
    this.mode = "INTELLIGENT_QUALITY_ASSESSMENT";

    // Estado del evaluador
    this.evaluatorState = {
      status: 'INITIALIZING',
      totalEvaluations: 0,
      activeEvaluations: 0,
      qualityThreshold: 0.85,
      biasThreshold: 0.15,
      performanceThreshold: 2000, // 2 seconds
      costThreshold: 0.50, // $0.50
      lastCalibration: null,
      averageQualityScore: 0
    };

    // Configuración Galaxy Enterprise
    this.galaxyConfig = {
      enableMLEvaluation: true,
      enableSemanticAnalysis: true,
      enableBiasDetection: true,
      enablePerformanceAnalysis: true,
      enableCostAnalysis: true,
      enableContextualEvaluation: true,
      enableMultiDimensionalScoring: true,
      enableRealTimeMonitoring: true,
      calibrationInterval: 24 * 60 * 60 * 1000, // 24 horas
      evaluationBatchSize: 10,
      confidenceThreshold: 0.80
    };

    // Sistema de métricas multidimensional
    this.evaluationMetrics = {
      // Métricas de calidad core
      coreMetrics: {
        'CLARITY': {
          weight: 0.20,
          description: 'Clarity and understandability of prompt',
          evaluators: ['semantic_analyzer', 'readability_checker'],
          target: 0.90
        },
        'SPECIFICITY': {
          weight: 0.18,
          description: 'Specificity and precision of instructions',
          evaluators: ['instruction_analyzer', 'ambiguity_detector'],
          target: 0.85
        },
        'COMPLETENESS': {
          weight: 0.15,
          description: 'Completeness of information and context',
          evaluators: ['context_analyzer', 'completeness_checker'],
          target: 0.88
        },
        'EFFECTIVENESS': {
          weight: 0.20,
          description: 'Effectiveness in achieving desired outcome',
          evaluators: ['outcome_analyzer', 'effectiveness_scorer'],
          target: 0.90
        },
        'CONSISTENCY': {
          weight: 0.12,
          description: 'Consistency across similar contexts',
          evaluators: ['consistency_analyzer', 'variance_detector'],
          target: 0.85
        },
        'SAFETY': {
          weight: 0.15,
          description: 'Safety and bias-free content',
          evaluators: ['bias_detector', 'safety_analyzer'],
          target: 0.95
        }
      },

      // Métricas de rendimiento
      performanceMetrics: {
        'RESPONSE_TIME': {
          weight: 0.30,
          description: 'Time to generate response',
          unit: 'milliseconds',
          target: 2000
        },
        'TOKEN_EFFICIENCY': {
          weight: 0.25,
          description: 'Efficiency in token usage',
          unit: 'tokens_per_task',
          target: 500
        },
        'COST_EFFECTIVENESS': {
          weight: 0.25,
          description: 'Cost per successful response',
          unit: 'dollars',
          target: 0.15
        },
        'SUCCESS_RATE': {
          weight: 0.20,
          description: 'Rate of successful completions',
          unit: 'percentage',
          target: 0.95
        }
      },

      // Métricas de bias y seguridad
      biasMetrics: {
        'GENDER_BIAS': {
          weight: 0.25,
          description: 'Gender-related bias detection',
          target: 0.05 // Low bias target
        },
        'CULTURAL_BIAS': {
          weight: 0.25,
          description: 'Cultural bias detection',
          target: 0.05
        },
        'DEMOGRAPHIC_BIAS': {
          weight: 0.20,
          description: 'Demographic bias detection',
          target: 0.05
        },
        'LINGUISTIC_BIAS': {
          weight: 0.15,
          description: 'Language and dialect bias',
          target: 0.05
        },
        'PROFESSIONAL_BIAS': {
          weight: 0.15,
          description: 'Professional/occupational bias',
          target: 0.05
        }
      }
    };

    // Pool de evaluadores especializados
    this.evaluatorPool = {
      // Evaluadores semánticos
      semanticAnalyzers: new Map(),

      // Evaluadores de bias
      biasDetectors: new Map(),

      // Evaluadores de rendimiento
      performanceAnalyzers: new Map(),

      // Evaluadores contextuales
      contextualAnalyzers: new Map(),

      // Evaluadores ML
      mlEvaluators: new Map()
    };

    // Sistema de scoring multidimensional
    this.scoringSystem = {
      // Algoritmos de scoring
      scoringAlgorithms: new Map(),

      // Pesos adaptativos
      adaptiveWeights: new Map(),

      // Calibración histórica
      calibrationData: new Map(),

      // Benchmarks de calidad
      qualityBenchmarks: new Map()
    };

    // Cache de evaluaciones
    this.evaluationCache = {
      cache: new Map(),
      maxSize: 1000,
      ttl: 60 * 60 * 1000, // 1 hora
      hits: 0,
      misses: 0
    };

    // Sistema de reporting avanzado
    this.reportingSystem = {
      reports: new Map(),
      templates: new Map(),
      insights: new Map(),
      trends: new Map()
    };

    this.initialize();
  }

  async initialize() {
    logger.info('[PROMPT EVALUATOR] Initializing Galaxy Enterprise prompt evaluation system');

    try {
      // 1. Configurar evaluadores especializados
      await this.setupSpecializedEvaluators();

      // 2. Configurar sistema de scoring multidimensional
      await this.setupMultiDimensionalScoring();

      // 3. Configurar detección de bias avanzada
      await this.setupAdvancedBiasDetection();

      // 4. Configurar análisis de rendimiento
      await this.setupPerformanceAnalysis();

      // 5. Configurar evaluación contextual
      await this.setupContextualEvaluation();

      // 6. Integrar con ecosistema Galaxy
      await this.integrateGalaxyEcosystem();

      // 7. Configurar calibración automática
      await this.setupAutoCalibration();

      // 8. Configurar reporting avanzado
      await this.setupAdvancedReporting();

      this.evaluatorState.status = 'GALAXY_ENTERPRISE_ACTIVE';

      logger.info('[PROMPT EVALUATOR] ✅ Galaxy Enterprise prompt evaluation system ACTIVE');

      this.emit('prompt-evaluator:ready', {
        system: this.name,
        version: this.version,
        evaluators: this.getEvaluatorCount(),
        metrics: Object.keys(this.evaluationMetrics.coreMetrics).length
      });

    } catch (error) {
      logger.error('[PROMPT EVALUATOR] Initialization failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // SPECIALIZED EVALUATORS SETUP
  // ============================================================================
  async setupSpecializedEvaluators() {
    logger.info('[PROMPT EVALUATOR] Setting up specialized evaluators');

    // Configurar evaluadores semánticos
    this.evaluatorPool.semanticAnalyzers.set('CLARITY_ANALYZER', {
      id: 'clarity_analyzer',
      name: 'Clarity Semantic Analyzer',
      type: 'SEMANTIC',
      description: 'Analyzes prompt clarity and understandability',

      evaluate: async (prompt, context = {}) => {
        // Análisis de claridad semántica
        const metrics = {
          sentenceComplexity: this.analyzeSentenceComplexity(prompt),
          vocabularyComplexity: this.analyzeVocabularyComplexity(prompt),
          instructionClarity: this.analyzeInstructionClarity(prompt),
          ambiguityLevel: this.detectAmbiguity(prompt)
        };

        // Calcular score de claridad
        const clarityScore = (
          (1 - metrics.sentenceComplexity) * 0.25 +
          (1 - metrics.vocabularyComplexity) * 0.25 +
          metrics.instructionClarity * 0.30 +
          (1 - metrics.ambiguityLevel) * 0.20
        );

        return {
          score: clarityScore,
          metrics,
          confidence: 0.85,
          recommendations: this.generateClarityRecommendations(metrics)
        };
      }
    });

    this.evaluatorPool.semanticAnalyzers.set('SPECIFICITY_ANALYZER', {
      id: 'specificity_analyzer',
      name: 'Specificity Analyzer',
      type: 'SEMANTIC',
      description: 'Analyzes prompt specificity and precision',

      evaluate: async (prompt, context = {}) => {
        const metrics = {
          instructionSpecificity: this.analyzeInstructionSpecificity(prompt),
          contextSpecificity: this.analyzeContextSpecificity(prompt),
          outputSpecification: this.analyzeOutputSpecification(prompt),
          constraintClarity: this.analyzeConstraintClarity(prompt)
        };

        const specificityScore = (
          metrics.instructionSpecificity * 0.30 +
          metrics.contextSpecificity * 0.25 +
          metrics.outputSpecification * 0.25 +
          metrics.constraintClarity * 0.20
        );

        return {
          score: specificityScore,
          metrics,
          confidence: 0.80,
          recommendations: this.generateSpecificityRecommendations(metrics)
        };
      }
    });

    this.evaluatorPool.semanticAnalyzers.set('COMPLETENESS_ANALYZER', {
      id: 'completeness_analyzer',
      name: 'Completeness Analyzer',
      type: 'SEMANTIC',
      description: 'Analyzes prompt completeness and context sufficiency',

      evaluate: async (prompt, context = {}) => {
        const metrics = {
          contextCompleteness: this.analyzeContextCompleteness(prompt, context),
          informationSufficiency: this.analyzeInformationSufficiency(prompt),
          exampleAdequacy: this.analyzeExampleAdequacy(prompt),
          constraintCompleteness: this.analyzeConstraintCompleteness(prompt)
        };

        const completenessScore = (
          metrics.contextCompleteness * 0.30 +
          metrics.informationSufficiency * 0.30 +
          metrics.exampleAdequacy * 0.20 +
          metrics.constraintCompleteness * 0.20
        );

        return {
          score: completenessScore,
          metrics,
          confidence: 0.75,
          recommendations: this.generateCompletenessRecommendations(metrics)
        };
      }
    });

    // Configurar evaluadores de efectividad
    this.evaluatorPool.performanceAnalyzers.set('EFFECTIVENESS_ANALYZER', {
      id: 'effectiveness_analyzer',
      name: 'Effectiveness Analyzer',
      type: 'PERFORMANCE',
      description: 'Analyzes prompt effectiveness in achieving goals',

      evaluate: async (prompt, context = {}, historicalData = []) => {
        const metrics = {
          goalAlignment: this.analyzeGoalAlignment(prompt, context),
          outputQuality: this.predictOutputQuality(prompt, historicalData),
          taskCompletion: this.predictTaskCompletion(prompt, context),
          userSatisfaction: this.predictUserSatisfaction(prompt, historicalData)
        };

        const effectivenessScore = (
          metrics.goalAlignment * 0.30 +
          metrics.outputQuality * 0.30 +
          metrics.taskCompletion * 0.25 +
          metrics.userSatisfaction * 0.15
        );

        return {
          score: effectivenessScore,
          metrics,
          confidence: 0.82,
          predictions: {
            expectedSuccessRate: effectivenessScore,
            estimatedResponseTime: this.estimateResponseTime(prompt),
            estimatedCost: this.estimateCost(prompt)
          },
          recommendations: this.generateEffectivenessRecommendations(metrics)
        };
      }
    });

    logger.info(`[PROMPT EVALUATOR] ✅ Specialized evaluators configured: ${this.getEvaluatorCount()}`);
  }

  // ============================================================================
  // MULTI-DIMENSIONAL SCORING SETUP
  // ============================================================================
  async setupMultiDimensionalScoring() {
    logger.info('[PROMPT EVALUATOR] Setting up multi-dimensional scoring system');

    this.scoringSystem.scoringAlgorithms.set('WEIGHTED_COMPOSITE', {
      id: 'weighted_composite',
      name: 'Weighted Composite Scoring',
      description: 'Combines multiple metrics with adaptive weights',

      calculate: (evaluationResults) => {
        let totalScore = 0;
        let totalWeight = 0;
        const dimensionScores = {};

        // Core quality metrics
        for (const [metricName, metricConfig] of Object.entries(this.evaluationMetrics.coreMetrics)) {
          const result = evaluationResults[metricName.toLowerCase()];
          if (result && result.score !== undefined) {
            const weight = metricConfig.weight;
            totalScore += result.score * weight;
            totalWeight += weight;
            dimensionScores[metricName] = {
              score: result.score,
              weight: weight,
              contribution: result.score * weight
            };
          }
        }

        const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;

        return {
          finalScore,
          dimensionScores,
          weights: this.getCurrentWeights(),
          confidence: this.calculateScoreConfidence(evaluationResults),
          interpretation: this.interpretScore(finalScore)
        };
      }
    });

    this.scoringSystem.scoringAlgorithms.set('ADAPTIVE_BAYESIAN', {
      id: 'adaptive_bayesian',
      name: 'Adaptive Bayesian Scoring',
      description: 'Bayesian scoring with adaptive priors',

      calculate: (evaluationResults, historicalData = []) => {
        // Implementación de scoring Bayesiano adaptativo
        const priors = this.calculateBayesianPriors(historicalData);
        const likelihood = this.calculateLikelihood(evaluationResults);
        const posterior = this.calculatePosterior(priors, likelihood);

        return {
          finalScore: posterior.mean,
          uncertainty: posterior.variance,
          credibleInterval: posterior.credibleInterval,
          confidence: posterior.confidence,
          interpretation: this.interpretBayesianScore(posterior)
        };
      }
    });

    this.scoringSystem.scoringAlgorithms.set('ML_ENSEMBLE', {
      id: 'ml_ensemble',
      name: 'Machine Learning Ensemble',
      description: 'Ensemble of ML models for scoring',

      calculate: async (evaluationResults, context = {}) => {
        // Ensemble de modelos ML para scoring
        const models = [
          'random_forest_scorer',
          'gradient_boosting_scorer',
          'neural_network_scorer'
        ];

        const predictions = [];
        for (const modelId of models) {
          const prediction = await this.runMLModel(modelId, evaluationResults, context);
          predictions.push(prediction);
        }

        // Combinar predicciones
        const ensembleScore = this.combineMLPredictions(predictions);

        return {
          finalScore: ensembleScore.score,
          modelPredictions: predictions,
          ensembleWeight: ensembleScore.weights,
          confidence: ensembleScore.confidence,
          interpretation: this.interpretMLScore(ensembleScore)
        };
      }
    });

    // Configurar pesos adaptativos
    this.setupAdaptiveWeighting();

    logger.info('[PROMPT EVALUATOR] ✅ Multi-dimensional scoring system configured');
  }

  // ============================================================================
  // ADVANCED BIAS DETECTION SETUP
  // ============================================================================
  async setupAdvancedBiasDetection() {
    logger.info('[PROMPT EVALUATOR] Setting up advanced bias detection');

    this.evaluatorPool.biasDetectors.set('GENDER_BIAS_DETECTOR', {
      id: 'gender_bias_detector',
      name: 'Gender Bias Detector',
      type: 'BIAS',
      description: 'Detects gender-related biases in prompts',

      evaluate: async (prompt, context = {}) => {
        const biasMetrics = {
          genderLanguage: this.analyzeGenderLanguage(prompt),
          occupationalBias: this.analyzeOccupationalGenderBias(prompt),
          pronounUsage: this.analyzePronounUsage(prompt),
          stereotypePresence: this.detectGenderStereotypes(prompt)
        };

        const biasScore = Math.max(
          biasMetrics.genderLanguage,
          biasMetrics.occupationalBias,
          biasMetrics.pronounUsage,
          biasMetrics.stereotypePresence
        );

        return {
          biasScore,
          metrics: biasMetrics,
          severity: this.classifyBiasSeverity(biasScore),
          examples: this.findBiasExamples(prompt, 'gender'),
          recommendations: this.generateGenderBiasRecommendations(biasMetrics),
          confidence: 0.90
        };
      }
    });

    this.evaluatorPool.biasDetectors.set('CULTURAL_BIAS_DETECTOR', {
      id: 'cultural_bias_detector',
      name: 'Cultural Bias Detector',
      type: 'BIAS',
      description: 'Detects cultural and ethnic biases',

      evaluate: async (prompt, context = {}) => {
        const biasMetrics = {
          culturalAssumptions: this.analyzeCulturalAssumptions(prompt),
          languageBias: this.analyzeLanguageBias(prompt),
          geographicBias: this.analyzeGeographicBias(prompt),
          religionBias: this.analyzeReligionBias(prompt)
        };

        const biasScore = (
          biasMetrics.culturalAssumptions * 0.30 +
          biasMetrics.languageBias * 0.25 +
          biasMetrics.geographicBias * 0.25 +
          biasMetrics.religionBias * 0.20
        );

        return {
          biasScore,
          metrics: biasMetrics,
          severity: this.classifyBiasSeverity(biasScore),
          examples: this.findBiasExamples(prompt, 'cultural'),
          recommendations: this.generateCulturalBiasRecommendations(biasMetrics),
          confidence: 0.85
        };
      }
    });

    this.evaluatorPool.biasDetectors.set('DEMOGRAPHIC_BIAS_DETECTOR', {
      id: 'demographic_bias_detector',
      name: 'Demographic Bias Detector',
      type: 'BIAS',
      description: 'Detects age, socioeconomic and demographic biases',

      evaluate: async (prompt, context = {}) => {
        const biasMetrics = {
          ageBias: this.analyzeAgeBias(prompt),
          socioeconomicBias: this.analyzeSocioeconomicBias(prompt),
          educationBias: this.analyzeEducationBias(prompt),
          abilityBias: this.analyzeAbilityBias(prompt)
        };

        const biasScore = Math.max(...Object.values(biasMetrics));

        return {
          biasScore,
          metrics: biasMetrics,
          severity: this.classifyBiasSeverity(biasScore),
          examples: this.findBiasExamples(prompt, 'demographic'),
          recommendations: this.generateDemographicBiasRecommendations(biasMetrics),
          confidence: 0.88
        };
      }
    });

    // Configurar sistema de mitigación de bias
    this.setupBiasMitigation();

    logger.info('[PROMPT EVALUATOR] ✅ Advanced bias detection configured');
  }

  // ============================================================================
  // PERFORMANCE ANALYSIS SETUP
  // ============================================================================
  async setupPerformanceAnalysis() {
    logger.info('[PROMPT EVALUATOR] Setting up performance analysis');

    this.evaluatorPool.performanceAnalyzers.set('RESPONSE_TIME_ANALYZER', {
      id: 'response_time_analyzer',
      name: 'Response Time Analyzer',
      type: 'PERFORMANCE',
      description: 'Analyzes and predicts response time performance',

      evaluate: async (prompt, context = {}, historicalData = []) => {
        const features = {
          promptLength: prompt.length,
          complexity: this.calculatePromptComplexity(prompt),
          contextSize: context.contextSize || 0,
          modelType: context.modelType || 'gpt-4',
          taskType: context.taskType || 'general'
        };

        // Predicción basada en características del prompt
        const predictedTime = this.predictResponseTime(features, historicalData);

        return {
          predictedResponseTime: predictedTime.estimate,
          confidence: predictedTime.confidence,
          factors: predictedTime.factors,
          optimization: this.generateTimeOptimizations(features),
          benchmark: this.getResponseTimeBenchmark(context.taskType)
        };
      }
    });

    this.evaluatorPool.performanceAnalyzers.set('TOKEN_EFFICIENCY_ANALYZER', {
      id: 'token_efficiency_analyzer',
      name: 'Token Efficiency Analyzer',
      type: 'PERFORMANCE',
      description: 'Analyzes token usage efficiency',

      evaluate: async (prompt, context = {}) => {
        const tokenMetrics = {
          inputTokens: this.estimateInputTokens(prompt),
          estimatedOutputTokens: this.estimateOutputTokens(prompt, context),
          redundancy: this.analyzeTokenRedundancy(prompt),
          efficiency: this.calculateTokenEfficiency(prompt)
        };

        const optimizations = this.generateTokenOptimizations(prompt, tokenMetrics);

        return {
          metrics: tokenMetrics,
          efficiencyScore: tokenMetrics.efficiency,
          optimizations,
          potentialSavings: optimizations.estimatedSavings,
          recommendations: optimizations.recommendations
        };
      }
    });

    this.evaluatorPool.performanceAnalyzers.set('COST_ANALYZER', {
      id: 'cost_analyzer',
      name: 'Cost Analyzer',
      type: 'PERFORMANCE',
      description: 'Analyzes and optimizes cost efficiency',

      evaluate: async (prompt, context = {}) => {
        const costMetrics = {
          estimatedInputCost: this.estimateInputCost(prompt, context.modelType),
          estimatedOutputCost: this.estimateOutputCost(prompt, context),
          totalEstimatedCost: 0,
          costEfficiencyRatio: 0
        };

        costMetrics.totalEstimatedCost = costMetrics.estimatedInputCost + costMetrics.estimatedOutputCost;
        costMetrics.costEfficiencyRatio = this.calculateCostEfficiency(prompt, costMetrics.totalEstimatedCost);

        const optimizations = this.generateCostOptimizations(prompt, costMetrics, context);

        return {
          metrics: costMetrics,
          optimizations,
          modelRecommendations: optimizations.modelRecommendations,
          potentialSavings: optimizations.potentialSavings
        };
      }
    });

    logger.info('[PROMPT EVALUATOR] ✅ Performance analysis configured');
  }

  // ============================================================================
  // CONTEXTUAL EVALUATION SETUP
  // ============================================================================
  async setupContextualEvaluation() {
    logger.info('[PROMPT EVALUATOR] Setting up contextual evaluation');

    this.evaluatorPool.contextualAnalyzers.set('AGENT_CONTEXT_ANALYZER', {
      id: 'agent_context_analyzer',
      name: 'Agent Context Analyzer',
      type: 'CONTEXTUAL',
      description: 'Analyzes prompt suitability for specific agent types',

      evaluate: async (prompt, context = {}) => {
        const agentCategory = context.agentCategory || 'GENERAL';
        const agentSpecialization = context.agentSpecialization || 'general';

        const contextualMetrics = {
          agentAlignment: this.analyzeAgentAlignment(prompt, agentCategory),
          specializationFit: this.analyzeSpecializationFit(prompt, agentSpecialization),
          contextualClarity: this.analyzeContextualClarity(prompt, context),
          adaptabilityScore: this.analyzeAdaptability(prompt, context)
        };

        const contextualScore = (
          contextualMetrics.agentAlignment * 0.35 +
          contextualMetrics.specializationFit * 0.30 +
          contextualMetrics.contextualClarity * 0.20 +
          contextualMetrics.adaptabilityScore * 0.15
        );

        return {
          score: contextualScore,
          metrics: contextualMetrics,
          agentOptimizations: this.generateAgentOptimizations(prompt, agentCategory),
          contextualRecommendations: this.generateContextualRecommendations(contextualMetrics),
          confidence: 0.85
        };
      }
    });

    this.evaluatorPool.contextualAnalyzers.set('TASK_CONTEXT_ANALYZER', {
      id: 'task_context_analyzer',
      name: 'Task Context Analyzer',
      type: 'CONTEXTUAL',
      description: 'Analyzes prompt effectiveness for specific task types',

      evaluate: async (prompt, context = {}) => {
        const taskType = context.taskType || 'general';
        const complexity = context.complexity || 'medium';

        const taskMetrics = {
          taskAlignment: this.analyzeTaskAlignment(prompt, taskType),
          complexityMatch: this.analyzeComplexityMatch(prompt, complexity),
          instructionalClarity: this.analyzeInstructionalClarity(prompt, taskType),
          successProbability: this.predictTaskSuccess(prompt, context)
        };

        const taskScore = (
          taskMetrics.taskAlignment * 0.30 +
          taskMetrics.complexityMatch * 0.25 +
          taskMetrics.instructionalClarity * 0.25 +
          taskMetrics.successProbability * 0.20
        );

        return {
          score: taskScore,
          metrics: taskMetrics,
          taskOptimizations: this.generateTaskOptimizations(prompt, taskType),
          expectedOutcome: this.predictTaskOutcome(prompt, context),
          confidence: 0.80
        };
      }
    });

    logger.info('[PROMPT EVALUATOR] ✅ Contextual evaluation configured');
  }

  // ============================================================================
  // GALAXY ECOSYSTEM INTEGRATION
  // ============================================================================
  async integrateGalaxyEcosystem() {
    logger.info('[PROMPT EVALUATOR] Integrating with Galaxy ecosystem');

    this.galaxyIntegration = {
      // Integración con Multi-Model Coordinator
      multiModelIntegration: {
        evaluateModelPerformance: async (prompt, modelId, context) => {
          try {
            // Ejecutar evaluación usando modelo específico
            const executionResult = await multiModelCoordinatorGalaxy.executeModelRequest(
              modelId,
              { prompt, systemMessage: 'Evaluate this prompt response.', maxTokens: 1000 },
              context
            );

            // Evaluar resultado
            const evaluation = await this.evaluateResponse(executionResult.response, prompt, context);

            return {
              modelId,
              executionMetrics: {
                responseTime: executionResult.responseTime,
                cost: executionResult.cost,
                tokenCount: executionResult.tokenCount,
                success: executionResult.success
              },
              qualityMetrics: evaluation,
              overallScore: this.calculateOverallScore(executionResult, evaluation),
              timestamp: new Date()
            };

          } catch (error) {
            logger.error(`[PROMPT EVALUATOR] Model performance evaluation failed for ${modelId}:`, error);
            return {
              modelId,
              error: error.message,
              success: false,
              timestamp: new Date()
            };
          }
        },

        // Evaluar múltiples modelos para comparación
        evaluateMultipleModels: async (prompt, modelIds, context) => {
          const evaluations = [];

          for (const modelId of modelIds) {
            const evaluation = await this.galaxyIntegration.multiModelIntegration.evaluateModelPerformance(
              prompt, modelId, context
            );
            evaluations.push(evaluation);
          }

          // Análisis comparativo
          const comparison = this.compareModelEvaluations(evaluations);

          return {
            evaluations,
            comparison,
            recommendation: comparison.bestModel,
            analysis: comparison.analysis
          };
        }
      },

      // Integración con A/B Testing
      abTestingIntegration: {
        evaluateTestVariants: async (testId, variants) => {
          const test = promptABTestingGalaxy.experimentPool.activeTests.get(testId) ||
                       promptABTestingGalaxy.experimentPool.completedTests.get(testId);

          if (!test) {
            throw new Error(`Test not found: ${testId}`);
          }

          const variantEvaluations = [];

          for (const variant of variants) {
            const evaluation = await this.evaluatePrompt(variant.prompt, {
              variantId: variant.id,
              testId: testId,
              testContext: test.configuration
            });

            variantEvaluations.push({
              variantId: variant.id,
              evaluation,
              predictedPerformance: evaluation.predictions
            });
          }

          return {
            testId,
            variantEvaluations,
            qualityRanking: this.rankVariantsByQuality(variantEvaluations),
            recommendations: this.generateTestRecommendations(variantEvaluations)
          };
        },

        // Evaluar resultados de test A/B completado
        evaluateTestResults: async (testId) => {
          const testResults = promptABTestingGalaxy.analyzeTestResults(testId);

          const qualityAnalysis = await this.analyzeTestQuality(testResults);

          return {
            testId,
            statisticalResults: testResults,
            qualityAnalysis,
            recommendations: this.generatePostTestRecommendations(testResults, qualityAnalysis)
          };
        }
      },

      // Integración con Knowledge Synthesizer
      knowledgeIntegration: {
        incorporateKnowledgeSynthesis: async (prompt, context) => {
          try {
            // Obtener síntesis de conocimiento relevante
            const knowledgeSynthesis = await knowledgeSynthesizerGalaxyEnterprise.synthesizeKnowledge({
              query: prompt,
              context: context,
              agentCategory: context.agentCategory,
              synthesisType: 'PROMPT_OPTIMIZATION'
            });

            // Incorporar insights en evaluación
            const enhancedEvaluation = await this.evaluateWithKnowledgeInsights(
              prompt,
              context,
              knowledgeSynthesis
            );

            return enhancedEvaluation;

          } catch (error) {
            logger.warn('[PROMPT EVALUATOR] Knowledge synthesis integration failed:', error);
            // Fallback a evaluación estándar
            return await this.evaluatePrompt(prompt, context);
          }
        }
      }
    };

    logger.info('[PROMPT EVALUATOR] ✅ Galaxy ecosystem integration completed');
  }

  // ============================================================================
  // AUTO-CALIBRATION SETUP
  // ============================================================================
  async setupAutoCalibration() {
    logger.info('[PROMPT EVALUATOR] Setting up auto-calibration system');

    this.calibrationSystem = {
      // Calibración automática periódica
      autoCalibrate: async () => {
        logger.info('[PROMPT EVALUATOR] Starting auto-calibration process');

        try {
          // 1. Recopilar datos de calibración
          const calibrationData = await this.collectCalibrationData();

          // 2. Analizar performance de evaluadores
          const evaluatorPerformance = await this.analyzeEvaluatorPerformance(calibrationData);

          // 3. Ajustar pesos y parámetros
          await this.adjustEvaluatorParameters(evaluatorPerformance);

          // 4. Validar calibración
          const validationResults = await this.validateCalibration();

          // 5. Actualizar estado
          this.evaluatorState.lastCalibration = new Date();

          logger.info('[PROMPT EVALUATOR] ✅ Auto-calibration completed successfully');

          this.emit('calibration:completed', {
            timestamp: this.evaluatorState.lastCalibration,
            performance: evaluatorPerformance,
            validation: validationResults
          });

          return {
            success: true,
            calibrationData,
            performance: evaluatorPerformance,
            validation: validationResults
          };

        } catch (error) {
          logger.error('[PROMPT EVALUATOR] Auto-calibration failed:', error);
          throw error;
        }
      },

      // Recopilar datos para calibración
      collectCalibrationData: async () => {
        const recentEvaluations = Array.from(this.evaluationCache.cache.values())
          .filter(evaluation => {
            const age = new Date() - evaluation.timestamp;
            return age < 7 * 24 * 60 * 60 * 1000; // Últimos 7 días
          });

        return {
          evaluationCount: recentEvaluations.length,
          qualityDistribution: this.analyzeQualityDistribution(recentEvaluations),
          performanceMetrics: this.aggregatePerformanceMetrics(recentEvaluations),
          biasMetrics: this.aggregateBiasMetrics(recentEvaluations)
        };
      },

      // Analizar performance de evaluadores individuales
      analyzeEvaluatorPerformance: async (calibrationData) => {
        const performance = {};

        // Analizar cada evaluador
        for (const [evaluatorId, evaluator] of this.evaluatorPool.semanticAnalyzers) {
          performance[evaluatorId] = await this.analyzeIndividualEvaluatorPerformance(
            evaluatorId,
            calibrationData
          );
        }

        return performance;
      },

      // Ajustar parámetros de evaluadores
      adjustEvaluatorParameters: async (performance) => {
        for (const [evaluatorId, performanceData] of Object.entries(performance)) {
          if (performanceData.accuracy < 0.80) {
            // Ajustar pesos si la precisión es baja
            await this.adjustEvaluatorWeights(evaluatorId, performanceData);
          }

          if (performanceData.consistency < 0.85) {
            // Ajustar parámetros de consistencia
            await this.adjustConsistencyParameters(evaluatorId, performanceData);
          }
        }
      },

      // Validar calibración
      validateCalibration: async () => {
        const testPrompts = this.getCalibrationTestPrompts();
        const validationResults = [];

        for (const testPrompt of testPrompts) {
          const evaluation = await this.evaluatePrompt(testPrompt.prompt, testPrompt.context);
          const expectedScore = testPrompt.expectedScore;
          const actualScore = evaluation.overallScore;

          validationResults.push({
            prompt: testPrompt.id,
            expected: expectedScore,
            actual: actualScore,
            deviation: Math.abs(expectedScore - actualScore),
            within_tolerance: Math.abs(expectedScore - actualScore) < 0.1
          });
        }

        const accuracy = validationResults.filter(r => r.within_tolerance).length / validationResults.length;

        return {
          accuracy,
          validationResults,
          overall: accuracy > 0.85 ? 'PASSED' : 'NEEDS_ADJUSTMENT'
        };
      }
    };

    // Configurar calibración automática periódica
    setInterval(() => {
      this.calibrationSystem.autoCalibrate().catch(error => {
        logger.error('[PROMPT EVALUATOR] Scheduled calibration failed:', error);
      });
    }, this.galaxyConfig.calibrationInterval);

    logger.info('[PROMPT EVALUATOR] ✅ Auto-calibration system configured');
  }

  // ============================================================================
  // ADVANCED REPORTING SETUP
  // ============================================================================
  async setupAdvancedReporting() {
    logger.info('[PROMPT EVALUATOR] Setting up advanced reporting system');

    this.reportingSystem.templates.set('COMPREHENSIVE_EVALUATION', {
      id: 'comprehensive_evaluation',
      name: 'Comprehensive Prompt Evaluation Report',

      generate: (evaluation, prompt, context) => {
        return {
          summary: {
            prompt: prompt.substring(0, 100) + '...',
            overallScore: evaluation.overallScore,
            qualityGrade: this.getQualityGrade(evaluation.overallScore),
            timestamp: new Date(),
            context: context
          },

          qualityAnalysis: {
            coreMetrics: evaluation.coreMetrics,
            strengths: evaluation.strengths || [],
            weaknesses: evaluation.weaknesses || [],
            recommendations: evaluation.recommendations || []
          },

          performanceAnalysis: {
            expectedResponseTime: evaluation.performance?.predictedResponseTime,
            tokenEfficiency: evaluation.performance?.tokenEfficiency,
            costEffectiveness: evaluation.performance?.costEffectiveness,
            optimizations: evaluation.performance?.optimizations
          },

          biasAnalysis: {
            overallBiasScore: evaluation.bias?.overallScore,
            biasBreakdown: evaluation.bias?.breakdown,
            severity: evaluation.bias?.severity,
            mitigationRecommendations: evaluation.bias?.recommendations
          },

          contextualAnalysis: {
            agentFit: evaluation.contextual?.agentFit,
            taskAlignment: evaluation.contextual?.taskAlignment,
            adaptability: evaluation.contextual?.adaptability
          },

          actionableInsights: this.generateActionableInsights(evaluation),

          nextSteps: this.generateNextSteps(evaluation),

          confidenceMetrics: {
            overallConfidence: evaluation.confidence,
            methodologyReliability: evaluation.methodologyReliability,
            dataQuality: evaluation.dataQuality
          }
        };
      }
    });

    this.reportingSystem.templates.set('COMPARATIVE_ANALYSIS', {
      id: 'comparative_analysis',
      name: 'Comparative Prompt Analysis Report',

      generate: (evaluations, comparisonContext) => {
        const sortedEvaluations = evaluations.sort((a, b) => b.overallScore - a.overallScore);

        return {
          summary: {
            totalPrompts: evaluations.length,
            bestPerforming: sortedEvaluations[0],
            averageScore: evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length,
            scoreRange: {
              highest: sortedEvaluations[0].overallScore,
              lowest: sortedEvaluations[sortedEvaluations.length - 1].overallScore
            }
          },

          rankings: {
            byOverallQuality: this.rankByOverallQuality(evaluations),
            byPerformance: this.rankByPerformance(evaluations),
            byBiasScore: this.rankByBias(evaluations),
            byContextualFit: this.rankByContextualFit(evaluations)
          },

          analysis: {
            keyDifferentiators: this.identifyKeyDifferentiators(evaluations),
            commonStrengths: this.identifyCommonStrengths(evaluations),
            commonWeaknesses: this.identifyCommonWeaknesses(evaluations),
            improvementOpportunities: this.identifyImprovementOpportunities(evaluations)
          },

          recommendations: {
            topRecommendation: this.getTopRecommendation(sortedEvaluations),
            alternativeOptions: this.getAlternativeOptions(sortedEvaluations),
            optimizationSuggestions: this.getOptimizationSuggestions(evaluations)
          }
        };
      }
    });

    this.reportingSystem.templates.set('TREND_ANALYSIS', {
      id: 'trend_analysis',
      name: 'Prompt Quality Trend Analysis',

      generate: (historicalEvaluations, timeRange) => {
        const trends = this.analyzeTrends(historicalEvaluations, timeRange);

        return {
          timeRange,
          overview: {
            totalEvaluations: historicalEvaluations.length,
            trendDirection: trends.direction,
            significantChanges: trends.significantChanges
          },

          metrics: {
            qualityTrend: trends.qualityTrend,
            performanceTrend: trends.performanceTrend,
            biasTrend: trends.biasTrend,
            costTrend: trends.costTrend
          },

          insights: {
            improvements: trends.improvements,
            regressions: trends.regressions,
            patterns: trends.patterns,
            anomalies: trends.anomalies
          },

          forecasting: {
            predictedQuality: trends.forecast.quality,
            predictedCost: trends.forecast.cost,
            confidence: trends.forecast.confidence
          },

          recommendations: this.generateTrendRecommendations(trends)
        };
      }
    });

    logger.info('[PROMPT EVALUATOR] ✅ Advanced reporting system configured');
  }

  // ============================================================================
  // PUBLIC API - MAIN EVALUATION METHODS
  // ============================================================================
  async evaluatePrompt(prompt, context = {}) {
    logger.debug('[PROMPT EVALUATOR] Starting prompt evaluation');

    const startTime = performance.now();

    try {
      // 1. Validar entrada
      this.validateInput(prompt, context);

      // 2. Verificar cache
      const cacheKey = this.generateCacheKey(prompt, context);
      const cachedResult = this.evaluationCache.cache.get(cacheKey);

      if (cachedResult && this.isCacheValid(cachedResult)) {
        this.evaluationCache.hits++;
        logger.debug('[PROMPT EVALUATOR] Cache hit for evaluation');
        return cachedResult.evaluation;
      }

      this.evaluationCache.misses++;

      // 3. Ejecutar evaluaciones especializadas
      const evaluationResults = await this.runAllEvaluators(prompt, context);

      // 4. Calcular score multidimensional
      const scoringResult = await this.calculateMultidimensionalScore(evaluationResults);

      // 5. Analizar bias
      const biasAnalysis = await this.runBiasAnalysis(prompt, context);

      // 6. Analizar rendimiento
      const performanceAnalysis = await this.runPerformanceAnalysis(prompt, context);

      // 7. Evaluación contextual
      const contextualAnalysis = await this.runContextualAnalysis(prompt, context);

      // 8. Integrar con Knowledge Synthesizer si está disponible
      let knowledgeEnhancement = null;
      if (this.galaxyConfig.enableMLEvaluation) {
        try {
          knowledgeEnhancement = await this.galaxyIntegration.knowledgeIntegration
            .incorporateKnowledgeSynthesis(prompt, context);
        } catch (error) {
          logger.warn('[PROMPT EVALUATOR] Knowledge enhancement failed, continuing without it:', error);
        }
      }

      // 9. Compilar evaluación final
      const finalEvaluation = this.compileEvaluation({
        prompt,
        context,
        evaluationResults,
        scoring: scoringResult,
        bias: biasAnalysis,
        performance: performanceAnalysis,
        contextual: contextualAnalysis,
        knowledgeEnhancement,
        evaluationTime: performance.now() - startTime
      });

      // 10. Guardar en cache
      this.saveToCache(cacheKey, finalEvaluation);

      // 11. Actualizar métricas del sistema
      this.updateSystemMetrics(finalEvaluation);

      // 12. Emit evento de evaluación completada
      this.emit('evaluation:completed', {
        overallScore: finalEvaluation.overallScore,
        evaluationTime: finalEvaluation.evaluationTime,
        cacheHit: false
      });

      logger.debug('[PROMPT EVALUATOR] ✅ Prompt evaluation completed');

      return finalEvaluation;

    } catch (error) {
      logger.error('[PROMPT EVALUATOR] Evaluation failed:', error);

      this.emit('evaluation:failed', {
        error: error.message,
        prompt: prompt.substring(0, 100),
        context
      });

      throw error;
    }
  }

  async evaluateBatch(prompts, context = {}) {
    logger.info(`[PROMPT EVALUATOR] Starting batch evaluation of ${prompts.length} prompts`);

    const batchSize = this.galaxyConfig.evaluationBatchSize;
    const results = [];

    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const batchPromises = batch.map(prompt =>
        this.evaluatePrompt(prompt, { ...context, batchIndex: i })
      );

      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          logger.error('[PROMPT EVALUATOR] Batch evaluation item failed:', result.reason);
          results.push({
            error: result.reason?.message || 'Unknown error',
            success: false
          });
        }
      }

      // Pausa pequeña entre batches para no sobrecargar
      if (i + batchSize < prompts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    logger.info(`[PROMPT EVALUATOR] ✅ Batch evaluation completed: ${results.length} results`);

    return {
      totalPrompts: prompts.length,
      successfulEvaluations: results.filter(r => !r.error).length,
      failedEvaluations: results.filter(r => r.error).length,
      results,
      aggregateAnalysis: this.aggregateBatchResults(results)
    };
  }

  async comparePrompts(prompts, context = {}) {
    logger.info(`[PROMPT EVALUATOR] Starting comparative analysis of ${prompts.length} prompts`);

    // Evaluar todos los prompts
    const evaluations = [];

    for (let i = 0; i < prompts.length; i++) {
      const evaluation = await this.evaluatePrompt(prompts[i], {
        ...context,
        comparisonIndex: i
      });

      evaluations.push({
        promptIndex: i,
        prompt: prompts[i],
        evaluation
      });
    }

    // Generar análisis comparativo
    const comparison = {
      evaluations,
      ranking: this.rankPrompts(evaluations),
      analysis: this.generateComparativeAnalysis(evaluations),
      recommendations: this.generateComparativeRecommendations(evaluations),
      statisticalAnalysis: this.performStatisticalComparison(evaluations)
    };

    logger.info('[PROMPT EVALUATOR] ✅ Comparative analysis completed');

    return comparison;
  }

  // ============================================================================
  // CORE EVALUATION HELPERS
  // ============================================================================
  async runAllEvaluators(prompt, context) {
    const results = {};

    // Ejecutar evaluadores semánticos
    for (const [evaluatorId, evaluator] of this.evaluatorPool.semanticAnalyzers) {
      try {
        const result = await evaluator.evaluate(prompt, context);
        results[evaluatorId] = result;
      } catch (error) {
        logger.warn(`[PROMPT EVALUATOR] Evaluator ${evaluatorId} failed:`, error);
        results[evaluatorId] = { error: error.message, score: 0 };
      }
    }

    // Ejecutar evaluadores de rendimiento
    for (const [evaluatorId, evaluator] of this.evaluatorPool.performanceAnalyzers) {
      try {
        const result = await evaluator.evaluate(prompt, context);
        results[evaluatorId] = result;
      } catch (error) {
        logger.warn(`[PROMPT EVALUATOR] Performance evaluator ${evaluatorId} failed:`, error);
        results[evaluatorId] = { error: error.message };
      }
    }

    // Ejecutar evaluadores contextuales
    for (const [evaluatorId, evaluator] of this.evaluatorPool.contextualAnalyzers) {
      try {
        const result = await evaluator.evaluate(prompt, context);
        results[evaluatorId] = result;
      } catch (error) {
        logger.warn(`[PROMPT EVALUATOR] Contextual evaluator ${evaluatorId} failed:`, error);
        results[evaluatorId] = { error: error.message, score: 0 };
      }
    }

    return results;
  }

  async calculateMultidimensionalScore(evaluationResults) {
    const algorithm = this.scoringSystem.scoringAlgorithms.get('WEIGHTED_COMPOSITE');

    if (!algorithm) {
      throw new Error('Scoring algorithm not found');
    }

    return algorithm.calculate(evaluationResults);
  }

  async runBiasAnalysis(prompt, context) {
    const biasResults = {};

    for (const [detectorId, detector] of this.evaluatorPool.biasDetectors) {
      try {
        const result = await detector.evaluate(prompt, context);
        biasResults[detectorId] = result;
      } catch (error) {
        logger.warn(`[PROMPT EVALUATOR] Bias detector ${detectorId} failed:`, error);
        biasResults[detectorId] = { error: error.message, biasScore: 0 };
      }
    }

    // Calcular score de bias global
    const biasScores = Object.values(biasResults)
      .filter(result => !result.error)
      .map(result => result.biasScore);

    const overallBiasScore = biasScores.length > 0 ?
      Math.max(...biasScores) : 0;

    return {
      overallScore: overallBiasScore,
      breakdown: biasResults,
      severity: this.classifyBiasSeverity(overallBiasScore),
      recommendations: this.generateBiasRecommendations(biasResults)
    };
  }

  async runPerformanceAnalysis(prompt, context) {
    const performanceResults = {};

    // Ejecutar analizadores de rendimiento
    const performanceAnalyzers = ['response_time_analyzer', 'token_efficiency_analyzer', 'cost_analyzer'];

    for (const analyzerId of performanceAnalyzers) {
      const analyzer = this.evaluatorPool.performanceAnalyzers.get(analyzerId.toUpperCase());
      if (analyzer) {
        try {
          const result = await analyzer.evaluate(prompt, context);
          performanceResults[analyzerId] = result;
        } catch (error) {
          logger.warn(`[PROMPT EVALUATOR] Performance analyzer ${analyzerId} failed:`, error);
          performanceResults[analyzerId] = { error: error.message };
        }
      }
    }

    return {
      predictedResponseTime: performanceResults.response_time_analyzer?.predictedResponseTime,
      tokenEfficiency: performanceResults.token_efficiency_analyzer?.efficiencyScore,
      costEffectiveness: performanceResults.cost_analyzer?.metrics?.costEfficiencyRatio,
      optimizations: this.combineOptimizations(performanceResults),
      breakdown: performanceResults
    };
  }

  async runContextualAnalysis(prompt, context) {
    const contextualResults = {};

    for (const [analyzerId, analyzer] of this.evaluatorPool.contextualAnalyzers) {
      try {
        const result = await analyzer.evaluate(prompt, context);
        contextualResults[analyzerId] = result;
      } catch (error) {
        logger.warn(`[PROMPT EVALUATOR] Contextual analyzer ${analyzerId} failed:`, error);
        contextualResults[analyzerId] = { error: error.message, score: 0 };
      }
    }

    // Compilar análisis contextual
    return {
      agentFit: contextualResults.AGENT_CONTEXT_ANALYZER?.score,
      taskAlignment: contextualResults.TASK_CONTEXT_ANALYZER?.score,
      adaptability: this.calculateAdaptability(contextualResults),
      breakdown: contextualResults
    };
  }

  compileEvaluation(evaluationData) {
    const {
      prompt,
      context,
      evaluationResults,
      scoring,
      bias,
      performance,
      contextual,
      knowledgeEnhancement,
      evaluationTime
    } = evaluationData;

    // Calcular score general
    const overallScore = scoring.finalScore;

    // Identificar fortalezas y debilidades
    const strengths = this.identifyStrengths(evaluationResults, scoring);
    const weaknesses = this.identifyWeaknesses(evaluationResults, scoring);

    // Generar recomendaciones
    const recommendations = this.generateRecommendations(evaluationResults, bias, performance);

    // Calcular confianza general
    const confidence = this.calculateOverallConfidence(evaluationResults);

    const evaluation = {
      // Metadata
      evaluationId: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      evaluationTime,
      prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
      context,

      // Scores principales
      overallScore,
      qualityGrade: this.getQualityGrade(overallScore),
      confidence,

      // Análisis detallado
      coreMetrics: this.extractCoreMetrics(evaluationResults),
      scoring,
      bias,
      performance,
      contextual,

      // Insights
      strengths,
      weaknesses,
      recommendations,

      // Predicciones
      predictions: {
        successProbability: this.predictSuccessProbability(overallScore, confidence),
        expectedPerformance: performance,
        riskFactors: this.identifyRiskFactors(bias, performance, contextual)
      },

      // Mejoras sugeridas
      improvements: this.suggestImprovements(evaluationResults, bias, performance),

      // Datos adicionales
      knowledgeEnhancement,
      rawEvaluationResults: evaluationResults,

      // Metadata de calidad
      methodologyReliability: 0.90,
      dataQuality: this.assessDataQuality(evaluationResults)
    };

    return evaluation;
  }

  // ============================================================================
  // ANÁLISIS Y CÁLCULOS HELPERS
  // ============================================================================
  analyzeSentenceComplexity(prompt) {
    const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

    // Normalizar: >100 chars = alta complejidad, <30 = baja
    return Math.min(1, Math.max(0, (avgLength - 30) / 70));
  }

  analyzeVocabularyComplexity(prompt) {
    const words = prompt.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    const complexWords = words.filter(word => word.length > 6);

    const complexityRatio = complexWords.length / words.length;
    return Math.min(1, complexityRatio * 2); // Normalizar
  }

  analyzeInstructionClarity(prompt) {
    const clarityIndicators = [
      /please/i,
      /specifically/i,
      /exactly/i,
      /step.by.step/i,
      /clearly/i,
      /^(create|generate|write|analyze|explain)/i
    ];

    const clarityScore = clarityIndicators.reduce((score, indicator) => {
      return score + (indicator.test(prompt) ? 0.15 : 0);
    }, 0.1);

    return Math.min(1, clarityScore);
  }

  detectAmbiguity(prompt) {
    const ambiguityIndicators = [
      /maybe/i,
      /perhaps/i,
      /might/i,
      /could be/i,
      /sort of/i,
      /kind of/i,
      /somewhat/i
    ];

    const ambiguityCount = ambiguityIndicators.reduce((count, indicator) => {
      return count + (indicator.test(prompt) ? 1 : 0);
    }, 0);

    return Math.min(1, ambiguityCount / 3); // Normalizar
  }

  analyzeInstructionSpecificity(prompt) {
    const specificityIndicators = [
      /format:/i,
      /output:/i,
      /return:/i,
      /include:/i,
      /must/i,
      /should/i,
      /requirements?:/i
    ];

    const specificityScore = specificityIndicators.reduce((score, indicator) => {
      return score + (indicator.test(prompt) ? 0.15 : 0);
    }, 0.1);

    return Math.min(1, specificityScore);
  }

  analyzeContextSpecificity(prompt) {
    const contextIndicators = [
      /context:/i,
      /background:/i,
      /scenario:/i,
      /situation:/i,
      /environment:/i,
      /for (this|the) (project|task|use case)/i
    ];

    const contextScore = contextIndicators.reduce((score, indicator) => {
      return score + (indicator.test(prompt) ? 0.2 : 0);
    }, 0);

    return Math.min(1, contextScore);
  }

  analyzeOutputSpecification(prompt) {
    const outputSpecifiers = [
      /json/i,
      /format/i,
      /structure/i,
      /template/i,
      /example/i,
      /schema/i
    ];

    const outputScore = outputSpecifiers.reduce((score, specifier) => {
      return score + (specifier.test(prompt) ? 0.2 : 0);
    }, 0);

    return Math.min(1, outputScore);
  }

  analyzeConstraintClarity(prompt) {
    const constraintIndicators = [
      /do not/i,
      /avoid/i,
      /exclude/i,
      /limit/i,
      /maximum/i,
      /minimum/i,
      /constraints?:/i
    ];

    const constraintScore = constraintIndicators.reduce((score, indicator) => {
      return score + (indicator.test(prompt) ? 0.15 : 0);
    }, 0);

    return Math.min(1, constraintScore);
  }

  analyzeContextCompleteness(prompt, context) {
    const contextElements = [
      context.agentCategory ? 0.2 : 0,
      context.taskType ? 0.2 : 0,
      context.expectedOutput ? 0.2 : 0,
      context.constraints ? 0.2 : 0,
      prompt.length > 50 ? 0.2 : 0 // Suficiente información en el prompt
    ];

    return contextElements.reduce((sum, element) => sum + element, 0);
  }

  analyzeInformationSufficiency(prompt) {
    // Verificar si el prompt tiene suficiente información
    const informationIndicators = [
      prompt.length > 20, // Longitud mínima
      /\b(what|how|when|where|why|which)\b/i.test(prompt), // Palabras interrogativas
      /\b(create|generate|analyze|explain|describe)\b/i.test(prompt), // Verbos de acción
      prompt.includes(':') || prompt.includes('?'), // Estructura
      prompt.split(' ').length > 5 // Suficientes palabras
    ];

    const sufficiencyScore = informationIndicators.filter(Boolean).length / informationIndicators.length;
    return sufficiencyScore;
  }

  analyzeExampleAdequacy(prompt) {
    const exampleIndicators = [
      /example/i,
      /for instance/i,
      /such as/i,
      /like:/i,
      /e\.g\./i
    ];

    const hasExamples = exampleIndicators.some(indicator => indicator.test(prompt));

    // Si la tarea es compleja, los ejemplos son más importantes
    const taskComplexity = this.calculatePromptComplexity(prompt);
    const exampleImportance = taskComplexity > 0.7 ? 0.8 : 0.5;

    return hasExamples ? 1.0 : (1.0 - exampleImportance);
  }

  analyzeConstraintCompleteness(prompt) {
    const constraintTypes = [
      /length/i,
      /format/i,
      /style/i,
      /tone/i,
      /audience/i,
      /deadline/i
    ];

    const constraintCount = constraintTypes.filter(type => type.test(prompt)).length;
    return Math.min(1, constraintCount / 3); // Normalizar a máximo 3 constraints
  }

  analyzeGoalAlignment(prompt, context) {
    const taskType = context.taskType || 'general';

    const alignmentScores = {
      'code_generation': this.analyzeCodeGenerationAlignment(prompt),
      'analysis': this.analyzeAnalysisAlignment(prompt),
      'writing': this.analyzeWritingAlignment(prompt),
      'general': this.analyzeGeneralAlignment(prompt)
    };

    return alignmentScores[taskType] || alignmentScores.general;
  }

  analyzeCodeGenerationAlignment(prompt) {
    const codeIndicators = [
      /code/i,
      /function/i,
      /class/i,
      /method/i,
      /algorithm/i,
      /program/i,
      /script/i,
      /(javascript|python|java|c\+\+|react|node)/i
    ];

    const alignmentScore = codeIndicators.reduce((score, indicator) => {
      return score + (indicator.test(prompt) ? 0.15 : 0);
    }, 0);

    return Math.min(1, alignmentScore);
  }

  analyzeAnalysisAlignment(prompt) {
    const analysisIndicators = [
      /analyz/i,
      /evaluat/i,
      /assess/i,
      /review/i,
      /examine/i,
      /study/i,
      /investigat/i
    ];

    const alignmentScore = analysisIndicators.reduce((score, indicator) => {
      return score + (indicator.test(prompt) ? 0.2 : 0);
    }, 0);

    return Math.min(1, alignmentScore);
  }

  analyzeWritingAlignment(prompt) {
    const writingIndicators = [
      /write/i,
      /compose/i,
      /draft/i,
      /create/i,
      /author/i,
      /(article|essay|report|document)/i
    ];

    const alignmentScore = writingIndicators.reduce((score, indicator) => {
      return score + (indicator.test(prompt) ? 0.2 : 0);
    }, 0);

    return Math.min(1, alignmentScore);
  }

  analyzeGeneralAlignment(prompt) {
    // Para tareas generales, verificar estructura básica
    const basicStructure = [
      prompt.length > 10,
      /\b(please|can you|help|assist)\b/i.test(prompt),
      prompt.includes('?') || prompt.includes('.'),
      prompt.trim().length > 0
    ];

    return basicStructure.filter(Boolean).length / basicStructure.length;
  }

  predictOutputQuality(prompt, historicalData) {
    // Predicción basada en características del prompt y datos históricos
    const features = {
      clarity: this.analyzeInstructionClarity(prompt),
      specificity: this.analyzeInstructionSpecificity(prompt),
      completeness: this.analyzeInformationSufficiency(prompt),
      complexity: this.calculatePromptComplexity(prompt)
    };

    // Score base basado en características
    let qualityScore = (
      features.clarity * 0.30 +
      features.specificity * 0.25 +
      features.completeness * 0.25 +
      (1 - features.complexity) * 0.20 // Menor complejidad = mayor calidad esperada
    );

    // Ajustar basado en datos históricos si están disponibles
    if (historicalData && historicalData.length > 0) {
      const avgHistoricalQuality = historicalData.reduce((sum, d) => sum + (d.quality || 0), 0) / historicalData.length;
      qualityScore = (qualityScore * 0.7) + (avgHistoricalQuality * 0.3);
    }

    return qualityScore;
  }

  predictTaskCompletion(prompt, context) {
    const completionFactors = [
      this.analyzeInstructionClarity(prompt) * 0.3,
      this.analyzeInformationSufficiency(prompt) * 0.3,
      (context.agentCategory ? 0.2 : 0), // Agente especializado
      (context.taskType ? 0.2 : 0) // Tipo de tarea definido
    ];

    return completionFactors.reduce((sum, factor) => sum + factor, 0);
  }

  predictUserSatisfaction(prompt, historicalData) {
    // Factores que influyen en satisfacción del usuario
    const satisfactionFactors = {
      clarity: this.analyzeInstructionClarity(prompt),
      specificity: this.analyzeInstructionSpecificity(prompt),
      politeness: this.analyzePoliteness(prompt),
      reasonableness: this.analyzeReasonableness(prompt)
    };

    const baseSatisfaction = (
      satisfactionFactors.clarity * 0.30 +
      satisfactionFactors.specificity * 0.25 +
      satisfactionFactors.politeness * 0.20 +
      satisfactionFactors.reasonableness * 0.25
    );

    // Ajustar con datos históricos
    if (historicalData && historicalData.length > 0) {
      const avgSatisfaction = historicalData.reduce((sum, d) => sum + (d.userSatisfaction || 0.8), 0) / historicalData.length;
      return (baseSatisfaction * 0.6) + (avgSatisfaction * 0.4);
    }

    return baseSatisfaction;
  }

  analyzePoliteness(prompt) {
    const politenessIndicators = [
      /please/i,
      /thank you/i,
      /could you/i,
      /would you/i,
      /if possible/i,
      /kindly/i
    ];

    const politenessScore = politenessIndicators.reduce((score, indicator) => {
      return score + (indicator.test(prompt) ? 0.2 : 0);
    }, 0.2); // Base politeness score

    return Math.min(1, politenessScore);
  }

  analyzeReasonableness(prompt) {
    // Verificar si la solicitud es razonable
    const unreasonableIndicators = [
      /do everything/i,
      /solve all/i,
      /unlimited/i,
      /infinite/i,
      /impossible/i,
      prompt.length > 2000 // Prompts excesivamente largos
    ];

    const hasUnreasonableElements = unreasonableIndicators.some(indicator =>
      typeof indicator === 'object' ? indicator.test(prompt) : indicator
    );

    return hasUnreasonableElements ? 0.3 : 0.9;
  }

  calculatePromptComplexity(prompt) {
    const complexityFactors = [
      prompt.length / 1000, // Factor de longitud
      (prompt.match(/\b\w{8,}\b/g) || []).length / 10, // Palabras largas
      (prompt.match(/[,;:()]/g) || []).length / 10, // Puntuación compleja
      (prompt.split(/[.!?]+/).length - 1) / 5 // Número de oraciones
    ];

    const complexity = complexityFactors.reduce((sum, factor) => sum + Math.min(factor, 1), 0) / complexityFactors.length;
    return Math.min(1, complexity);
  }

  estimateResponseTime(features) {
    // Estimación basada en características del prompt
    const baseTime = 1500; // 1.5 segundos base

    const complexityMultiplier = 1 + (features.complexity * 0.8);
    const lengthMultiplier = 1 + (features.promptLength / 2000);
    const contextMultiplier = 1 + (features.contextSize / 10000);

    const estimatedTime = baseTime * complexityMultiplier * lengthMultiplier * contextMultiplier;

    return {
      estimate: Math.round(estimatedTime),
      confidence: 0.75,
      factors: {
        complexity: complexityMultiplier,
        length: lengthMultiplier,
        context: contextMultiplier
      }
    };
  }

  estimateInputTokens(prompt) {
    // Estimación aproximada: ~4 caracteres por token
    return Math.ceil(prompt.length / 4);
  }

  estimateOutputTokens(prompt, context) {
    const taskType = context.taskType || 'general';

    const outputEstimates = {
      'code_generation': 200,
      'analysis': 300,
      'writing': 250,
      'simple_response': 50,
      'general': 150
    };

    const baseTokens = outputEstimates[taskType] || outputEstimates.general;

    // Ajustar basado en complejidad del prompt
    const complexity = this.calculatePromptComplexity(prompt);
    const adjustedTokens = baseTokens * (1 + complexity * 0.5);

    return Math.round(adjustedTokens);
  }

  analyzeTokenRedundancy(prompt) {
    const words = prompt.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);

    const redundancyRatio = 1 - (uniqueWords.size / words.length);
    return redundancyRatio;
  }

  calculateTokenEfficiency(prompt) {
    const redundancy = this.analyzeTokenRedundancy(prompt);
    const clarity = this.analyzeInstructionClarity(prompt);
    const specificity = this.analyzeInstructionSpecificity(prompt);

    // Eficiencia = alta claridad y especificidad con baja redundancia
    const efficiency = (clarity + specificity) / 2 * (1 - redundancy);
    return efficiency;
  }

  estimateInputCost(prompt, modelType = 'gpt-4') {
    const inputTokens = this.estimateInputTokens(prompt);

    const costPerThousandTokens = {
      'gpt-4-turbo': 0.01,
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.001,
      'claude-3-5-sonnet': 0.003,
      'claude-3-haiku': 0.00025
    };

    const cost = (inputTokens / 1000) * (costPerThousandTokens[modelType] || 0.01);
    return cost;
  }

  estimateOutputCost(prompt, context) {
    const outputTokens = this.estimateOutputTokens(prompt, context);
    const modelType = context.modelType || 'gpt-4';

    const outputCostPerThousandTokens = {
      'gpt-4-turbo': 0.03,
      'gpt-4': 0.06,
      'gpt-3.5-turbo': 0.002,
      'claude-3-5-sonnet': 0.015,
      'claude-3-haiku': 0.00125
    };

    const cost = (outputTokens / 1000) * (outputCostPerThousandTokens[modelType] || 0.03);
    return cost;
  }

  calculateCostEfficiency(prompt, totalCost) {
    const promptValue = this.calculatePromptValue(prompt);
    const efficiency = promptValue / Math.max(totalCost, 0.001);

    return Math.min(2, efficiency); // Cap at 2x efficiency
  }

  calculatePromptValue(prompt) {
    // Valor estimado basado en claridad, especificidad y completitud
    const clarity = this.analyzeInstructionClarity(prompt);
    const specificity = this.analyzeInstructionSpecificity(prompt);
    const completeness = this.analyzeInformationSufficiency(prompt);

    const value = (clarity + specificity + completeness) / 3;
    return value;
  }

  // ============================================================================
  // BIAS DETECTION METHODS
  // ============================================================================
  analyzeGenderLanguage(prompt) {
    const genderBiasTerms = [
      /\b(he|his|him)\b(?!\s+(or|\/)\s+(she|her))/gi,
      /\b(she|her|hers)\b(?!\s+(or|\/)\s+(he|his|him))/gi,
      /\b(man|men)\b(?!\s+(and|or|\/)\s+(woman|women))/gi,
      /\b(woman|women)\b(?!\s+(and|or|\/)\s+(man|men))/gi
    ];

    let biasScore = 0;
    for (const pattern of genderBiasTerms) {
      const matches = prompt.match(pattern) || [];
      biasScore += matches.length * 0.1;
    }

    return Math.min(1, biasScore);
  }

  analyzeOccupationalGenderBias(prompt) {
    const maleStereotypedJobs = /\b(engineer|developer|ceo|manager|doctor|lawyer|pilot)\b/gi;
    const femaleStereotypedJobs = /\b(nurse|teacher|secretary|assistant|receptionist)\b/gi;

    const maleJobMatches = prompt.match(maleStereotypedJobs) || [];
    const femaleJobMatches = prompt.match(femaleStereotypedJobs) || [];

    // Verificar si hay asunciones de género con trabajos
    const genderAssumptions = [
      /\b(male|man)\s+(engineer|developer|ceo)/gi,
      /\b(female|woman)\s+(nurse|teacher|secretary)/gi
    ];

    let biasScore = 0;
    for (const pattern of genderAssumptions) {
      const matches = prompt.match(pattern) || [];
      biasScore += matches.length * 0.3;
    }

    return Math.min(1, biasScore);
  }

  analyzePronounUsage(prompt) {
    const exclusiveMalePronouns = prompt.match(/\bhe\b(?!\s+(or|\/)\s+she)/gi) || [];
    const exclusiveFemalePronouns = prompt.match(/\bshe\b(?!\s+(or|\/)\s+he)/gi) || [];

    const totalExclusivePronouns = exclusiveMalePronouns.length + exclusiveFemalePronouns.length;
    const totalPronouns = (prompt.match(/\b(he|she|his|her|him)\b/gi) || []).length;

    if (totalPronouns === 0) return 0;

    const biasRatio = totalExclusivePronouns / totalPronouns;
    return biasRatio;
  }

  detectGenderStereotypes(prompt) {
    const stereotypePatterns = [
      /women are (more|better at|naturally)/gi,
      /men are (more|better at|naturally)/gi,
      /typical (male|female) (behavior|trait|characteristic)/gi,
      /(naturally|biologically) (masculine|feminine)/gi
    ];

    let stereotypeCount = 0;
    for (const pattern of stereotypePatterns) {
      const matches = prompt.match(pattern) || [];
      stereotypeCount += matches.length;
    }

    return Math.min(1, stereotypeCount * 0.5);
  }

  analyzeCulturalAssumptions(prompt) {
    const culturalAssumptions = [
      /everyone (knows|understands|celebrates)/gi,
      /obviously|of course|naturally/gi,
      /normal (people|families|behavior)/gi,
      /standard (practice|procedure|way)/gi
    ];

    let assumptionScore = 0;
    for (const pattern of culturalAssumptions) {
      const matches = prompt.match(pattern) || [];
      assumptionScore += matches.length * 0.2;
    }

    return Math.min(1, assumptionScore);
  }

  analyzeLanguageBias(prompt) {
    // Detectar bias hacia inglés o culturas angloparlantes
    const englishCentricTerms = [
      /in english/gi,
      /american (way|style|approach)/gi,
      /western (culture|values|perspective)/gi,
      /first world/gi
    ];

    let languageBias = 0;
    for (const pattern of englishCentricTerms) {
      const matches = prompt.match(pattern) || [];
      languageBias += matches.length * 0.3;
    }

    return Math.min(1, languageBias);
  }

  analyzeGeographicBias(prompt) {
    const geographicBias = [
      /in america|in the us|in usa/gi,
      /american (companies|businesses|standards)/gi,
      /global (which means american)/gi
    ];

    let geoScore = 0;
    for (const pattern of geographicBias) {
      const matches = prompt.match(pattern) || [];
      geoScore += matches.length * 0.3;
    }

    return Math.min(1, geoScore);
  }

  analyzeReligionBias(prompt) {
    const religiousBias = [
      /christian (values|principles|way)/gi,
      /biblical|scripture|godly/gi,
      /heathen|pagan|infidel/gi,
      /blessed|divine intervention/gi
    ];

    let religionScore = 0;
    for (const pattern of religiousBias) {
      const matches = prompt.match(pattern) || [];
      religionScore += matches.length * 0.4;
    }

    return Math.min(1, religionScore);
  }

  analyzeAgeBias(prompt) {
    const ageBias = [
      /young people (are|don't|can't)/gi,
      /old people (are|can't|don't)/gi,
      /millennials (are|always|never)/gi,
      /boomers (are|always|never)/gi
    ];

    let ageScore = 0;
    for (const pattern of ageBias) {
      const matches = prompt.match(pattern) || [];
      ageScore += matches.length * 0.3;
    }

    return Math.min(1, ageScore);
  }

  analyzeSocioeconomicBias(prompt) {
    const socioeconomicBias = [
      /poor people (are|always|never)/gi,
      /rich people (deserve|are|always)/gi,
      /welfare (recipients|people)/gi,
      /privileged (background|upbringing)/gi
    ];

    let socioScore = 0;
    for (const pattern of socioeconomicBias) {
      const matches = prompt.match(pattern) || [];
      socioScore += matches.length * 0.4;
    }

    return Math.min(1, socioScore);
  }

  analyzeEducationBias(prompt) {
    const educationBias = [
      /college (educated|graduates) are/gi,
      /uneducated (people|masses)/gi,
      /ivy league|prestigious university/gi,
      /educated (people|individuals) know/gi
    ];

    let eduScore = 0;
    for (const pattern of educationBias) {
      const matches = prompt.match(pattern) || [];
      eduScore += matches.length * 0.3;
    }

    return Math.min(1, eduScore);
  }

  analyzeAbilityBias(prompt) {
    const abilityBias = [
      /normal people can/gi,
      /disabled (people|individuals) can't/gi,
      /able-bodied/gi,
      /handicapped|retarded|crippled/gi
    ];

    let abilityScore = 0;
    for (const pattern of abilityBias) {
      const matches = prompt.match(pattern) || [];
      abilityScore += matches.length * 0.5;
    }

    return Math.min(1, abilityScore);
  }

  classifyBiasSeverity(biasScore) {
    if (biasScore < 0.1) return 'MINIMAL';
    if (biasScore < 0.3) return 'LOW';
    if (biasScore < 0.5) return 'MODERATE';
    if (biasScore < 0.7) return 'HIGH';
    return 'CRITICAL';
  }

  findBiasExamples(prompt, biasType) {
    // Retornar ejemplos específicos de bias encontrados
    const examples = [];

    switch (biasType) {
      case 'gender':
        const genderExamples = prompt.match(/\b(he|his|him)\b(?!\s+(or|\/)\s+(she|her))/gi) || [];
        examples.push(...genderExamples.slice(0, 3));
        break;
      case 'cultural':
        const culturalExamples = prompt.match(/everyone (knows|understands|celebrates)/gi) || [];
        examples.push(...culturalExamples.slice(0, 3));
        break;
      case 'demographic':
        const demoExamples = prompt.match(/young people (are|don't|can't)/gi) || [];
        examples.push(...demoExamples.slice(0, 3));
        break;
    }

    return examples;
  }

  // ============================================================================
  // UTILITY AND HELPER METHODS
  // ============================================================================
  validateInput(prompt, context) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt must be a non-empty string');
    }

    if (prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    if (prompt.length > 10000) {
      throw new Error('Prompt too long (max 10000 characters)');
    }

    if (context && typeof context !== 'object') {
      throw new Error('Context must be an object');
    }
  }

  generateCacheKey(prompt, context) {
    const contextStr = JSON.stringify(context);
    const combinedStr = prompt + contextStr;

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < combinedStr.length; i++) {
      const char = combinedStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `eval_${Math.abs(hash)}`;
  }

  isCacheValid(cachedResult) {
    const age = new Date() - cachedResult.timestamp;
    return age < this.evaluationCache.ttl;
  }

  saveToCache(cacheKey, evaluation) {
    // Limpiar cache si está lleno
    if (this.evaluationCache.cache.size >= this.evaluationCache.maxSize) {
      const oldestKey = this.evaluationCache.cache.keys().next().value;
      this.evaluationCache.cache.delete(oldestKey);
    }

    this.evaluationCache.cache.set(cacheKey, {
      evaluation,
      timestamp: new Date()
    });
  }

  updateSystemMetrics(evaluation) {
    this.evaluatorState.totalEvaluations++;

    if (this.evaluatorState.totalEvaluations === 1) {
      this.evaluatorState.averageQualityScore = evaluation.overallScore;
    } else {
      this.evaluatorState.averageQualityScore = (
        (this.evaluatorState.averageQualityScore * (this.evaluatorState.totalEvaluations - 1) +
         evaluation.overallScore) / this.evaluatorState.totalEvaluations
      );
    }
  }

  getEvaluatorCount() {
    return (
      this.evaluatorPool.semanticAnalyzers.size +
      this.evaluatorPool.biasDetectors.size +
      this.evaluatorPool.performanceAnalyzers.size +
      this.evaluatorPool.contextualAnalyzers.size
    );
  }

  getCurrentWeights() {
    return Object.fromEntries(
      Object.entries(this.evaluationMetrics.coreMetrics).map(([key, metric]) => [key, metric.weight])
    );
  }

  calculateScoreConfidence(evaluationResults) {
    const successfulEvaluations = Object.values(evaluationResults).filter(result => !result.error);
    const totalEvaluations = Object.values(evaluationResults).length;

    if (totalEvaluations === 0) return 0;

    const successRate = successfulEvaluations.length / totalEvaluations;
    const avgConfidence = successfulEvaluations.reduce((sum, result) => sum + (result.confidence || 0.5), 0) / successfulEvaluations.length;

    return (successRate * 0.5) + (avgConfidence * 0.5);
  }

  interpretScore(score) {
    if (score >= 0.90) return 'EXCELLENT';
    if (score >= 0.80) return 'GOOD';
    if (score >= 0.70) return 'FAIR';
    if (score >= 0.60) return 'POOR';
    return 'CRITICAL';
  }

  getQualityGrade(score) {
    if (score >= 0.95) return 'A+';
    if (score >= 0.90) return 'A';
    if (score >= 0.85) return 'A-';
    if (score >= 0.80) return 'B+';
    if (score >= 0.75) return 'B';
    if (score >= 0.70) return 'B-';
    if (score >= 0.65) return 'C+';
    if (score >= 0.60) return 'C';
    if (score >= 0.55) return 'C-';
    if (score >= 0.50) return 'D';
    return 'F';
  }

  extractCoreMetrics(evaluationResults) {
    const coreMetrics = {};

    for (const [metricName, metricConfig] of Object.entries(this.evaluationMetrics.coreMetrics)) {
      const evaluatorResult = evaluationResults[metricName.toLowerCase() + '_analyzer'];
      if (evaluatorResult && !evaluatorResult.error) {
        coreMetrics[metricName] = {
          score: evaluatorResult.score,
          weight: metricConfig.weight,
          target: metricConfig.target,
          status: evaluatorResult.score >= metricConfig.target ? 'MEETS_TARGET' : 'BELOW_TARGET'
        };
      }
    }

    return coreMetrics;
  }

  identifyStrengths(evaluationResults, scoring) {
    const strengths = [];

    for (const [dimension, dimensionData] of Object.entries(scoring.dimensionScores || {})) {
      if (dimensionData.score > 0.85) {
        strengths.push({
          dimension,
          score: dimensionData.score,
          description: this.getStrengthDescription(dimension, dimensionData.score)
        });
      }
    }

    return strengths;
  }

  identifyWeaknesses(evaluationResults, scoring) {
    const weaknesses = [];

    for (const [dimension, dimensionData] of Object.entries(scoring.dimensionScores || {})) {
      if (dimensionData.score < 0.65) {
        weaknesses.push({
          dimension,
          score: dimensionData.score,
          description: this.getWeaknessDescription(dimension, dimensionData.score),
          severity: dimensionData.score < 0.45 ? 'HIGH' : 'MEDIUM'
        });
      }
    }

    return weaknesses;
  }

  getStrengthDescription(dimension, score) {
    const descriptions = {
      'CLARITY': 'Prompt is clear and easy to understand',
      'SPECIFICITY': 'Instructions are specific and well-defined',
      'COMPLETENESS': 'All necessary information is provided',
      'EFFECTIVENESS': 'Likely to achieve desired outcomes',
      'CONSISTENCY': 'Consistent structure and style',
      'SAFETY': 'Free from bias and safety concerns'
    };

    return descriptions[dimension] || `${dimension} performs well`;
  }

  getWeaknessDescription(dimension, score) {
    const descriptions = {
      'CLARITY': 'Prompt could be clearer and more understandable',
      'SPECIFICITY': 'Instructions need to be more specific',
      'COMPLETENESS': 'Missing important information or context',
      'EFFECTIVENESS': 'May not achieve desired outcomes effectively',
      'CONSISTENCY': 'Inconsistent structure or conflicting instructions',
      'SAFETY': 'Contains potential bias or safety concerns'
    };

    return descriptions[dimension] || `${dimension} needs improvement`;
  }

  generateRecommendations(evaluationResults, bias, performance) {
    const recommendations = [];

    // Recomendaciones basadas en debilidades
    for (const [evaluatorId, result] of Object.entries(evaluationResults)) {
      if (result.recommendations) {
        recommendations.push(...result.recommendations);
      }
    }

    // Recomendaciones de bias
    if (bias && bias.recommendations) {
      recommendations.push(...bias.recommendations);
    }

    // Recomendaciones de rendimiento
    if (performance && performance.optimizations) {
      recommendations.push(...performance.optimizations);
    }

    // Deduplicar y priorizar
    return this.prioritizeRecommendations(recommendations);
  }

  prioritizeRecommendations(recommendations) {
    // Eliminar duplicados y priorizar por impacto
    const uniqueRecommendations = recommendations.filter((rec, index, arr) =>
      arr.findIndex(r => r.type === rec.type && r.message === rec.message) === index
    );

    // Ordenar por prioridad
    const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };

    return uniqueRecommendations.sort((a, b) => {
      const priorityA = priorityOrder[a.priority] || 1;
      const priorityB = priorityOrder[b.priority] || 1;
      return priorityB - priorityA;
    }).slice(0, 10); // Limitar a top 10
  }

  calculateOverallConfidence(evaluationResults) {
    const confidenceValues = Object.values(evaluationResults)
      .filter(result => !result.error && result.confidence !== undefined)
      .map(result => result.confidence);

    if (confidenceValues.length === 0) return 0.5;

    return confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length;
  }

  predictSuccessProbability(overallScore, confidence) {
    // Combinar score de calidad con confianza para predecir éxito
    return (overallScore * 0.7) + (confidence * 0.3);
  }

  identifyRiskFactors(bias, performance, contextual) {
    const risks = [];

    if (bias && bias.overallScore > 0.3) {
      risks.push({
        type: 'BIAS_RISK',
        severity: bias.severity,
        score: bias.overallScore,
        description: 'High bias score detected'
      });
    }

    if (performance && performance.predictedResponseTime > 5000) {
      risks.push({
        type: 'PERFORMANCE_RISK',
        severity: 'MEDIUM',
        value: performance.predictedResponseTime,
        description: 'High response time predicted'
      });
    }

    if (contextual && contextual.agentFit < 0.6) {
      risks.push({
        type: 'CONTEXT_RISK',
        severity: 'LOW',
        score: contextual.agentFit,
        description: 'Poor fit for specified agent category'
      });
    }

    return risks;
  }

  suggestImprovements(evaluationResults, bias, performance) {
    const improvements = [];

    // Mejoras basadas en evaluaciones
    for (const [evaluatorId, result] of Object.entries(evaluationResults)) {
      if (result.score < 0.7 && result.recommendations) {
        improvements.push(...result.recommendations);
      }
    }

    // Mejoras específicas de bias
    if (bias && bias.overallScore > 0.2) {
      improvements.push({
        type: 'BIAS_MITIGATION',
        priority: 'HIGH',
        description: 'Review and revise prompt to reduce bias',
        specificActions: bias.recommendations || []
      });
    }

    // Mejoras de rendimiento
    if (performance && performance.optimizations) {
      improvements.push({
        type: 'PERFORMANCE_OPTIMIZATION',
        priority: 'MEDIUM',
        description: 'Optimize prompt for better performance',
        specificActions: performance.optimizations
      });
    }

    return improvements.slice(0, 8); // Limitar a 8 mejoras principales
  }

  assessDataQuality(evaluationResults) {
    const totalEvaluators = Object.keys(evaluationResults).length;
    const successfulEvaluators = Object.values(evaluationResults).filter(r => !r.error).length;

    if (totalEvaluators === 0) return 0;

    const successRate = successfulEvaluators / totalEvaluators;

    // Calidad de datos basada en tasa de éxito y cobertura
    if (successRate >= 0.95) return 1.0;
    if (successRate >= 0.85) return 0.9;
    if (successRate >= 0.75) return 0.8;
    if (successRate >= 0.65) return 0.7;
    return 0.6;
  }

  getSystemStatus() {
    return {
      system: this.name,
      version: this.version,
      status: this.evaluatorState.status,
      evaluations: {
        total: this.evaluatorState.totalEvaluations,
        active: this.evaluatorState.activeEvaluations,
        averageScore: this.evaluatorState.averageQualityScore
      },
      evaluators: {
        semantic: this.evaluatorPool.semanticAnalyzers.size,
        bias: this.evaluatorPool.biasDetectors.size,
        performance: this.evaluatorPool.performanceAnalyzers.size,
        contextual: this.evaluatorPool.contextualAnalyzers.size,
        total: this.getEvaluatorCount()
      },
      cache: {
        size: this.evaluationCache.cache.size,
        hits: this.evaluationCache.hits,
        misses: this.evaluationCache.misses,
        hitRate: this.evaluationCache.hits / (this.evaluationCache.hits + this.evaluationCache.misses)
      },
      thresholds: {
        quality: this.evaluatorState.qualityThreshold,
        bias: this.evaluatorState.biasThreshold,
        performance: this.evaluatorState.performanceThreshold,
        cost: this.evaluatorState.costThreshold
      },
      lastCalibration: this.evaluatorState.lastCalibration
    };
  }
}

// ============================================================================
// EXPORT Y AUTO-INICIALIZACIÓN
// ============================================================================
const promptEvaluatorGalaxy = new PromptEvaluatorGalaxy();

module.exports = {
  PromptEvaluatorGalaxy,
  promptEvaluatorGalaxy
};

// Auto-test si se ejecuta directamente
if (require.main === module) {
  console.log('[PROMPT EVALUATOR] Testing Galaxy Enterprise prompt evaluation system...');

  promptEvaluatorGalaxy.on('prompt-evaluator:ready', async (data) => {
    console.log('[PROMPT EVALUATOR] ✅ Ready:', data);

    try {
      // Test de evaluación de prompt
      const testPrompt = 'Create a React component for a button with click handling and proper styling';
      const testContext = {
        agentCategory: 'DEVELOPMENT_EXPERTS',
        taskType: 'code_generation',
        expectedOutput: 'React component code'
      };

      console.log('[PROMPT EVALUATOR] Testing prompt evaluation...');
      const evaluation = await promptEvaluatorGalaxy.evaluatePrompt(testPrompt, testContext);

      console.log('[PROMPT EVALUATOR] ✅ Evaluation completed:', {
        overallScore: evaluation.overallScore,
        qualityGrade: evaluation.qualityGrade,
        confidence: evaluation.confidence,
        evaluationTime: evaluation.evaluationTime
      });

      // Test de estado del sistema
      const status = promptEvaluatorGalaxy.getSystemStatus();
      console.log('[PROMPT EVALUATOR] System status:', status);

    } catch (error) {
      console.error('[PROMPT EVALUATOR] ❌ Test failed:', error);
    }
  });
}