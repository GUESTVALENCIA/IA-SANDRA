/**
 * SANDRA IA GALAXY ENTERPRISE - COST OPTIMIZATION v7.0
 * Sistema de Análisis y Optimización de Costos Empresarial
 * ML-driven cost optimization, ROI analysis, budget management
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

// Importar sistemas Galaxy Enterprise existentes
const logger = require('./backend/logger');
const metrics = require('./backend/metrics');
const { performanceMonitorGalaxyEnterprise } = require('./performance-monitor-galaxy-enterprise');

class CostOptimizationGalaxyEnterprise extends EventEmitter {
  constructor() {
    super();
    this.name = "SANDRA_COST_OPTIMIZATION";
    this.version = "7.0_GALAXY_ENTERPRISE";
    this.mode = "ENTERPRISE_COST_ANALYTICS";
    this.status = "INITIALIZING";

    // ========================================================================
    // COST TRACKING CONFIGURATION
    // ========================================================================
    this.costTracking = {
      // Resource cost tracking
      resourceCosts: {
        compute: { costPerHour: 0.15, usage: new Map() },
        memory: { costPerGBHour: 0.02, usage: new Map() },
        storage: { costPerGBMonth: 0.023, usage: new Map() },
        network: { costPerGB: 0.09, usage: new Map() },
        llmAPIs: { costPerToken: 0.0001, usage: new Map() }
      },

      // Agent cost attribution
      agentCosts: new Map(),

      // Workflow cost tracking
      workflowCosts: new Map(),

      // Historical cost data
      costHistory: [],

      // Budget allocations
      budgets: {
        monthly: 10000, // $10k monthly budget
        quarterly: 30000,
        annual: 120000,
        alerts: {
          warning: 0.8,  // 80% of budget
          critical: 0.95 // 95% of budget
        }
      }
    };

    // ========================================================================
    // COST OPTIMIZATION ENGINE
    // ========================================================================
    this.optimizationEngine = {
      enabled: true,

      // ML-driven optimization models
      models: {
        resourceRightSizing: {
          enabled: true,
          algorithm: 'REGRESSION_ANALYSIS',
          confidence: 0.85,
          lastTrained: null
        },
        workloadConsolidation: {
          enabled: true,
          algorithm: 'CLUSTERING',
          confidence: 0.80,
          lastTrained: null
        },
        demandForecasting: {
          enabled: true,
          algorithm: 'TIME_SERIES',
          confidence: 0.75,
          lastTrained: null
        }
      },

      // Optimization recommendations
      recommendations: new Map(),

      // Cost-saving opportunities
      opportunities: [],

      // Automated optimizations
      automatedActions: {
        enabled: true,
        safetyThreshold: 0.05, // Don't auto-optimize if risk > 5%
        maxSavings: 0.3 // Maximum 30% cost reduction per action
      }
    };

    // ========================================================================
    // ROI ANALYSIS ENGINE
    // ========================================================================
    this.roiAnalysis = {
      // Agent efficiency ROI
      agentROI: new Map(),

      // Feature ROI tracking
      featureROI: new Map(),

      // Investment analysis
      investments: {
        infrastructure: new Map(),
        tooling: new Map(),
        optimization: new Map()
      },

      // ROI calculations
      calculations: {
        timeWindow: '30d',
        baseline: null,
        targets: {
          minROI: 1.2, // 20% minimum ROI
          excellentROI: 3.0 // 200% excellent ROI
        }
      }
    };

    // ========================================================================
    // BUDGET MANAGEMENT
    // ========================================================================
    this.budgetManagement = {
      // Dynamic budget allocation
      allocation: {
        compute: 0.4,      // 40%
        storage: 0.2,      // 20%
        network: 0.1,      // 10%
        llmAPIs: 0.2,      // 20%
        monitoring: 0.05,  // 5%
        contingency: 0.05  // 5%
      },

      // Budget tracking
      tracking: {
        currentSpend: new Map(),
        projectedSpend: new Map(),
        variance: new Map()
      },

      // Alert thresholds
      alerts: {
        categories: new Map(),
        escalation: {
          warning: 'team_lead',
          critical: 'finance_team',
          emergency: 'executive_team'
        }
      }
    };

    // ========================================================================
    // COST ANALYTICS
    // ========================================================================
    this.analytics = {
      // Cost trends
      trends: {
        daily: new Map(),
        weekly: new Map(),
        monthly: new Map()
      },

      // Cost anomalies
      anomalies: [],

      // Efficiency metrics
      efficiency: {
        costPerAgent: new Map(),
        costPerOperation: new Map(),
        costPerUser: new Map(),
        utilizationRate: new Map()
      },

      // Benchmarking
      benchmarks: {
        industryStandard: null,
        historicalBaseline: null,
        targets: new Map()
      }
    };

    // Sistema de métricas de costos
    this.costMetrics = {
      totalCost: 0,
      costTrend: 0,
      optimizationSavings: 0,
      budgetUtilization: 0,
      roiScore: 0,
      efficiencyScore: 100
    };

    // Auto-inicialización
    this.initialize().catch(error => {
      logger.error('[COST OPTIMIZATION] Initialization failed:', error);
    });
  }

  // ============================================================================
  // GALAXY ENTERPRISE INITIALIZATION
  // ============================================================================
  async initialize() {
    logger.info('[COST OPTIMIZATION] Initializing Galaxy Enterprise Cost Optimization');

    try {
      // 1. Setup cost tracking
      await this.setupCostTracking();

      // 2. Initialize optimization engine
      await this.initializeOptimizationEngine();

      // 3. Configure ROI analysis
      await this.configureROIAnalysis();

      // 4. Setup budget management
      await this.setupBudgetManagement();

      // 5. Initialize cost analytics
      await this.initializeCostAnalytics();

      // 6. Connect with Performance Monitor
      await this.connectPerformanceMonitor();

      // 7. Start cost monitoring
      await this.startCostMonitoring();

      this.status = 'GALAXY_ENTERPRISE_ACTIVE';
      logger.info('[COST OPTIMIZATION] ✅ Galaxy Enterprise Cost Optimization OPERATIONAL');

      this.emit('cost:ready', {
        optimizer: this.name,
        version: this.version,
        budgetMonthly: this.costTracking.budgets.monthly,
        mode: this.mode
      });

    } catch (error) {
      logger.error('[COST OPTIMIZATION] Initialization failed:', error);
      this.status = 'FAILED';
      throw error;
    }
  }

  async setupCostTracking() {
    logger.info('[COST OPTIMIZATION] Setting up Cost Tracking');

    // Initialize cost collectors
    this.costCollectors = {
      resourceCollector: this.collectResourceCosts.bind(this),
      agentCollector: this.collectAgentCosts.bind(this),
      workflowCollector: this.collectWorkflowCosts.bind(this),
      apiCollector: this.collectAPICosts.bind(this)
    };

    // Start cost collection
    this.costCollectionInterval = setInterval(async () => {
      await this.collectAllCosts();
    }, 300000); // Every 5 minutes

    logger.info('[COST OPTIMIZATION] ✅ Cost Tracking configured');
  }

  async initializeOptimizationEngine() {
    logger.info('[COST OPTIMIZATION] Initializing Optimization Engine');

    // Setup optimization algorithms
    this.optimizationAlgorithms = {
      rightSizing: this.analyzeResourceRightSizing.bind(this),
      consolidation: this.analyzeWorkloadConsolidation.bind(this),
      scheduling: this.optimizeScheduling.bind(this),
      caching: this.optimizeCaching.bind(this)
    };

    // Start optimization analysis
    this.optimizationInterval = setInterval(async () => {
      await this.runOptimizationAnalysis();
    }, 1800000); // Every 30 minutes

    logger.info('[COST OPTIMIZATION] ✅ Optimization Engine initialized');
  }

  // ============================================================================
  // COST COLLECTION
  // ============================================================================
  async collectAllCosts() {
    try {
      const timestamp = Date.now();

      // Collect resource costs
      const resourceCosts = await this.collectResourceCosts();

      // Collect agent-specific costs
      const agentCosts = await this.collectAgentCosts();

      // Collect workflow costs
      const workflowCosts = await this.collectWorkflowCosts();

      // Collect API costs
      const apiCosts = await this.collectAPICosts();

      // Aggregate total costs
      const totalCost = resourceCosts + agentCosts + workflowCosts + apiCosts;

      // Store cost data
      this.costHistory.push({
        timestamp,
        total: totalCost,
        breakdown: {
          resources: resourceCosts,
          agents: agentCosts,
          workflows: workflowCosts,
          apis: apiCosts
        }
      });

      // Update metrics
      this.costMetrics.totalCost = totalCost;
      this.updateCostTrend();

      // Check budget alerts
      await this.checkBudgetAlerts(totalCost);

      // Record in backend metrics
      if (metrics.recordResourceUtilization) {
        metrics.recordResourceUtilization('cost_total', totalCost);
        metrics.recordResourceUtilization('cost_compute', resourceCosts);
        metrics.recordResourceUtilization('cost_agents', agentCosts);
      }

    } catch (error) {
      logger.error('[COST OPTIMIZATION] Cost collection failed:', error);
    }
  }

  async collectResourceCosts() {
    let totalResourceCosts = 0;

    // Compute costs (simulated)
    const cpuUsage = Math.random() * 100; // CPU percentage
    const cpuHours = cpuUsage / 100; // Fractional hour usage
    const computeCost = cpuHours * this.costTracking.resourceCosts.compute.costPerHour;
    totalResourceCosts += computeCost;

    // Memory costs
    const memoryUsageGB = 8 + Math.random() * 16; // 8-24 GB usage
    const memoryCost = memoryUsageGB * this.costTracking.resourceCosts.memory.costPerGBHour / 24;
    totalResourceCosts += memoryCost;

    // Storage costs
    const storageGB = 100 + Math.random() * 500; // 100-600 GB
    const storageCost = storageGB * this.costTracking.resourceCosts.storage.costPerGBMonth / (30 * 24);
    totalResourceCosts += storageCost;

    // Network costs
    const networkGB = Math.random() * 10; // 0-10 GB transfer
    const networkCost = networkGB * this.costTracking.resourceCosts.network.costPerGB;
    totalResourceCosts += networkCost;

    return totalResourceCosts;
  }

  async collectAgentCosts() {
    let totalAgentCosts = 0;

    // Simulate costs for different agent categories
    const agentCategories = [
      'FRONTEND_DEVELOPMENT_EXPERTS',
      'BACKEND_DEVELOPMENT_EXPERTS',
      'UI_UX_DESIGN_EXPERTS',
      'DEVOPS_INFRASTRUCTURE_EXPERTS',
      'TESTING_QUALITY_EXPERTS',
      'RESEARCH_ANALYSIS_EXPERTS',
      'PROJECT_MANAGEMENT_EXPERTS'
    ];

    for (const category of agentCategories) {
      const agentCount = 30 + Math.floor(Math.random() * 20); // 30-50 agents per category
      const avgUtilization = 0.6 + Math.random() * 0.3; // 60-90% utilization
      const costPerAgent = 0.5 + Math.random() * 0.3; // $0.5-0.8 per hour per agent

      const categoryCost = agentCount * avgUtilization * costPerAgent / 12; // 5-minute cost
      totalAgentCosts += categoryCost;

      // Store per-category costs
      this.costTracking.agentCosts.set(category, categoryCost);
    }

    return totalAgentCosts;
  }

  async collectWorkflowCosts() {
    let totalWorkflowCosts = 0;

    // Simulate workflow execution costs
    const activeWorkflows = 5 + Math.floor(Math.random() * 15); // 5-20 active workflows
    const avgWorkflowCost = 0.1 + Math.random() * 0.4; // $0.1-0.5 per workflow

    totalWorkflowCosts = activeWorkflows * avgWorkflowCost;

    return totalWorkflowCosts;
  }

  async collectAPICosts() {
    let totalAPICosts = 0;

    // LLM API costs
    const llmTokens = 1000 + Math.floor(Math.random() * 9000); // 1k-10k tokens
    const llmCost = llmTokens * this.costTracking.resourceCosts.llmAPIs.costPerToken;
    totalAPICosts += llmCost;

    // External API costs
    const externalAPICalls = Math.floor(Math.random() * 100);
    const externalAPICost = externalAPICalls * 0.001; // $0.001 per call
    totalAPICosts += externalAPICost;

    return totalAPICosts;
  }

  // ============================================================================
  // OPTIMIZATION ANALYSIS
  // ============================================================================
  async runOptimizationAnalysis() {
    try {
      logger.info('[COST OPTIMIZATION] Running optimization analysis');

      // Clear previous recommendations
      this.optimizationEngine.recommendations.clear();
      this.optimizationEngine.opportunities = [];

      // Run optimization algorithms
      const rightSizingOps = await this.analyzeResourceRightSizing();
      const consolidationOps = await this.analyzeWorkloadConsolidation();
      const schedulingOps = await this.optimizeScheduling();
      const cachingOps = await this.optimizeCaching();

      // Aggregate opportunities
      const allOpportunities = [
        ...rightSizingOps,
        ...consolidationOps,
        ...schedulingOps,
        ...cachingOps
      ];

      // Rank opportunities by potential savings
      this.optimizationEngine.opportunities = allOpportunities
        .sort((a, b) => b.potentialSavings - a.potentialSavings)
        .slice(0, 20); // Top 20 opportunities

      // Calculate total potential savings
      const totalSavings = this.optimizationEngine.opportunities
        .reduce((sum, op) => sum + op.potentialSavings, 0);

      this.costMetrics.optimizationSavings = totalSavings;

      // Emit optimization results
      this.emit('cost:optimizationAnalysis', {
        opportunities: this.optimizationEngine.opportunities.length,
        potentialSavings: totalSavings,
        topOpportunities: this.optimizationEngine.opportunities.slice(0, 5)
      });

      logger.info(`[COST OPTIMIZATION] Analysis complete: ${this.optimizationEngine.opportunities.length} opportunities, $${totalSavings.toFixed(2)} potential savings`);

    } catch (error) {
      logger.error('[COST OPTIMIZATION] Optimization analysis failed:', error);
    }
  }

  async analyzeResourceRightSizing() {
    const opportunities = [];

    // Analyze CPU right-sizing
    const cpuUtilization = 0.4 + Math.random() * 0.4; // 40-80% utilization
    if (cpuUtilization < 0.5) {
      opportunities.push({
        type: 'RIGHT_SIZING',
        resource: 'CPU',
        currentUtilization: cpuUtilization,
        recommendedChange: 'Downsize CPU allocation',
        potentialSavings: 50 + Math.random() * 100,
        confidence: 0.85,
        risk: 'LOW'
      });
    }

    // Analyze memory right-sizing
    const memoryUtilization = 0.3 + Math.random() * 0.5; // 30-80% utilization
    if (memoryUtilization < 0.4) {
      opportunities.push({
        type: 'RIGHT_SIZING',
        resource: 'Memory',
        currentUtilization: memoryUtilization,
        recommendedChange: 'Reduce memory allocation',
        potentialSavings: 30 + Math.random() * 70,
        confidence: 0.80,
        risk: 'LOW'
      });
    }

    return opportunities;
  }

  async analyzeWorkloadConsolidation() {
    const opportunities = [];

    // Agent consolidation opportunity
    const lowUtilizationAgents = Math.floor(Math.random() * 20); // 0-20 agents
    if (lowUtilizationAgents > 5) {
      opportunities.push({
        type: 'CONSOLIDATION',
        resource: 'Agents',
        description: `Consolidate ${lowUtilizationAgents} underutilized agents`,
        potentialSavings: lowUtilizationAgents * 10,
        confidence: 0.75,
        risk: 'MEDIUM'
      });
    }

    // Workflow consolidation
    const duplicateWorkflows = Math.floor(Math.random() * 5);
    if (duplicateWorkflows > 0) {
      opportunities.push({
        type: 'CONSOLIDATION',
        resource: 'Workflows',
        description: `Merge ${duplicateWorkflows} similar workflows`,
        potentialSavings: duplicateWorkflows * 25,
        confidence: 0.70,
        risk: 'HIGH'
      });
    }

    return opportunities;
  }

  async optimizeScheduling() {
    const opportunities = [];

    // Off-peak scheduling
    const schedulableWorkloads = Math.floor(Math.random() * 10);
    if (schedulableWorkloads > 2) {
      opportunities.push({
        type: 'SCHEDULING',
        resource: 'Workloads',
        description: `Schedule ${schedulableWorkloads} workloads during off-peak hours`,
        potentialSavings: schedulableWorkloads * 15,
        confidence: 0.80,
        risk: 'LOW'
      });
    }

    return opportunities;
  }

  async optimizeCaching() {
    const opportunities = [];

    // Cache optimization
    const cacheHitRate = 0.6 + Math.random() * 0.3; // 60-90% hit rate
    if (cacheHitRate < 0.8) {
      const improvementPotential = (0.9 - cacheHitRate) * 100;
      opportunities.push({
        type: 'CACHING',
        resource: 'Cache',
        description: 'Optimize caching strategy to reduce API calls',
        currentHitRate: cacheHitRate,
        potentialSavings: improvementPotential * 2,
        confidence: 0.85,
        risk: 'LOW'
      });
    }

    return opportunities;
  }

  // ============================================================================
  // ROI ANALYSIS
  // ============================================================================
  async configureROIAnalysis() {
    logger.info('[COST OPTIMIZATION] Configuring ROI Analysis');

    // Start ROI calculation
    this.roiCalculationInterval = setInterval(async () => {
      await this.calculateROI();
    }, 1800000); // Every 30 minutes

    logger.info('[COST OPTIMIZATION] ✅ ROI Analysis configured');
  }

  async calculateROI() {
    try {
      // Calculate agent ROI
      await this.calculateAgentROI();

      // Calculate feature ROI
      await this.calculateFeatureROI();

      // Calculate investment ROI
      await this.calculateInvestmentROI();

      // Update overall ROI score
      this.updateROIScore();

    } catch (error) {
      logger.error('[COST OPTIMIZATION] ROI calculation failed:', error);
    }
  }

  async calculateAgentROI() {
    for (const [agentCategory, cost] of this.costTracking.agentCosts) {
      // Simulate value generated by agents
      const valueGenerated = cost * (2 + Math.random() * 3); // 2x-5x ROI simulation

      const roi = (valueGenerated - cost) / cost;

      this.roiAnalysis.agentROI.set(agentCategory, {
        cost,
        value: valueGenerated,
        roi,
        roiPercentage: roi * 100,
        classification: this.classifyROI(roi)
      });
    }
  }

  async calculateFeatureROI() {
    const features = [
      'Multi-Agent Coordination',
      'Knowledge Synthesis',
      'Error Recovery',
      'Performance Monitoring',
      'Cost Optimization'
    ];

    for (const feature of features) {
      const cost = 100 + Math.random() * 500; // $100-600 cost
      const value = cost * (1.5 + Math.random() * 2); // 1.5x-3.5x value

      const roi = (value - cost) / cost;

      this.roiAnalysis.featureROI.set(feature, {
        cost,
        value,
        roi,
        roiPercentage: roi * 100,
        classification: this.classifyROI(roi)
      });
    }
  }

  async calculateInvestmentROI() {
    // Infrastructure investments
    const infraInvestments = [
      { name: 'Performance Monitor', cost: 2000, value: 3500 },
      { name: 'Distributed Tracing', cost: 1500, value: 2200 },
      { name: 'SLO Management', cost: 1000, value: 1800 }
    ];

    for (const investment of infraInvestments) {
      const roi = (investment.value - investment.cost) / investment.cost;

      this.roiAnalysis.investments.infrastructure.set(investment.name, {
        ...investment,
        roi,
        roiPercentage: roi * 100,
        classification: this.classifyROI(roi)
      });
    }
  }

  classifyROI(roi) {
    if (roi >= 2.0) return 'EXCELLENT';
    if (roi >= 1.0) return 'GOOD';
    if (roi >= 0.2) return 'ACCEPTABLE';
    if (roi >= 0) return 'MARGINAL';
    return 'NEGATIVE';
  }

  updateROIScore() {
    const allROIs = [
      ...Array.from(this.roiAnalysis.agentROI.values()).map(r => r.roi),
      ...Array.from(this.roiAnalysis.featureROI.values()).map(r => r.roi),
      ...Array.from(this.roiAnalysis.investments.infrastructure.values()).map(r => r.roi)
    ];

    if (allROIs.length > 0) {
      const averageROI = allROIs.reduce((sum, roi) => sum + roi, 0) / allROIs.length;
      this.costMetrics.roiScore = Math.max(0, Math.min(10, averageROI + 1)); // 0-10 scale
    }
  }

  // ============================================================================
  // BUDGET MANAGEMENT
  // ============================================================================
  async setupBudgetManagement() {
    logger.info('[COST OPTIMIZATION] Setting up Budget Management');

    // Initialize budget tracking
    for (const [category, percentage] of Object.entries(this.budgetManagement.allocation)) {
      const allocation = this.costTracking.budgets.monthly * percentage;
      this.budgetManagement.tracking.currentSpend.set(category, 0);
      this.budgetManagement.tracking.projectedSpend.set(category, allocation);
    }

    // Start budget monitoring
    this.budgetMonitoringInterval = setInterval(async () => {
      await this.monitorBudgets();
    }, 3600000); // Every hour

    logger.info('[COST OPTIMIZATION] ✅ Budget Management configured');
  }

  async monitorBudgets() {
    try {
      for (const [category, allocation] of Object.entries(this.budgetManagement.allocation)) {
        const spent = this.budgetManagement.tracking.currentSpend.get(category) || 0;
        const budget = this.costTracking.budgets.monthly * allocation;
        const utilization = spent / budget;

        // Update utilization
        this.costMetrics.budgetUtilization = Math.max(this.costMetrics.budgetUtilization, utilization);

        // Check alert thresholds
        if (utilization >= this.costTracking.budgets.alerts.critical) {
          this.emit('cost:budgetAlert', {
            category,
            severity: 'CRITICAL',
            utilization,
            spent,
            budget,
            overspend: spent - budget
          });
        } else if (utilization >= this.costTracking.budgets.alerts.warning) {
          this.emit('cost:budgetAlert', {
            category,
            severity: 'WARNING',
            utilization,
            spent,
            budget
          });
        }
      }
    } catch (error) {
      logger.error('[COST OPTIMIZATION] Budget monitoring failed:', error);
    }
  }

  async checkBudgetAlerts(totalCost) {
    const monthlySpend = this.calculateMonthlySpend();
    const budgetUtilization = monthlySpend / this.costTracking.budgets.monthly;

    if (budgetUtilization >= this.costTracking.budgets.alerts.critical) {
      this.emit('cost:budgetCritical', {
        monthlySpend,
        budget: this.costTracking.budgets.monthly,
        utilization: budgetUtilization,
        overspend: monthlySpend - this.costTracking.budgets.monthly
      });
    }
  }

  calculateMonthlySpend() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentCosts = this.costHistory
      .filter(entry => entry.timestamp >= thirtyDaysAgo)
      .reduce((sum, entry) => sum + entry.total, 0);

    return recentCosts;
  }

  // ============================================================================
  // COST ANALYTICS
  // ============================================================================
  async initializeCostAnalytics() {
    logger.info('[COST OPTIMIZATION] Initializing Cost Analytics');

    // Start trend analysis
    this.trendAnalysisInterval = setInterval(async () => {
      await this.analyzeCostTrends();
    }, 3600000); // Every hour

    logger.info('[COST OPTIMIZATION] ✅ Cost Analytics initialized');
  }

  async analyzeCostTrends() {
    try {
      // Daily trends
      await this.calculateDailyTrends();

      // Weekly trends
      await this.calculateWeeklyTrends();

      // Monthly trends
      await this.calculateMonthlyTrends();

      // Detect anomalies
      await this.detectCostAnomalies();

      // Update efficiency metrics
      await this.updateEfficiencyMetrics();

    } catch (error) {
      logger.error('[COST OPTIMIZATION] Trend analysis failed:', error);
    }
  }

  async calculateDailyTrends() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const dailyCosts = this.costHistory
      .filter(entry => entry.timestamp >= oneDayAgo)
      .reduce((sum, entry) => sum + entry.total, 0);

    this.analytics.trends.daily.set(new Date().toDateString(), dailyCosts);
  }

  async calculateWeeklyTrends() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weeklyCosts = this.costHistory
      .filter(entry => entry.timestamp >= oneWeekAgo)
      .reduce((sum, entry) => sum + entry.total, 0);

    const weekKey = `Week-${Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))}`;
    this.analytics.trends.weekly.set(weekKey, weeklyCosts);
  }

  async calculateMonthlyTrends() {
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const monthlyCosts = this.costHistory
      .filter(entry => entry.timestamp >= oneMonthAgo)
      .reduce((sum, entry) => sum + entry.total, 0);

    const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    this.analytics.trends.monthly.set(monthKey, monthlyCosts);
  }

  async detectCostAnomalies() {
    // Simple anomaly detection based on standard deviation
    if (this.costHistory.length < 10) return;

    const recentCosts = this.costHistory.slice(-20).map(entry => entry.total);
    const mean = recentCosts.reduce((sum, cost) => sum + cost, 0) / recentCosts.length;
    const variance = recentCosts.reduce((sum, cost) => sum + Math.pow(cost - mean, 2), 0) / recentCosts.length;
    const stdDev = Math.sqrt(variance);

    const latestCost = recentCosts[recentCosts.length - 1];
    const zScore = Math.abs(latestCost - mean) / stdDev;

    if (zScore > 2) { // 2 standard deviations
      const anomaly = {
        timestamp: Date.now(),
        cost: latestCost,
        mean,
        standardDeviation: stdDev,
        zScore,
        severity: zScore > 3 ? 'HIGH' : 'MEDIUM'
      };

      this.analytics.anomalies.push(anomaly);

      this.emit('cost:anomaly', anomaly);
    }
  }

  async updateEfficiencyMetrics() {
    // Cost per agent
    const totalAgentCost = Array.from(this.costTracking.agentCosts.values())
      .reduce((sum, cost) => sum + cost, 0);
    const totalAgents = this.costTracking.agentCosts.size * 35; // Approx 35 agents per category

    if (totalAgents > 0) {
      this.analytics.efficiency.costPerAgent.set('current', totalAgentCost / totalAgents);
    }

    // Update efficiency score
    const baselineEfficiency = 0.5; // $0.50 per agent baseline
    const currentEfficiency = this.analytics.efficiency.costPerAgent.get('current') || baselineEfficiency;
    this.costMetrics.efficiencyScore = Math.max(0, (baselineEfficiency / currentEfficiency) * 100);
  }

  updateCostTrend() {
    if (this.costHistory.length >= 2) {
      const latest = this.costHistory[this.costHistory.length - 1].total;
      const previous = this.costHistory[this.costHistory.length - 2].total;
      this.costMetrics.costTrend = ((latest - previous) / previous) * 100;
    }
  }

  // ============================================================================
  // INTEGRATION METHODS
  // ============================================================================
  async connectPerformanceMonitor() {
    try {
      // Connect with Performance Monitor Galaxy Enterprise
      this.performanceMonitorIntegration = {
        monitor: performanceMonitorGalaxyEnterprise,
        connected: false
      };

      // Send cost anomalies to Performance Monitor
      this.on('cost:anomaly', (anomaly) => {
        if (this.performanceMonitorIntegration.connected) {
          performanceMonitorGalaxyEnterprise.processAnomaly({
            type: 'COST',
            category: 'COST_ANOMALY',
            metric: 'cost_deviation',
            value: anomaly.zScore,
            threshold: 2.0,
            severity: anomaly.severity,
            timestamp: Date.now(),
            details: anomaly
          });
        }
      });

      // Send budget alerts
      this.on('cost:budgetCritical', (alert) => {
        if (this.performanceMonitorIntegration.connected) {
          performanceMonitorGalaxyEnterprise.generateAlert({
            type: 'COST_BUDGET_CRITICAL',
            category: 'BUDGET_EXHAUSTION',
            title: 'Critical budget utilization detected',
            description: `Monthly budget ${(alert.utilization * 100).toFixed(1)}% utilized`,
            severity: 'CRITICAL',
            timestamp: Date.now(),
            source: 'COST_OPTIMIZATION',
            details: alert
          });
        }
      });

      this.performanceMonitorIntegration.connected = true;
      logger.info('[COST OPTIMIZATION] ✅ Connected to Performance Monitor Galaxy Enterprise');

    } catch (error) {
      logger.warn('[COST OPTIMIZATION] Failed to connect to Performance Monitor:', error.message);
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Get comprehensive cost dashboard
   */
  getCostDashboard() {
    const monthlySpend = this.calculateMonthlySpend();
    const budgetUtilization = monthlySpend / this.costTracking.budgets.monthly;

    return {
      timestamp: Date.now(),
      overview: {
        totalCost: this.costMetrics.totalCost,
        monthlySpend,
        budgetUtilization,
        costTrend: this.costMetrics.costTrend,
        optimizationSavings: this.costMetrics.optimizationSavings,
        roiScore: this.costMetrics.roiScore,
        efficiencyScore: this.costMetrics.efficiencyScore
      },
      breakdown: {
        agents: Array.from(this.costTracking.agentCosts.entries()),
        resources: this.getResourceCostBreakdown(),
        workflows: Array.from(this.costTracking.workflowCosts.entries())
      },
      optimization: {
        opportunities: this.optimizationEngine.opportunities.slice(0, 10),
        potentialSavings: this.costMetrics.optimizationSavings
      },
      roi: {
        agents: Array.from(this.roiAnalysis.agentROI.entries()),
        features: Array.from(this.roiAnalysis.featureROI.entries()),
        investments: Array.from(this.roiAnalysis.investments.infrastructure.entries())
      },
      alerts: {
        anomalies: this.analytics.anomalies.slice(-5),
        budgetAlerts: this.getBudgetAlertStatus()
      }
    };
  }

  getResourceCostBreakdown() {
    return {
      compute: this.costHistory.length > 0 ? this.costHistory[this.costHistory.length - 1].breakdown.resources * 0.4 : 0,
      memory: this.costHistory.length > 0 ? this.costHistory[this.costHistory.length - 1].breakdown.resources * 0.3 : 0,
      storage: this.costHistory.length > 0 ? this.costHistory[this.costHistory.length - 1].breakdown.resources * 0.2 : 0,
      network: this.costHistory.length > 0 ? this.costHistory[this.costHistory.length - 1].breakdown.resources * 0.1 : 0
    };
  }

  getBudgetAlertStatus() {
    const alerts = [];
    for (const [category, allocation] of Object.entries(this.budgetManagement.allocation)) {
      const spent = this.budgetManagement.tracking.currentSpend.get(category) || 0;
      const budget = this.costTracking.budgets.monthly * allocation;
      const utilization = spent / budget;

      if (utilization >= this.costTracking.budgets.alerts.warning) {
        alerts.push({
          category,
          utilization,
          severity: utilization >= this.costTracking.budgets.alerts.critical ? 'CRITICAL' : 'WARNING'
        });
      }
    }
    return alerts;
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations() {
    return {
      timestamp: Date.now(),
      summary: {
        opportunityCount: this.optimizationEngine.opportunities.length,
        totalPotentialSavings: this.costMetrics.optimizationSavings,
        averageConfidence: this.calculateAverageConfidence(),
        riskAssessment: this.assessOverallRisk()
      },
      topRecommendations: this.optimizationEngine.opportunities.slice(0, 10),
      categoryBreakdown: this.categorizeOpportunities(),
      implementation: {
        quickWins: this.getQuickWins(),
        mediumTerm: this.getMediumTermOpportunities(),
        longTerm: this.getLongTermOpportunities()
      }
    };
  }

  calculateAverageConfidence() {
    if (this.optimizationEngine.opportunities.length === 0) return 0;

    const totalConfidence = this.optimizationEngine.opportunities
      .reduce((sum, op) => sum + op.confidence, 0);

    return totalConfidence / this.optimizationEngine.opportunities.length;
  }

  assessOverallRisk() {
    const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };

    for (const opportunity of this.optimizationEngine.opportunities) {
      riskCounts[opportunity.risk]++;
    }

    const totalOps = this.optimizationEngine.opportunities.length;
    if (totalOps === 0) return 'UNKNOWN';

    const highRiskPercentage = riskCounts.HIGH / totalOps;
    if (highRiskPercentage > 0.3) return 'HIGH';
    if (highRiskPercentage > 0.1) return 'MEDIUM';
    return 'LOW';
  }

  categorizeOpportunities() {
    const categories = {};

    for (const opportunity of this.optimizationEngine.opportunities) {
      if (!categories[opportunity.type]) {
        categories[opportunity.type] = {
          count: 0,
          totalSavings: 0,
          opportunities: []
        };
      }

      categories[opportunity.type].count++;
      categories[opportunity.type].totalSavings += opportunity.potentialSavings;
      categories[opportunity.type].opportunities.push(opportunity);
    }

    return categories;
  }

  getQuickWins() {
    return this.optimizationEngine.opportunities
      .filter(op => op.confidence >= 0.8 && op.risk === 'LOW')
      .slice(0, 5);
  }

  getMediumTermOpportunities() {
    return this.optimizationEngine.opportunities
      .filter(op => op.confidence >= 0.6 && op.risk === 'MEDIUM')
      .slice(0, 5);
  }

  getLongTermOpportunities() {
    return this.optimizationEngine.opportunities
      .filter(op => op.risk === 'HIGH' || op.confidence < 0.6)
      .slice(0, 5);
  }

  async startCostMonitoring() {
    logger.info('[COST OPTIMIZATION] Starting Cost Monitoring');

    // Start periodic reporting
    this.reportingInterval = setInterval(async () => {
      try {
        const dashboard = this.getCostDashboard();
        this.emit('cost:dashboard', dashboard);

        // Send metrics to backend
        if (metrics.recordSystemHealth) {
          metrics.recordSystemHealth('cost', 'total_cost', dashboard.overview.totalCost);
          metrics.recordSystemHealth('cost', 'budget_utilization', dashboard.overview.budgetUtilization);
          metrics.recordSystemHealth('cost', 'roi_score', dashboard.overview.roiScore);
          metrics.recordSystemHealth('cost', 'efficiency_score', dashboard.overview.efficiencyScore);
        }

      } catch (error) {
        logger.error('[COST OPTIMIZATION] Cost reporting failed:', error);
      }
    }, 300000); // Every 5 minutes

    logger.info('[COST OPTIMIZATION] ✅ Cost Monitoring started');
  }

  // ============================================================================
  // SHUTDOWN
  // ============================================================================
  async shutdown() {
    logger.info('[COST OPTIMIZATION] Shutting down Galaxy Enterprise Cost Optimization');

    // Clear intervals
    if (this.costCollectionInterval) clearInterval(this.costCollectionInterval);
    if (this.optimizationInterval) clearInterval(this.optimizationInterval);
    if (this.roiCalculationInterval) clearInterval(this.roiCalculationInterval);
    if (this.budgetMonitoringInterval) clearInterval(this.budgetMonitoringInterval);
    if (this.trendAnalysisInterval) clearInterval(this.trendAnalysisInterval);
    if (this.reportingInterval) clearInterval(this.reportingInterval);

    this.status = 'SHUTDOWN';
    logger.info('[COST OPTIMIZATION] ✅ Shutdown completed');
  }
}

// ============================================================================
// EXPORT Y AUTO-INICIALIZACIÓN
// ============================================================================
const costOptimizationGalaxyEnterprise = new CostOptimizationGalaxyEnterprise();

module.exports = {
  CostOptimizationGalaxyEnterprise,
  costOptimizationGalaxyEnterprise
};

// Auto-test si se ejecuta directamente
if (require.main === module) {
  console.log('[COST OPTIMIZATION] Testing Galaxy Enterprise Cost Optimization...');

  costOptimizationGalaxyEnterprise.on('cost:ready', (data) => {
    console.log('[COST OPTIMIZATION] ✅ Ready:', data);

    // Test dashboard
    setTimeout(() => {
      const dashboard = costOptimizationGalaxyEnterprise.getCostDashboard();
      console.log('[COST OPTIMIZATION] ✅ Dashboard:', {
        totalCost: dashboard.overview.totalCost.toFixed(2),
        budgetUtilization: (dashboard.overview.budgetUtilization * 100).toFixed(1) + '%',
        roiScore: dashboard.overview.roiScore.toFixed(1)
      });
    }, 2000);
  });

  costOptimizationGalaxyEnterprise.on('cost:optimizationAnalysis', (analysis) => {
    console.log('[COST OPTIMIZATION] 💡 Optimization Analysis:', {
      opportunities: analysis.opportunities,
      potentialSavings: '$' + analysis.potentialSavings.toFixed(2)
    });
  });

  costOptimizationGalaxyEnterprise.on('cost:anomaly', (anomaly) => {
    console.log('[COST OPTIMIZATION] 🚨 Cost Anomaly:', {
      cost: '$' + anomaly.cost.toFixed(2),
      zScore: anomaly.zScore.toFixed(2),
      severity: anomaly.severity
    });
  });
}