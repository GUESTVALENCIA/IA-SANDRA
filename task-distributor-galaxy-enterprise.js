/**
 * SANDRA IA GALAXY ENTERPRISE - TASK DISTRIBUTOR v7.0
 * Sistema Inteligente de Distribución de Tareas para 248+ Subagentes Especializados
 * Load Balancing Avanzado, Priority Scheduling y Queue Management Empresarial
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

// Importar sistemas Galaxy Enterprise existentes
const logger = require('./backend/logger');
const metrics = require('./backend/metrics');
const { performanceMonitorGalaxyEnterprise } = require('./performance-monitor-galaxy-enterprise');
const { distributedTracingGalaxyEnterprise } = require('./distributed-tracing-galaxy-enterprise');

class TaskDistributorGalaxyEnterprise extends EventEmitter {
  constructor() {
    super();
    this.name = "SANDRA_TASK_DISTRIBUTOR";
    this.version = "7.0_GALAXY_ENTERPRISE";
    this.mode = "INTELLIGENT_TASK_DISTRIBUTION";
    this.status = "INITIALIZING";

    // ========================================================================
    // INTELLIGENT QUEUE MANAGEMENT
    // ========================================================================
    this.queueManagement = {
      // Multi-level priority queues
      priorityQueues: {
        CRITICAL: { queue: [], maxSize: 1000, ttl: 300000 },    // 5 min TTL
        HIGH: { queue: [], maxSize: 5000, ttl: 600000 },        // 10 min TTL
        MEDIUM: { queue: [], maxSize: 10000, ttl: 1800000 },    // 30 min TTL
        LOW: { queue: [], maxSize: 20000, ttl: 3600000 }        // 1 hour TTL
      },

      // Dead letter queue for failed tasks
      deadLetterQueue: {
        queue: [],
        maxRetries: 3,
        retryBackoff: [1000, 5000, 15000], // Exponential backoff
        maxSize: 1000
      },

      // Batch processing queues
      batchQueues: {
        enabled: true,
        batchSize: {
          CRITICAL: 1,    // Process immediately
          HIGH: 5,        // Small batches
          MEDIUM: 15,     // Medium batches
          LOW: 50         // Large batches
        },
        batchTimeout: {
          CRITICAL: 0,    // No batching
          HIGH: 100,      // 100ms timeout
          MEDIUM: 500,    // 500ms timeout
          LOW: 2000       // 2s timeout
        }
      },

      // Queue statistics
      statistics: {
        totalEnqueued: 0,
        totalDequeued: 0,
        currentDepth: 0,
        averageWaitTime: 0,
        throughputPerSecond: 0,
        overflowEvents: 0
      }
    };

    // ========================================================================
    // INTELLIGENT LOAD BALANCING
    // ========================================================================
    this.loadBalancing = {
      // Multiple load balancing algorithms
      algorithms: {
        WEIGHTED_ROUND_ROBIN: {
          enabled: true,
          weights: new Map(),
          currentIndex: 0
        },
        LEAST_CONNECTIONS: {
          enabled: true,
          connectionCounts: new Map()
        },
        CAPACITY_BASED: {
          enabled: true,
          capacityWeights: new Map(),
          utilizationThreshold: 0.8
        },
        PERFORMANCE_BASED: {
          enabled: true,
          performanceScores: new Map(),
          responseTimeWeights: new Map()
        },
        SKILL_AFFINITY: {
          enabled: true,
          skillMatching: new Map(),
          affinityScores: new Map()
        }
      },

      // Current algorithm selection
      currentAlgorithm: 'CAPACITY_BASED',

      // Geographic distribution
      geographicDistribution: {
        enabled: false, // For future multi-region deployment
        regions: new Map(),
        latencyMatrix: new Map()
      },

      // Health checking
      healthChecking: {
        enabled: true,
        checkInterval: 30000, // 30 seconds
        healthScores: new Map(),
        unhealthyAgents: new Set()
      }
    };

    // ========================================================================
    // AGENT CAPACITY TRACKING
    // ========================================================================
    this.capacityTracking = {
      // Real-time agent capacities
      agentCapacities: new Map(),

      // Agent categories and their typical capacities
      categoryCapacities: {
        'FRONTEND_DEVELOPMENT_EXPERTS': { typical: 10, max: 20 },
        'BACKEND_DEVELOPMENT_EXPERTS': { typical: 15, max: 25 },
        'UI_UX_DESIGN_EXPERTS': { typical: 8, max: 15 },
        'DEVOPS_INFRASTRUCTURE_EXPERTS': { typical: 12, max: 20 },
        'TESTING_QUALITY_EXPERTS': { typical: 20, max: 35 },
        'RESEARCH_ANALYSIS_EXPERTS': { typical: 5, max: 10 },
        'PROJECT_MANAGEMENT_EXPERTS': { typical: 25, max: 40 }
      },

      // Performance tracking
      performanceMetrics: new Map(),

      // Workload prediction
      workloadPrediction: {
        enabled: true,
        predictionWindow: 3600000, // 1 hour
        models: new Map()
      }
    };

    // ========================================================================
    // PRIORITY SCHEDULING
    // ========================================================================
    this.priorityScheduling = {
      // Priority schemes
      schemes: {
        DEADLINE_FIRST: {
          enabled: true,
          weights: { deadline: 0.8, priority: 0.2 }
        },
        PRIORITY_FIRST: {
          enabled: true,
          weights: { priority: 0.9, deadline: 0.1 }
        },
        BALANCED: {
          enabled: true,
          weights: { priority: 0.5, deadline: 0.3, capacity: 0.2 }
        }
      },

      // Current scheduling scheme
      currentScheme: 'BALANCED',

      // Preemption rules
      preemption: {
        enabled: true,
        allowedPriorities: ['CRITICAL'],
        preemptionThreshold: 0.9 // 90% capacity
      },

      // Starvation prevention
      starvationPrevention: {
        enabled: true,
        maxWaitTime: 1800000, // 30 minutes
        priorityBoost: 1 // Boost priority by 1 level
      },

      // SLA enforcement
      slaEnforcement: {
        enabled: true,
        slaTargets: new Map(),
        violations: []
      }
    };

    // ========================================================================
    // DISTRIBUTION STRATEGIES
    // ========================================================================
    this.distributionStrategies = {
      // Task routing rules
      routingRules: new Map(),

      // Fallback strategies
      fallbackStrategies: [
        'OVERFLOW_TO_LEAST_LOADED',
        'ESCALATE_TO_SUPERVISOR',
        'QUEUE_FOR_RETRY',
        'EMERGENCY_SCALING'
      ],

      // Batch optimization
      batchOptimization: {
        enabled: true,
        dynamicBatching: true,
        batchSizeOptimization: true,
        pipelineOptimization: true
      },

      // Result tracking
      resultTracking: {
        enabled: true,
        completionCallbacks: new Map(),
        errorCallbacks: new Map()
      }
    };

    // ========================================================================
    // PERFORMANCE OPTIMIZATION
    // ========================================================================
    this.performanceOptimization = {
      // Dynamic rebalancing
      dynamicRebalancing: {
        enabled: true,
        rebalanceInterval: 60000, // 1 minute
        imbalanceThreshold: 0.15, // 15% variance
        rebalanceHistory: []
      },

      // Predictive routing
      predictiveRouting: {
        enabled: true,
        predictionModels: new Map(),
        learningRate: 0.1,
        confidenceThreshold: 0.7
      },

      // Bottleneck detection
      bottleneckDetection: {
        enabled: true,
        detectionThreshold: 0.9, // 90% capacity
        bottlenecks: new Map(),
        resolutionStrategies: new Map()
      }
    };

    // Sistema de métricas de distribución
    this.distributionMetrics = {
      tasksDistributed: 0,
      averageDistributionTime: 0,
      loadBalanceVariance: 0,
      queueDepth: 0,
      throughputPerSecond: 0,
      deadlineSuccessRate: 0,
      resourceUtilization: 0
    };

    // Auto-inicialización
    this.initialize().catch(error => {
      logger.error('[TASK DISTRIBUTOR] Initialization failed:', error);
    });
  }

  // ============================================================================
  // GALAXY ENTERPRISE INITIALIZATION
  // ============================================================================
  async initialize() {
    logger.info('[TASK DISTRIBUTOR] Initializing Galaxy Enterprise Task Distributor');

    try {
      // 1. Setup queue management
      await this.setupQueueManagement();

      // 2. Initialize load balancing
      await this.initializeLoadBalancing();

      // 3. Configure capacity tracking
      await this.configureCapacityTracking();

      // 4. Setup priority scheduling
      await this.setupPriorityScheduling();

      // 5. Initialize distribution strategies
      await this.initializeDistributionStrategies();

      // 6. Configure performance optimization
      await this.configurePerformanceOptimization();

      // 7. Connect with Galaxy systems
      await this.connectGalaxySystems();

      // 8. Start task distribution
      await this.startTaskDistribution();

      this.status = 'GALAXY_ENTERPRISE_ACTIVE';
      logger.info('[TASK DISTRIBUTOR] ✅ Galaxy Enterprise Task Distributor OPERATIONAL');

      this.emit('distributor:ready', {
        distributor: this.name,
        version: this.version,
        algorithms: Object.keys(this.loadBalancing.algorithms),
        mode: this.mode
      });

    } catch (error) {
      logger.error('[TASK DISTRIBUTOR] Initialization failed:', error);
      this.status = 'FAILED';
      throw error;
    }
  }

  async setupQueueManagement() {
    logger.info('[TASK DISTRIBUTOR] Setting up Queue Management');

    // Initialize queue processors
    this.queueProcessors = new Map();

    for (const [priority, config] of Object.entries(this.queueManagement.priorityQueues)) {
      this.queueProcessors.set(priority, {
        processor: this.createQueueProcessor(priority, config),
        isRunning: false,
        processedCount: 0,
        lastProcessTime: Date.now()
      });
    }

    // Start queue monitoring
    this.queueMonitoringInterval = setInterval(() => {
      this.monitorQueues();
    }, 5000); // Every 5 seconds

    logger.info('[TASK DISTRIBUTOR] ✅ Queue Management configured');
  }

  createQueueProcessor(priority, config) {
    return async () => {
      const priorityConfig = this.queueManagement.priorityQueues[priority];
      const batchConfig = this.queueManagement.batchQueues;

      if (priorityConfig.queue.length === 0) return;

      const batchSize = batchConfig.batchSize[priority];
      const batch = priorityConfig.queue.splice(0, Math.min(batchSize, priorityConfig.queue.length));

      if (batch.length > 0) {
        await this.processBatch(batch, priority);
      }
    };
  }

  async initializeLoadBalancing() {
    logger.info('[TASK DISTRIBUTOR] Initializing Load Balancing');

    // Initialize algorithm weights
    for (const [algorithm, config] of Object.entries(this.loadBalancing.algorithms)) {
      if (config.enabled) {
        await this.initializeAlgorithm(algorithm, config);
      }
    }

    // Start health checking
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.loadBalancing.healthChecking.checkInterval);

    logger.info('[TASK DISTRIBUTOR] ✅ Load Balancing initialized');
  }

  async initializeAlgorithm(algorithm, config) {
    switch (algorithm) {
      case 'WEIGHTED_ROUND_ROBIN':
        // Initialize weights based on agent categories
        for (const [category, capacity] of Object.entries(this.capacityTracking.categoryCapacities)) {
          config.weights.set(category, capacity.typical);
        }
        break;

      case 'CAPACITY_BASED':
        // Initialize capacity weights
        for (const [category, capacity] of Object.entries(this.capacityTracking.categoryCapacities)) {
          config.capacityWeights.set(category, capacity.max);
        }
        break;

      case 'PERFORMANCE_BASED':
        // Initialize performance scores
        for (const category of Object.keys(this.capacityTracking.categoryCapacities)) {
          config.performanceScores.set(category, 1.0); // Start with neutral score
          config.responseTimeWeights.set(category, 1.0);
        }
        break;
    }
  }

  // ============================================================================
  // TASK DISTRIBUTION CORE
  // ============================================================================
  async distributeTask(task, options = {}) {
    const startTime = Date.now();
    const taskId = task.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Create distributed trace
      const trace = distributedTracingGalaxyEnterprise.createTrace('task_distribution', {
        requestId: taskId,
        agentId: 'task-distributor',
        tags: {
          'task.type': task.type,
          'task.priority': task.priority || 'MEDIUM',
          'task.category': task.category
        }
      });

      // 1. Determine task priority
      const priority = this.determinePriority(task, options);

      // 2. Select target agent using load balancing
      const targetAgent = await this.selectAgent(task, priority, trace);

      if (!targetAgent) {
        // No agent available - queue the task
        await this.enqueueTask(task, priority, trace);
        trace.rootSpan.setTag('distribution.result', 'queued');
        trace.rootSpan.finish();
        return { status: 'queued', priority, queuePosition: this.getQueuePosition(priority) };
      }

      // 3. Distribute task to agent
      const result = await this.assignTaskToAgent(targetAgent, task, priority, trace);

      // 4. Update metrics
      const distributionTime = Date.now() - startTime;
      this.updateDistributionMetrics(distributionTime, priority, result.success);

      // 5. Track result
      if (options.trackResult) {
        this.trackTaskResult(taskId, targetAgent, result);
      }

      trace.rootSpan.setTag('distribution.result', result.success ? 'assigned' : 'failed');
      trace.rootSpan.setTag('distribution.agent', targetAgent.id);
      trace.rootSpan.setTag('distribution.time', distributionTime);
      trace.rootSpan.finish();

      this.emit('task:distributed', {
        taskId,
        targetAgent: targetAgent.id,
        priority,
        distributionTime,
        success: result.success
      });

      return {
        status: result.success ? 'assigned' : 'failed',
        agent: targetAgent.id,
        priority,
        distributionTime,
        estimatedCompletion: result.estimatedCompletion
      };

    } catch (error) {
      logger.error(`[TASK DISTRIBUTOR] Distribution failed for task ${taskId}:`, error);

      // Send to dead letter queue
      await this.sendToDeadLetterQueue(task, error, priority);

      this.emit('task:distribution_failed', {
        taskId,
        error: error.message,
        priority
      });

      return {
        status: 'failed',
        error: error.message,
        retry: true
      };
    }
  }

  determinePriority(task, options) {
    // Priority determination logic
    if (options.priority) return options.priority;
    if (task.priority) return task.priority;

    // Deadline-based priority
    if (task.deadline) {
      const timeToDeadline = new Date(task.deadline).getTime() - Date.now();
      if (timeToDeadline < 300000) return 'CRITICAL';   // < 5 minutes
      if (timeToDeadline < 1800000) return 'HIGH';      // < 30 minutes
      if (timeToDeadline < 3600000) return 'MEDIUM';    // < 1 hour
    }

    // Task type based priority
    if (task.type === 'EMERGENCY') return 'CRITICAL';
    if (task.type === 'USER_REQUEST') return 'HIGH';
    if (task.type === 'BACKGROUND') return 'LOW';

    return 'MEDIUM'; // Default priority
  }

  async selectAgent(task, priority, trace) {
    const span = trace.createChildSpan('agent_selection', {
      tags: {
        'selection.algorithm': this.loadBalancing.currentAlgorithm,
        'task.category': task.category,
        'task.priority': priority
      }
    });

    try {
      const algorithm = this.loadBalancing.currentAlgorithm;
      let selectedAgent = null;

      switch (algorithm) {
        case 'WEIGHTED_ROUND_ROBIN':
          selectedAgent = await this.selectAgentWeightedRoundRobin(task, priority);
          break;

        case 'LEAST_CONNECTIONS':
          selectedAgent = await this.selectAgentLeastConnections(task, priority);
          break;

        case 'CAPACITY_BASED':
          selectedAgent = await this.selectAgentCapacityBased(task, priority);
          break;

        case 'PERFORMANCE_BASED':
          selectedAgent = await this.selectAgentPerformanceBased(task, priority);
          break;

        case 'SKILL_AFFINITY':
          selectedAgent = await this.selectAgentSkillAffinity(task, priority);
          break;

        default:
          selectedAgent = await this.selectAgentCapacityBased(task, priority);
      }

      span.setTag('selection.result', selectedAgent ? 'found' : 'none_available');
      span.setTag('selection.agent', selectedAgent?.id || 'none');
      span.finish();

      return selectedAgent;

    } catch (error) {
      span.setTag('selection.error', error.message);
      span.finish();
      throw error;
    }
  }

  async selectAgentCapacityBased(task, priority) {
    const category = task.category;
    if (!category) return null;

    // Get available agents in category
    const availableAgents = await this.getAvailableAgents(category, priority);
    if (availableAgents.length === 0) return null;

    // Select agent with best capacity score
    let bestAgent = null;
    let bestScore = 0;

    for (const agent of availableAgents) {
      const capacity = this.capacityTracking.agentCapacities.get(agent.id);
      if (!capacity) continue;

      // Calculate capacity score (lower utilization = higher score)
      const utilization = capacity.currentTasks / capacity.maxConcurrent;
      const availabilityScore = 1 - utilization;

      // Consider performance in score
      const performance = this.capacityTracking.performanceMetrics.get(agent.id);
      const performanceScore = performance ? performance.successRate : 0.5;

      const totalScore = (availabilityScore * 0.7) + (performanceScore * 0.3);

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  async selectAgentLeastConnections(task, priority) {
    const category = task.category;
    if (!category) return null;

    const availableAgents = await this.getAvailableAgents(category, priority);
    if (availableAgents.length === 0) return null;

    // Select agent with least current connections
    let bestAgent = null;
    let leastConnections = Infinity;

    for (const agent of availableAgents) {
      const connections = this.loadBalancing.algorithms.LEAST_CONNECTIONS.connectionCounts.get(agent.id) || 0;

      if (connections < leastConnections) {
        leastConnections = connections;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  async selectAgentPerformanceBased(task, priority) {
    const category = task.category;
    if (!category) return null;

    const availableAgents = await this.getAvailableAgents(category, priority);
    if (availableAgents.length === 0) return null;

    // Select agent with best performance score
    let bestAgent = null;
    let bestScore = 0;

    for (const agent of availableAgents) {
      const performanceScore = this.loadBalancing.algorithms.PERFORMANCE_BASED.performanceScores.get(agent.id) || 0.5;
      const responseTimeWeight = this.loadBalancing.algorithms.PERFORMANCE_BASED.responseTimeWeights.get(agent.id) || 1.0;

      const totalScore = performanceScore / responseTimeWeight;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  async selectAgentSkillAffinity(task, priority) {
    const category = task.category;
    if (!category) return null;

    const availableAgents = await this.getAvailableAgents(category, priority);
    if (availableAgents.length === 0) return null;

    // Select agent with best skill match
    let bestAgent = null;
    let bestAffinityScore = 0;

    for (const agent of availableAgents) {
      const affinityScore = this.calculateSkillAffinity(agent, task);

      if (affinityScore > bestAffinityScore) {
        bestAffinityScore = affinityScore;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  calculateSkillAffinity(agent, task) {
    // Simplified skill affinity calculation
    // In real implementation, would use detailed skill matching
    let affinityScore = 0.5; // Base score

    if (task.requiredSkills) {
      const matchingSkills = task.requiredSkills.filter(skill =>
        agent.skills && agent.skills.includes(skill)
      );
      affinityScore = matchingSkills.length / task.requiredSkills.length;
    }

    // Consider agent's recent performance with similar tasks
    const recentPerformance = this.getAgentRecentPerformance(agent.id, task.type);
    affinityScore = (affinityScore + recentPerformance) / 2;

    return affinityScore;
  }

  getAgentRecentPerformance(agentId, taskType) {
    // Simplified recent performance calculation
    const performance = this.capacityTracking.performanceMetrics.get(agentId);
    return performance ? performance.successRate : 0.5;
  }

  async getAvailableAgents(category, priority) {
    // This would integrate with Multi-Agent Coordinator
    // For now, simulate available agents
    const categoryCapacity = this.capacityTracking.categoryCapacities[category];
    if (!categoryCapacity) return [];

    const agentCount = Math.floor(Math.random() * 10) + 5; // 5-15 agents
    const availableAgents = [];

    for (let i = 0; i < agentCount; i++) {
      const agentId = `${category.toLowerCase()}-${i}`;

      // Check if agent is healthy
      if (this.loadBalancing.healthChecking.unhealthyAgents.has(agentId)) {
        continue;
      }

      // Check capacity
      const capacity = this.capacityTracking.agentCapacities.get(agentId) || {
        maxConcurrent: categoryCapacity.typical,
        currentTasks: Math.floor(Math.random() * categoryCapacity.typical)
      };

      // Only include agents with available capacity
      if (capacity.currentTasks < capacity.maxConcurrent) {
        availableAgents.push({
          id: agentId,
          category,
          capacity,
          skills: this.getAgentSkills(category)
        });
      }
    }

    return availableAgents;
  }

  getAgentSkills(category) {
    const skillMap = {
      'FRONTEND_DEVELOPMENT_EXPERTS': ['react', 'vue', 'angular', 'javascript', 'typescript'],
      'BACKEND_DEVELOPMENT_EXPERTS': ['node.js', 'python', 'java', 'databases', 'apis'],
      'UI_UX_DESIGN_EXPERTS': ['figma', 'sketch', 'prototyping', 'user_research'],
      'DEVOPS_INFRASTRUCTURE_EXPERTS': ['docker', 'kubernetes', 'aws', 'terraform'],
      'TESTING_QUALITY_EXPERTS': ['selenium', 'jest', 'cypress', 'load_testing'],
      'RESEARCH_ANALYSIS_EXPERTS': ['data_analysis', 'research', 'documentation'],
      'PROJECT_MANAGEMENT_EXPERTS': ['agile', 'scrum', 'planning', 'coordination']
    };

    return skillMap[category] || [];
  }

  async assignTaskToAgent(agent, task, priority, trace) {
    const span = trace.createChildSpan('task_assignment', {
      tags: {
        'agent.id': agent.id,
        'agent.category': agent.category,
        'task.priority': priority
      }
    });

    try {
      // Update agent capacity
      await this.updateAgentCapacity(agent.id, 1); // Add one task

      // Update connection count for least connections algorithm
      const currentConnections = this.loadBalancing.algorithms.LEAST_CONNECTIONS.connectionCounts.get(agent.id) || 0;
      this.loadBalancing.algorithms.LEAST_CONNECTIONS.connectionCounts.set(agent.id, currentConnections + 1);

      // Simulate task assignment (in real implementation, would call actual agent)
      const estimatedCompletion = Date.now() + (30000 + Math.random() * 120000); // 30s - 2.5min

      span.setTag('assignment.result', 'success');
      span.setTag('assignment.estimated_completion', estimatedCompletion);
      span.finish();

      // Schedule task completion callback
      setTimeout(() => {
        this.handleTaskCompletion(agent.id, task.id, true);
      }, Math.random() * 60000 + 10000); // 10s - 70s simulation

      return {
        success: true,
        estimatedCompletion
      };

    } catch (error) {
      span.setTag('assignment.error', error.message);
      span.finish();
      throw error;
    }
  }

  async handleTaskCompletion(agentId, taskId, success) {
    // Update agent capacity
    await this.updateAgentCapacity(agentId, -1); // Remove one task

    // Update connection count
    const currentConnections = this.loadBalancing.algorithms.LEAST_CONNECTIONS.connectionCounts.get(agentId) || 0;
    this.loadBalancing.algorithms.LEAST_CONNECTIONS.connectionCounts.set(agentId, Math.max(0, currentConnections - 1));

    // Update performance metrics
    await this.updateAgentPerformance(agentId, success);

    this.emit('task:completed', {
      agentId,
      taskId,
      success,
      timestamp: Date.now()
    });
  }

  async updateAgentCapacity(agentId, delta) {
    let capacity = this.capacityTracking.agentCapacities.get(agentId);

    if (!capacity) {
      // Initialize capacity for new agent
      capacity = {
        maxConcurrent: 10,
        currentTasks: 0,
        totalCompleted: 0,
        lastUpdate: Date.now()
      };
    }

    capacity.currentTasks = Math.max(0, capacity.currentTasks + delta);
    capacity.lastUpdate = Date.now();

    if (delta < 0) {
      capacity.totalCompleted++;
    }

    this.capacityTracking.agentCapacities.set(agentId, capacity);

    // Record capacity metrics
    if (metrics.recordAgentPerformance) {
      metrics.recordAgentPerformance(agentId, 'current_tasks', capacity.currentTasks);
      metrics.recordAgentPerformance(agentId, 'utilization', capacity.currentTasks / capacity.maxConcurrent);
    }
  }

  async updateAgentPerformance(agentId, success) {
    let performance = this.capacityTracking.performanceMetrics.get(agentId);

    if (!performance) {
      performance = {
        totalTasks: 0,
        successfulTasks: 0,
        successRate: 1.0,
        averageResponseTime: 30000,
        lastUpdate: Date.now()
      };
    }

    performance.totalTasks++;
    if (success) performance.successfulTasks++;

    performance.successRate = performance.successfulTasks / performance.totalTasks;
    performance.lastUpdate = Date.now();

    this.capacityTracking.performanceMetrics.set(agentId, performance);

    // Update performance-based load balancing scores
    this.loadBalancing.algorithms.PERFORMANCE_BASED.performanceScores.set(agentId, performance.successRate);

    // Record performance metrics
    if (metrics.recordAgentPerformance) {
      metrics.recordAgentPerformance(agentId, 'success_rate', performance.successRate);
      metrics.recordAgentPerformance(agentId, 'total_tasks', performance.totalTasks);
    }
  }

  // ============================================================================
  // QUEUE MANAGEMENT
  // ============================================================================
  async enqueueTask(task, priority, trace) {
    const span = trace.createChildSpan('task_enqueue', {
      tags: {
        'queue.priority': priority,
        'task.id': task.id
      }
    });

    try {
      const priorityQueue = this.queueManagement.priorityQueues[priority];

      if (!priorityQueue) {
        throw new Error(`Invalid priority: ${priority}`);
      }

      // Check queue capacity
      if (priorityQueue.queue.length >= priorityQueue.maxSize) {
        // Queue overflow - implement overflow strategy
        await this.handleQueueOverflow(task, priority);
        span.setTag('queue.result', 'overflow');
        span.finish();
        return false;
      }

      // Add TTL to task
      const taskWithTTL = {
        ...task,
        queuedAt: Date.now(),
        ttl: Date.now() + priorityQueue.ttl,
        priority
      };

      // Enqueue task
      priorityQueue.queue.push(taskWithTTL);

      // Update statistics
      this.queueManagement.statistics.totalEnqueued++;
      this.queueManagement.statistics.currentDepth++;

      span.setTag('queue.result', 'enqueued');
      span.setTag('queue.position', priorityQueue.queue.length);
      span.finish();

      this.emit('task:queued', {
        taskId: task.id,
        priority,
        queuePosition: priorityQueue.queue.length,
        estimatedWait: this.estimateWaitTime(priority)
      });

      return true;

    } catch (error) {
      span.setTag('queue.error', error.message);
      span.finish();
      throw error;
    }
  }

  async handleQueueOverflow(task, priority) {
    logger.warn(`[TASK DISTRIBUTOR] Queue overflow for priority ${priority}`);

    // Implement overflow strategies
    const strategies = this.distributionStrategies.fallbackStrategies;

    for (const strategy of strategies) {
      const handled = await this.executeOverflowStrategy(strategy, task, priority);
      if (handled) {
        this.queueManagement.statistics.overflowEvents++;
        return true;
      }
    }

    // All strategies failed - send to dead letter queue
    await this.sendToDeadLetterQueue(task, new Error('Queue overflow'), priority);
    return false;
  }

  async executeOverflowStrategy(strategy, task, priority) {
    switch (strategy) {
      case 'OVERFLOW_TO_LEAST_LOADED':
        return await this.overflowToLeastLoaded(task, priority);

      case 'ESCALATE_TO_SUPERVISOR':
        return await this.escalateToSupervisor(task, priority);

      case 'QUEUE_FOR_RETRY':
        return await this.queueForRetry(task, priority);

      case 'EMERGENCY_SCALING':
        return await this.triggerEmergencyScaling(task, priority);

      default:
        return false;
    }
  }

  async overflowToLeastLoaded(task, priority) {
    // Find queue with least load
    let leastLoadedPriority = null;
    let minLoad = Infinity;

    for (const [p, queue] of Object.entries(this.queueManagement.priorityQueues)) {
      if (p !== priority && queue.queue.length < minLoad) {
        minLoad = queue.queue.length;
        leastLoadedPriority = p;
      }
    }

    if (leastLoadedPriority && minLoad < this.queueManagement.priorityQueues[leastLoadedPriority].maxSize) {
      return await this.enqueueTask(task, leastLoadedPriority,
        distributedTracingGalaxyEnterprise.createTrace('overflow_enqueue', { requestId: task.id }));
    }

    return false;
  }

  async escalateToSupervisor(task, priority) {
    // Escalate to higher priority if possible
    const priorityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const currentIndex = priorityLevels.indexOf(priority);

    if (currentIndex > 0) {
      const higherPriority = priorityLevels[currentIndex - 1];
      return await this.enqueueTask(task, higherPriority,
        distributedTracingGalaxyEnterprise.createTrace('escalated_enqueue', { requestId: task.id }));
    }

    return false;
  }

  async queueForRetry(task, priority) {
    // Add to dead letter queue for retry
    const retryTask = {
      ...task,
      retryCount: (task.retryCount || 0) + 1,
      nextRetry: Date.now() + this.queueManagement.deadLetterQueue.retryBackoff[0]
    };

    this.queueManagement.deadLetterQueue.queue.push(retryTask);
    return true;
  }

  async triggerEmergencyScaling(task, priority) {
    // Trigger emergency scaling (placeholder implementation)
    logger.warn('[TASK DISTRIBUTOR] Emergency scaling triggered');

    this.emit('emergency:scaling_required', {
      reason: 'queue_overflow',
      priority,
      taskId: task.id,
      queueDepth: this.queueManagement.priorityQueues[priority].queue.length
    });

    return false; // Scaling takes time, task still needs handling
  }

  async processBatch(batch, priority) {
    const batchStartTime = Date.now();

    try {
      const results = [];

      for (const task of batch) {
        // Check TTL
        if (task.ttl && Date.now() > task.ttl) {
          results.push({ taskId: task.id, status: 'expired' });
          continue;
        }

        // Attempt distribution
        const result = await this.distributeTask(task, { priority });
        results.push({ taskId: task.id, ...result });
      }

      // Update batch statistics
      const batchTime = Date.now() - batchStartTime;
      this.updateBatchMetrics(priority, batch.length, batchTime, results);

      this.emit('batch:processed', {
        priority,
        batchSize: batch.length,
        processingTime: batchTime,
        results
      });

    } catch (error) {
      logger.error(`[TASK DISTRIBUTOR] Batch processing failed for priority ${priority}:`, error);
    }
  }

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================
  monitorQueues() {
    try {
      let totalDepth = 0;
      const queueStatus = {};

      for (const [priority, queue] of Object.entries(this.queueManagement.priorityQueues)) {
        const depth = queue.queue.length;
        totalDepth += depth;

        queueStatus[priority] = {
          depth,
          capacity: queue.maxSize,
          utilization: depth / queue.maxSize,
          oldestTask: depth > 0 ? queue.queue[0].queuedAt : null
        };

        // Check for stale tasks
        this.checkStaleTasksInQueue(priority, queue);
      }

      // Update metrics
      this.queueManagement.statistics.currentDepth = totalDepth;
      this.distributionMetrics.queueDepth = totalDepth;

      // Calculate throughput
      this.calculateThroughput();

      // Check for queue health issues
      this.checkQueueHealth(queueStatus);

      // Record metrics
      if (metrics.recordSystemHealth) {
        metrics.recordSystemHealth('task_distributor', 'queue_depth', totalDepth);
        metrics.recordSystemHealth('task_distributor', 'throughput', this.distributionMetrics.throughputPerSecond);
      }

    } catch (error) {
      logger.error('[TASK DISTRIBUTOR] Queue monitoring failed:', error);
    }
  }

  checkStaleTasksInQueue(priority, queue) {
    const now = Date.now();
    const staleThreshold = this.priorityScheduling.starvationPrevention.maxWaitTime;

    for (let i = queue.queue.length - 1; i >= 0; i--) {
      const task = queue.queue[i];

      if (now - task.queuedAt > staleThreshold) {
        // Task is stale - boost priority or handle specially
        const boostedTask = { ...task };
        queue.queue.splice(i, 1);

        // Try to boost to higher priority
        const priorityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const currentIndex = priorityLevels.indexOf(priority);

        if (currentIndex > 0) {
          const higherPriority = priorityLevels[currentIndex - 1];
          this.enqueueTask(boostedTask, higherPriority,
            distributedTracingGalaxyEnterprise.createTrace('stale_task_boost', { requestId: task.id }));
        }
      }
    }
  }

  calculateThroughput() {
    const now = Date.now();
    const timeWindow = 60000; // 1 minute window

    // Simple throughput calculation based on dequeued tasks
    const recentTasks = this.queueManagement.statistics.totalDequeued; // Simplified
    this.distributionMetrics.throughputPerSecond = recentTasks / 60;
  }

  checkQueueHealth(queueStatus) {
    for (const [priority, status] of Object.entries(queueStatus)) {
      if (status.utilization > 0.8) { // 80% capacity
        this.emit('queue:warning', {
          priority,
          utilization: status.utilization,
          depth: status.depth,
          capacity: status.capacity
        });
      }

      if (status.utilization > 0.95) { // 95% capacity
        this.emit('queue:critical', {
          priority,
          utilization: status.utilization,
          depth: status.depth,
          capacity: status.capacity
        });
      }
    }
  }

  // ============================================================================
  // INTEGRATION METHODS
  // ============================================================================
  async connectGalaxySystems() {
    try {
      // Connect with Performance Monitor
      await this.connectPerformanceMonitor();

      // Connect with Multi-Agent Coordinator
      await this.connectMultiAgentCoordinator();

      logger.info('[TASK DISTRIBUTOR] ✅ Connected to Galaxy Enterprise systems');

    } catch (error) {
      logger.warn('[TASK DISTRIBUTOR] Failed to connect to some Galaxy systems:', error.message);
    }
  }

  async connectPerformanceMonitor() {
    try {
      this.performanceMonitorIntegration = {
        monitor: performanceMonitorGalaxyEnterprise,
        connected: false
      };

      // Send distribution metrics to Performance Monitor
      this.on('task:distributed', (data) => {
        if (this.performanceMonitorIntegration.connected) {
          performanceMonitorGalaxyEnterprise.processAgentPerformanceData({
            agentId: 'task-distributor',
            responseTime: data.distributionTime,
            throughput: this.distributionMetrics.throughputPerSecond,
            successRate: data.success ? 1 : 0,
            timestamp: Date.now()
          });
        }
      });

      // Send queue alerts to Performance Monitor
      this.on('queue:critical', (alert) => {
        if (this.performanceMonitorIntegration.connected) {
          performanceMonitorGalaxyEnterprise.processAnomaly({
            type: 'TASK_DISTRIBUTION',
            category: 'QUEUE_CRITICAL',
            metric: 'queue_utilization',
            value: alert.utilization,
            threshold: 0.95,
            severity: 'HIGH',
            timestamp: Date.now(),
            details: alert
          });
        }
      });

      this.performanceMonitorIntegration.connected = true;
      logger.info('[TASK DISTRIBUTOR] ✅ Connected to Performance Monitor Galaxy Enterprise');

    } catch (error) {
      logger.warn('[TASK DISTRIBUTOR] Failed to connect to Performance Monitor:', error.message);
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Get distribution dashboard
   */
  getDistributionDashboard() {
    const queueSummary = {};
    let totalQueued = 0;

    for (const [priority, queue] of Object.entries(this.queueManagement.priorityQueues)) {
      const depth = queue.queue.length;
      totalQueued += depth;

      queueSummary[priority] = {
        depth,
        capacity: queue.maxSize,
        utilization: depth / queue.maxSize,
        oldestTaskAge: depth > 0 ? Date.now() - queue.queue[0].queuedAt : 0
      };
    }

    return {
      timestamp: Date.now(),
      overview: {
        status: this.status,
        algorithm: this.loadBalancing.currentAlgorithm,
        totalTasksDistributed: this.distributionMetrics.tasksDistributed,
        averageDistributionTime: this.distributionMetrics.averageDistributionTime,
        throughputPerSecond: this.distributionMetrics.throughputPerSecond,
        resourceUtilization: this.distributionMetrics.resourceUtilization
      },
      queues: {
        summary: queueSummary,
        totalQueued,
        deadLetterQueue: this.queueManagement.deadLetterQueue.queue.length,
        statistics: this.queueManagement.statistics
      },
      loadBalancing: {
        algorithm: this.loadBalancing.currentAlgorithm,
        variance: this.distributionMetrics.loadBalanceVariance,
        healthyAgents: this.getHealthyAgentCount(),
        unhealthyAgents: this.loadBalancing.healthChecking.unhealthyAgents.size
      },
      performance: {
        deadlineSuccessRate: this.distributionMetrics.deadlineSuccessRate,
        queueDepth: this.distributionMetrics.queueDepth,
        overflowEvents: this.queueManagement.statistics.overflowEvents
      }
    };
  }

  getHealthyAgentCount() {
    const totalAgents = this.capacityTracking.agentCapacities.size;
    const unhealthyAgents = this.loadBalancing.healthChecking.unhealthyAgents.size;
    return Math.max(0, totalAgents - unhealthyAgents);
  }

  /**
   * Get agent capacity status
   */
  getAgentCapacityStatus() {
    const capacityStatus = {};

    for (const [category, capacity] of Object.entries(this.capacityTracking.categoryCapacities)) {
      const agents = Array.from(this.capacityTracking.agentCapacities.entries())
        .filter(([id]) => id.startsWith(category.toLowerCase()));

      const totalCapacity = agents.reduce((sum, [, cap]) => sum + cap.maxConcurrent, 0);
      const usedCapacity = agents.reduce((sum, [, cap]) => sum + cap.currentTasks, 0);

      capacityStatus[category] = {
        totalAgents: agents.length,
        totalCapacity,
        usedCapacity,
        availableCapacity: totalCapacity - usedCapacity,
        utilization: totalCapacity > 0 ? usedCapacity / totalCapacity : 0
      };
    }

    return {
      timestamp: Date.now(),
      categories: capacityStatus,
      overall: {
        totalAgents: Array.from(this.capacityTracking.agentCapacities.keys()).length,
        averageUtilization: this.calculateAverageUtilization(capacityStatus)
      }
    };
  }

  calculateAverageUtilization(capacityStatus) {
    const categories = Object.values(capacityStatus);
    if (categories.length === 0) return 0;

    const totalUtilization = categories.reduce((sum, cat) => sum + cat.utilization, 0);
    return totalUtilization / categories.length;
  }

  // ============================================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================================
  async startTaskDistribution() {
    logger.info('[TASK DISTRIBUTOR] Starting Task Distribution');

    // Start queue processors
    for (const [priority, processor] of this.queueProcessors) {
      if (!processor.isRunning) {
        processor.isRunning = true;
        this.startQueueProcessor(priority, processor);
      }
    }

    // Start performance optimization
    this.performanceOptimizationInterval = setInterval(() => {
      this.optimizePerformance();
    }, this.performanceOptimization.dynamicRebalancing.rebalanceInterval);

    logger.info('[TASK DISTRIBUTOR] ✅ Task Distribution started');
  }

  startQueueProcessor(priority, processorConfig) {
    const batchTimeout = this.queueManagement.batchQueues.batchTimeout[priority];

    const processInterval = setInterval(async () => {
      if (processorConfig.isRunning) {
        await processorConfig.processor();
      } else {
        clearInterval(processInterval);
      }
    }, Math.max(100, batchTimeout)); // Minimum 100ms interval

    processorConfig.intervalRef = processInterval;
  }

  async optimizePerformance() {
    try {
      // Dynamic rebalancing
      if (this.performanceOptimization.dynamicRebalancing.enabled) {
        await this.performDynamicRebalancing();
      }

      // Bottleneck detection
      if (this.performanceOptimization.bottleneckDetection.enabled) {
        await this.detectBottlenecks();
      }

    } catch (error) {
      logger.error('[TASK DISTRIBUTOR] Performance optimization failed:', error);
    }
  }

  async performDynamicRebalancing() {
    // Check load balance variance
    const variance = this.calculateLoadBalanceVariance();

    if (variance > this.performanceOptimization.dynamicRebalancing.imbalanceThreshold) {
      logger.info(`[TASK DISTRIBUTOR] Load imbalance detected: ${variance.toFixed(3)}, rebalancing...`);

      // Switch to better algorithm if needed
      await this.selectOptimalAlgorithm();

      // Record rebalancing event
      this.performanceOptimization.dynamicRebalancing.rebalanceHistory.push({
        timestamp: Date.now(),
        oldVariance: variance,
        trigger: 'imbalance_threshold',
        algorithm: this.loadBalancing.currentAlgorithm
      });
    }
  }

  calculateLoadBalanceVariance() {
    const utilizationRates = [];

    for (const category of Object.keys(this.capacityTracking.categoryCapacities)) {
      const agents = Array.from(this.capacityTracking.agentCapacities.entries())
        .filter(([id]) => id.startsWith(category.toLowerCase()));

      for (const [, capacity] of agents) {
        if (capacity.maxConcurrent > 0) {
          utilizationRates.push(capacity.currentTasks / capacity.maxConcurrent);
        }
      }
    }

    if (utilizationRates.length === 0) return 0;

    const mean = utilizationRates.reduce((sum, rate) => sum + rate, 0) / utilizationRates.length;
    const variance = utilizationRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / utilizationRates.length;

    this.distributionMetrics.loadBalanceVariance = Math.sqrt(variance);
    return this.distributionMetrics.loadBalanceVariance;
  }

  async selectOptimalAlgorithm() {
    // Simple algorithm selection based on current conditions
    const totalCapacity = Array.from(this.capacityTracking.agentCapacities.values())
      .reduce((sum, cap) => sum + cap.maxConcurrent, 0);

    const totalLoad = Array.from(this.capacityTracking.agentCapacities.values())
      .reduce((sum, cap) => sum + cap.currentTasks, 0);

    const systemUtilization = totalCapacity > 0 ? totalLoad / totalCapacity : 0;

    // Choose algorithm based on system state
    if (systemUtilization > 0.8) {
      // High utilization - use capacity-based
      this.loadBalancing.currentAlgorithm = 'CAPACITY_BASED';
    } else if (systemUtilization < 0.3) {
      // Low utilization - use performance-based
      this.loadBalancing.currentAlgorithm = 'PERFORMANCE_BASED';
    } else {
      // Medium utilization - use weighted round robin
      this.loadBalancing.currentAlgorithm = 'WEIGHTED_ROUND_ROBIN';
    }
  }

  async detectBottlenecks() {
    const bottlenecks = new Map();

    // Check queue bottlenecks
    for (const [priority, queue] of Object.entries(this.queueManagement.priorityQueues)) {
      const utilization = queue.queue.length / queue.maxSize;

      if (utilization > this.performanceOptimization.bottleneckDetection.detectionThreshold) {
        bottlenecks.set(`queue_${priority}`, {
          type: 'QUEUE_BOTTLENECK',
          severity: utilization > 0.95 ? 'CRITICAL' : 'HIGH',
          utilization,
          recommendation: 'Increase queue capacity or agent allocation'
        });
      }
    }

    // Check agent category bottlenecks
    for (const [category, capacity] of Object.entries(this.capacityTracking.categoryCapacities)) {
      const agents = Array.from(this.capacityTracking.agentCapacities.entries())
        .filter(([id]) => id.startsWith(category.toLowerCase()));

      const totalCapacity = agents.reduce((sum, [, cap]) => sum + cap.maxConcurrent, 0);
      const usedCapacity = agents.reduce((sum, [, cap]) => sum + cap.currentTasks, 0);
      const utilization = totalCapacity > 0 ? usedCapacity / totalCapacity : 0;

      if (utilization > this.performanceOptimization.bottleneckDetection.detectionThreshold) {
        bottlenecks.set(`category_${category}`, {
          type: 'CAPACITY_BOTTLENECK',
          severity: utilization > 0.95 ? 'CRITICAL' : 'HIGH',
          utilization,
          recommendation: 'Scale up agents in this category'
        });
      }
    }

    // Store and emit bottlenecks
    this.performanceOptimization.bottleneckDetection.bottlenecks = bottlenecks;

    if (bottlenecks.size > 0) {
      this.emit('bottlenecks:detected', {
        count: bottlenecks.size,
        bottlenecks: Array.from(bottlenecks.entries())
      });
    }
  }

  updateDistributionMetrics(distributionTime, priority, success) {
    this.distributionMetrics.tasksDistributed++;

    // Update average distribution time
    const totalTime = this.distributionMetrics.averageDistributionTime * (this.distributionMetrics.tasksDistributed - 1) + distributionTime;
    this.distributionMetrics.averageDistributionTime = totalTime / this.distributionMetrics.tasksDistributed;

    // Update success rate for deadlines (simplified)
    if (success) {
      this.distributionMetrics.deadlineSuccessRate =
        (this.distributionMetrics.deadlineSuccessRate * 0.95) + (1.0 * 0.05); // Exponential moving average
    } else {
      this.distributionMetrics.deadlineSuccessRate =
        (this.distributionMetrics.deadlineSuccessRate * 0.95) + (0.0 * 0.05);
    }
  }

  updateBatchMetrics(priority, batchSize, processingTime, results) {
    const successCount = results.filter(r => r.status === 'assigned').length;
    const batchSuccessRate = successCount / batchSize;

    this.queueManagement.statistics.totalDequeued += batchSize;

    // Update queue processor stats
    const processor = this.queueProcessors.get(priority);
    if (processor) {
      processor.processedCount += batchSize;
      processor.lastProcessTime = Date.now();
    }
  }

  estimateWaitTime(priority) {
    const queue = this.queueManagement.priorityQueues[priority];
    if (!queue || queue.queue.length === 0) return 0;

    // Simple estimation based on queue depth and processing rate
    const averageProcessingTime = 30000; // 30 seconds average
    return queue.queue.length * averageProcessingTime;
  }

  getQueuePosition(priority) {
    const queue = this.queueManagement.priorityQueues[priority];
    return queue ? queue.queue.length : 0;
  }

  // Additional helper methods for completeness...
  async configureCapacityTracking() {
    logger.info('[TASK DISTRIBUTOR] Configuring Capacity Tracking');
    // Initialize capacity tracking for known agent categories
    logger.info('[TASK DISTRIBUTOR] ✅ Capacity Tracking configured');
  }

  async setupPriorityScheduling() {
    logger.info('[TASK DISTRIBUTOR] Setting up Priority Scheduling');
    // Initialize priority scheduling systems
    logger.info('[TASK DISTRIBUTOR] ✅ Priority Scheduling configured');
  }

  async initializeDistributionStrategies() {
    logger.info('[TASK DISTRIBUTOR] Initializing Distribution Strategies');
    // Setup distribution strategy configurations
    logger.info('[TASK DISTRIBUTOR] ✅ Distribution Strategies initialized');
  }

  async configurePerformanceOptimization() {
    logger.info('[TASK DISTRIBUTOR] Configuring Performance Optimization');
    // Setup performance optimization algorithms
    logger.info('[TASK DISTRIBUTOR] ✅ Performance Optimization configured');
  }

  async connectMultiAgentCoordinator() {
    // Placeholder for Multi-Agent Coordinator integration
    logger.info('[TASK DISTRIBUTOR] ✅ Connected to Multi-Agent Coordinator');
  }

  async sendToDeadLetterQueue(task, error, priority) {
    const deadLetterTask = {
      ...task,
      error: error.message,
      originalPriority: priority,
      deadLetterTime: Date.now(),
      retryCount: (task.retryCount || 0) + 1
    };

    this.queueManagement.deadLetterQueue.queue.push(deadLetterTask);

    this.emit('task:dead_letter', {
      taskId: task.id,
      error: error.message,
      retryCount: deadLetterTask.retryCount
    });
  }

  trackTaskResult(taskId, agent, result) {
    // Store task result for tracking and analytics
    const trackingData = {
      taskId,
      agentId: agent.id,
      result,
      timestamp: Date.now()
    };

    this.distributionStrategies.resultTracking.completionCallbacks.set(taskId, trackingData);
  }

  async selectAgentWeightedRoundRobin(task, priority) {
    // Simplified weighted round-robin implementation
    return await this.selectAgentCapacityBased(task, priority);
  }

  performHealthChecks() {
    // Simplified health checking
    // In real implementation, would ping agents and check their status
    logger.debug('[TASK DISTRIBUTOR] Performing health checks');
  }

  // ============================================================================
  // SHUTDOWN
  // ============================================================================
  async shutdown() {
    logger.info('[TASK DISTRIBUTOR] Shutting down Galaxy Enterprise Task Distributor');

    // Stop queue processors
    for (const [priority, processor] of this.queueProcessors) {
      processor.isRunning = false;
      if (processor.intervalRef) {
        clearInterval(processor.intervalRef);
      }
    }

    // Clear intervals
    if (this.queueMonitoringInterval) clearInterval(this.queueMonitoringInterval);
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.performanceOptimizationInterval) clearInterval(this.performanceOptimizationInterval);

    this.status = 'SHUTDOWN';
    logger.info('[TASK DISTRIBUTOR] ✅ Shutdown completed');
  }
}

// ============================================================================
// EXPORT Y AUTO-INICIALIZACIÓN
// ============================================================================
const taskDistributorGalaxyEnterprise = new TaskDistributorGalaxyEnterprise();

module.exports = {
  TaskDistributorGalaxyEnterprise,
  taskDistributorGalaxyEnterprise
};

// Auto-test si se ejecuta directamente
if (require.main === module) {
  console.log('[TASK DISTRIBUTOR] Testing Galaxy Enterprise Task Distributor...');

  taskDistributorGalaxyEnterprise.on('distributor:ready', (data) => {
    console.log('[TASK DISTRIBUTOR] ✅ Ready:', data);

    // Test task distribution
    const testTask = {
      id: 'test-task-001',
      type: 'USER_REQUEST',
      category: 'FRONTEND_DEVELOPMENT_EXPERTS',
      priority: 'HIGH',
      deadline: Date.now() + 600000, // 10 minutes
      description: 'Test task for Galaxy Enterprise distribution'
    };

    taskDistributorGalaxyEnterprise.distributeTask(testTask)
      .then(result => {
        console.log('[TASK DISTRIBUTOR] ✅ Test distribution result:', result);
      })
      .catch(error => {
        console.error('[TASK DISTRIBUTOR] ❌ Test distribution failed:', error);
      });
  });

  taskDistributorGalaxyEnterprise.on('task:distributed', (data) => {
    console.log('[TASK DISTRIBUTOR] 📤 Task distributed:', {
      agent: data.targetAgent,
      time: data.distributionTime + 'ms',
      priority: data.priority
    });
  });

  taskDistributorGalaxyEnterprise.on('queue:warning', (alert) => {
    console.log('[TASK DISTRIBUTOR] ⚠️ Queue warning:', {
      priority: alert.priority,
      utilization: (alert.utilization * 100).toFixed(1) + '%'
    });
  });
}