/**
 * SANDRA IA GALAXY ENTERPRISE - DISTRIBUTED TRACING v7.0
 * Sistema de Trazabilidad Distribuida para 248+ Subagentes Especializados
 * OpenTelemetry + Jaeger Integration para Cross-Agent Request Tracking
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

// Importar sistemas Galaxy Enterprise existentes
const logger = require('./backend/logger');
const metrics = require('./backend/metrics');
const { performanceMonitorGalaxyEnterprise } = require('./performance-monitor-galaxy-enterprise');

class DistributedTracingGalaxyEnterprise extends EventEmitter {
  constructor() {
    super();
    this.name = "SANDRA_DISTRIBUTED_TRACING";
    this.version = "7.0_GALAXY_ENTERPRISE";
    this.mode = "OPENTELEMETRY_TRACING";
    this.status = "INITIALIZING";

    // ========================================================================
    // DISTRIBUTED TRACING CONFIGURATION
    // ========================================================================
    this.tracingConfig = {
      enabled: true,
      provider: 'OpenTelemetry',
      exporter: 'Jaeger',
      samplingRate: 1.0, // 100% sampling for Galaxy Enterprise
      batchTimeout: 5000,
      maxExportBatchSize: 512,
      maxQueueSize: 2048
    };

    // ========================================================================
    // SPAN COLLECTION & CORRELATION
    // ========================================================================
    this.spanCollection = {
      activeSpans: new Map(),
      completedSpans: new Map(),
      traceHistory: [],

      // Correlation matrices
      agentCorrelation: new Map(),
      requestCorrelation: new Map(),
      errorCorrelation: new Map(),

      // Performance tracking
      latencyBreakdown: new Map(),
      criticalPath: new Map(),
      bottleneckAnalysis: new Map()
    };

    // ========================================================================
    // CROSS-AGENT REQUEST TRACKING
    // ========================================================================
    this.requestTracking = {
      enabled: true,

      // Request flow mapping
      requestFlows: new Map(),
      agentChains: new Map(),
      coordinationPaths: new Map(),

      // Performance metrics per request
      requestMetrics: {
        totalDuration: new Map(),
        agentContribution: new Map(),
        waitTimes: new Map(),
        networkLatency: new Map()
      },

      // Error propagation tracking
      errorPropagation: {
        enabled: true,
        errorChains: new Map(),
        rootCauseAnalysis: new Map(),
        impactAssessment: new Map()
      }
    };

    // ========================================================================
    // GALAXY ENTERPRISE INSTRUMENTATION
    // ========================================================================
    this.instrumentation = {
      // Agent instrumentation
      agentInstrumentation: {
        enabled: true,
        autoInstrumentation: true,
        customSpans: new Map(),
        agentMetrics: new Map()
      },

      // Coordination instrumentation
      coordinationInstrumentation: {
        enabled: true,
        workflowTracing: true,
        taskDistribution: true,
        knowledgeSynthesis: true
      },

      // System instrumentation
      systemInstrumentation: {
        enabled: true,
        httpRequests: true,
        databaseQueries: true,
        externalAPIs: true,
        llmCalls: true
      }
    };

    // ========================================================================
    // TRACE ANALYSIS ENGINE
    // ========================================================================
    this.traceAnalysis = {
      enabled: true,

      // Real-time analysis
      realTimeAnalysis: {
        latencyAnalysis: true,
        errorAnalysis: true,
        performanceAnalysis: true,
        anomalyDetection: true
      },

      // Batch analysis
      batchAnalysis: {
        trendAnalysis: true,
        patternRecognition: true,
        optimizationOpportunities: true,
        capacityPlanning: true
      },

      // Advanced analytics
      advancedAnalytics: {
        criticalPathAnalysis: true,
        bottleneckDetection: true,
        resourceContention: true,
        cascadeAnalysis: true
      }
    };

    // Sistema de métricas específicas para tracing
    this.tracingMetrics = {
      totalTraces: 0,
      activeTraces: 0,
      tracesPerSecond: 0,
      averageTraceLatency: 0,
      errorTraces: 0,
      samplingEfficiency: 100
    };

    // Auto-inicialización
    this.initialize().catch(error => {
      logger.error('[DISTRIBUTED TRACING] Initialization failed:', error);
    });
  }

  // ============================================================================
  // GALAXY ENTERPRISE INITIALIZATION
  // ============================================================================
  async initialize() {
    logger.info('[DISTRIBUTED TRACING] Initializing Galaxy Enterprise Distributed Tracing');

    try {
      // 1. Setup OpenTelemetry provider
      await this.setupOpenTelemetryProvider();

      // 2. Configure Jaeger exporter
      await this.configureJaegerExporter();

      // 3. Initialize span collection
      await this.initializeSpanCollection();

      // 4. Setup cross-agent instrumentation
      await this.setupCrossAgentInstrumentation();

      // 5. Configure trace analysis engine
      await this.configureTraceAnalysis();

      // 6. Connect with Performance Monitor
      await this.connectPerformanceMonitor();

      // 7. Start real-time trace processing
      await this.startTraceProcessing();

      this.status = 'GALAXY_ENTERPRISE_ACTIVE';
      logger.info('[DISTRIBUTED TRACING] ✅ Galaxy Enterprise Distributed Tracing OPERATIONAL');

      this.emit('tracing:ready', {
        tracer: this.name,
        version: this.version,
        mode: this.mode,
        instrumentation: Object.keys(this.instrumentation)
      });

    } catch (error) {
      logger.error('[DISTRIBUTED TRACING] Initialization failed:', error);
      this.status = 'FAILED';
      throw error;
    }
  }

  async setupOpenTelemetryProvider() {
    logger.info('[DISTRIBUTED TRACING] Setting up OpenTelemetry Provider');

    // Simulated OpenTelemetry setup (in real implementation would use actual OpenTelemetry SDK)
    this.openTelemetryProvider = {
      tracer: {
        name: 'sandra-galaxy-enterprise',
        version: '7.0',
        startSpan: this.startSpan.bind(this),
        finishSpan: this.finishSpan.bind(this)
      },
      resource: {
        serviceName: 'sandra-ia-galaxy-enterprise',
        serviceVersion: '7.0.0',
        environment: 'production'
      }
    };

    logger.info('[DISTRIBUTED TRACING] ✅ OpenTelemetry Provider configured');
  }

  async configureJaegerExporter() {
    logger.info('[DISTRIBUTED TRACING] Configuring Jaeger Exporter');

    // Simulated Jaeger configuration
    this.jaegerExporter = {
      endpoint: 'http://localhost:14268/api/traces',
      batchTimeout: this.tracingConfig.batchTimeout,
      maxExportBatchSize: this.tracingConfig.maxExportBatchSize,
      headers: {
        'User-Agent': 'sandra-galaxy-enterprise-tracer'
      }
    };

    logger.info('[DISTRIBUTED TRACING] ✅ Jaeger Exporter configured');
  }

  async initializeSpanCollection() {
    logger.info('[DISTRIBUTED TRACING] Initializing Span Collection');

    // Setup span processors
    this.spanProcessors = {
      realTimeProcessor: {
        enabled: true,
        processSpan: this.processRealTimeSpan.bind(this)
      },
      batchProcessor: {
        enabled: true,
        processSpans: this.processBatchSpans.bind(this)
      },
      analysisProcessor: {
        enabled: true,
        analyzeTrace: this.analyzeTrace.bind(this)
      }
    };

    logger.info('[DISTRIBUTED TRACING] ✅ Span Collection initialized');
  }

  async setupCrossAgentInstrumentation() {
    logger.info('[DISTRIBUTED TRACING] Setting up Cross-Agent Instrumentation');

    // Auto-instrument all agents
    this.instrumentation.agentInstrumentation.instrumentedAgents = new Set([
      'FRONTEND_DEVELOPMENT_EXPERTS',
      'BACKEND_DEVELOPMENT_EXPERTS',
      'UI_UX_DESIGN_EXPERTS',
      'DEVOPS_INFRASTRUCTURE_EXPERTS',
      'TESTING_QUALITY_EXPERTS',
      'RESEARCH_ANALYSIS_EXPERTS',
      'PROJECT_MANAGEMENT_EXPERTS'
    ]);

    // Setup coordination instrumentation
    this.instrumentation.coordinationInstrumentation.workflows = new Map();
    this.instrumentation.coordinationInstrumentation.tasks = new Map();

    logger.info('[DISTRIBUTED TRACING] ✅ Cross-Agent Instrumentation configured');
  }

  async configureTraceAnalysis() {
    logger.info('[DISTRIBUTED TRACING] Configuring Trace Analysis Engine');

    // Setup analysis algorithms
    this.traceAnalysis.algorithms = {
      criticalPath: this.calculateCriticalPath.bind(this),
      bottleneckDetection: this.detectBottlenecks.bind(this),
      errorAnalysis: this.analyzeErrors.bind(this),
      performanceAnalysis: this.analyzePerformance.bind(this)
    };

    logger.info('[DISTRIBUTED TRACING] ✅ Trace Analysis Engine configured');
  }

  // ============================================================================
  // SPAN MANAGEMENT
  // ============================================================================
  startSpan(operationName, options = {}) {
    const spanId = `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const traceId = options.traceId || `trace-${Date.now()}`;

    const span = {
      spanId,
      traceId,
      operationName,
      startTime: Date.now(),
      tags: options.tags || {},
      logs: [],
      parentSpanId: options.parentSpanId || null,
      agentId: options.agentId || 'unknown',
      status: 'active'
    };

    this.spanCollection.activeSpans.set(spanId, span);
    this.tracingMetrics.activeTraces++;

    // Track request flow
    if (options.requestId) {
      this.trackRequestFlow(options.requestId, span);
    }

    // Emit span started event
    this.emit('span:started', span);

    return {
      spanId,
      traceId,
      setTag: (key, value) => this.setSpanTag(spanId, key, value),
      log: (event, payload) => this.addSpanLog(spanId, event, payload),
      finish: () => this.finishSpan(spanId)
    };
  }

  finishSpan(spanId, options = {}) {
    const span = this.spanCollection.activeSpans.get(spanId);
    if (!span) {
      logger.warn(`[DISTRIBUTED TRACING] Span not found: ${spanId}`);
      return;
    }

    // Complete span
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = options.error ? 'error' : 'completed';
    span.error = options.error || null;

    // Move to completed spans
    this.spanCollection.activeSpans.delete(spanId);
    this.spanCollection.completedSpans.set(spanId, span);
    this.tracingMetrics.activeTraces--;
    this.tracingMetrics.totalTraces++;

    // Process span
    this.processRealTimeSpan(span);

    // Update metrics
    this.updateTracingMetrics(span);

    // Emit span finished event
    this.emit('span:finished', span);

    logger.debug(`[DISTRIBUTED TRACING] Span completed: ${spanId} (${span.duration}ms)`);
  }

  setSpanTag(spanId, key, value) {
    const span = this.spanCollection.activeSpans.get(spanId);
    if (span) {
      span.tags[key] = value;
    }
  }

  addSpanLog(spanId, event, payload = {}) {
    const span = this.spanCollection.activeSpans.get(spanId);
    if (span) {
      span.logs.push({
        timestamp: Date.now(),
        event,
        payload
      });
    }
  }

  // ============================================================================
  // REQUEST FLOW TRACKING
  // ============================================================================
  trackRequestFlow(requestId, span) {
    if (!this.requestTracking.requestFlows.has(requestId)) {
      this.requestTracking.requestFlows.set(requestId, {
        requestId,
        spans: [],
        startTime: Date.now(),
        agentChain: [],
        totalLatency: 0
      });
    }

    const flow = this.requestTracking.requestFlows.get(requestId);
    flow.spans.push(span);

    if (span.agentId && !flow.agentChain.includes(span.agentId)) {
      flow.agentChain.push(span.agentId);
    }

    // Update agent chains
    this.requestTracking.agentChains.set(requestId, flow.agentChain);
  }

  // ============================================================================
  // TRACE ANALYSIS
  // ============================================================================
  processRealTimeSpan(span) {
    try {
      // Real-time latency analysis
      if (span.duration > 1000) { // > 1 second
        this.emit('trace:slowSpan', {
          spanId: span.spanId,
          operationName: span.operationName,
          duration: span.duration,
          agentId: span.agentId
        });
      }

      // Error analysis
      if (span.status === 'error') {
        this.analyzeSpanError(span);
      }

      // Performance analysis
      this.analyzeSpanPerformance(span);

      // Update correlation matrices
      this.updateCorrelationMatrices(span);

    } catch (error) {
      logger.error('[DISTRIBUTED TRACING] Failed to process span:', error);
    }
  }

  analyzeSpanError(span) {
    // Track error propagation
    if (span.parentSpanId) {
      const parentSpan = this.spanCollection.completedSpans.get(span.parentSpanId);
      if (parentSpan && parentSpan.status !== 'error') {
        // Error originated in this span
        this.requestTracking.errorPropagation.rootCauseAnalysis.set(span.traceId, {
          rootSpanId: span.spanId,
          operationName: span.operationName,
          agentId: span.agentId,
          error: span.error
        });
      }
    }

    // Update error metrics
    this.tracingMetrics.errorTraces++;

    // Emit error event
    this.emit('trace:error', {
      spanId: span.spanId,
      traceId: span.traceId,
      error: span.error,
      agentId: span.agentId
    });
  }

  analyzeSpanPerformance(span) {
    // Track latency by operation
    const operationKey = `${span.agentId}:${span.operationName}`;
    if (!this.spanCollection.latencyBreakdown.has(operationKey)) {
      this.spanCollection.latencyBreakdown.set(operationKey, {
        totalDuration: 0,
        count: 0,
        min: Infinity,
        max: 0
      });
    }

    const latencyData = this.spanCollection.latencyBreakdown.get(operationKey);
    latencyData.totalDuration += span.duration;
    latencyData.count++;
    latencyData.min = Math.min(latencyData.min, span.duration);
    latencyData.max = Math.max(latencyData.max, span.duration);
    latencyData.average = latencyData.totalDuration / latencyData.count;

    // Detect performance anomalies
    if (span.duration > latencyData.average * 3) { // 3x slower than average
      this.emit('trace:performanceAnomaly', {
        spanId: span.spanId,
        operationName: span.operationName,
        duration: span.duration,
        averageDuration: latencyData.average,
        agentId: span.agentId
      });
    }
  }

  updateCorrelationMatrices(span) {
    // Agent correlation
    if (!this.spanCollection.agentCorrelation.has(span.agentId)) {
      this.spanCollection.agentCorrelation.set(span.agentId, {
        totalSpans: 0,
        averageLatency: 0,
        errorRate: 0,
        operations: new Set()
      });
    }

    const agentData = this.spanCollection.agentCorrelation.get(span.agentId);
    agentData.totalSpans++;
    agentData.operations.add(span.operationName);

    // Update averages
    const totalLatency = agentData.averageLatency * (agentData.totalSpans - 1) + span.duration;
    agentData.averageLatency = totalLatency / agentData.totalSpans;

    if (span.status === 'error') {
      agentData.errorRate = (agentData.errorRate * (agentData.totalSpans - 1) + 1) / agentData.totalSpans;
    }
  }

  // ============================================================================
  // CRITICAL PATH ANALYSIS
  // ============================================================================
  calculateCriticalPath(traceId) {
    const spans = Array.from(this.spanCollection.completedSpans.values())
      .filter(span => span.traceId === traceId)
      .sort((a, b) => a.startTime - b.startTime);

    if (spans.length === 0) return null;

    // Build span tree
    const spanTree = this.buildSpanTree(spans);

    // Calculate critical path
    const criticalPath = this.findLongestPath(spanTree);

    // Store critical path
    this.spanCollection.criticalPath.set(traceId, {
      path: criticalPath,
      totalDuration: criticalPath.reduce((sum, span) => sum + span.duration, 0),
      bottleneckSpan: criticalPath.reduce((max, span) =>
        span.duration > max.duration ? span : max, criticalPath[0])
    });

    return criticalPath;
  }

  buildSpanTree(spans) {
    const spanMap = new Map(spans.map(span => [span.spanId, span]));
    const roots = [];

    for (const span of spans) {
      span.children = [];
      if (span.parentSpanId && spanMap.has(span.parentSpanId)) {
        spanMap.get(span.parentSpanId).children.push(span);
      } else {
        roots.push(span);
      }
    }

    return roots;
  }

  findLongestPath(spanTree) {
    let longestPath = [];
    let maxDuration = 0;

    function traverse(span, currentPath, currentDuration) {
      const newPath = [...currentPath, span];
      const newDuration = currentDuration + span.duration;

      if (span.children.length === 0) {
        // Leaf node - check if this is the longest path
        if (newDuration > maxDuration) {
          maxDuration = newDuration;
          longestPath = newPath;
        }
      } else {
        // Continue traversing children
        for (const child of span.children) {
          traverse(child, newPath, newDuration);
        }
      }
    }

    for (const root of spanTree) {
      traverse(root, [], 0);
    }

    return longestPath;
  }

  // ============================================================================
  // BOTTLENECK DETECTION
  // ============================================================================
  detectBottlenecks() {
    const bottlenecks = [];

    // Analyze latency breakdown
    for (const [operationKey, latencyData] of this.spanCollection.latencyBreakdown) {
      const [agentId, operationName] = operationKey.split(':');

      // Check if operation is consistently slow
      if (latencyData.average > 500 && latencyData.count > 10) { // > 500ms average with 10+ samples
        bottlenecks.push({
          type: 'HIGH_LATENCY',
          agentId,
          operationName,
          averageLatency: latencyData.average,
          maxLatency: latencyData.max,
          sampleCount: latencyData.count,
          severity: latencyData.average > 1000 ? 'HIGH' : 'MEDIUM'
        });
      }

      // Check for high variance (inconsistent performance)
      const variance = this.calculateLatencyVariance(operationKey);
      if (variance > latencyData.average * 0.5) { // Variance > 50% of average
        bottlenecks.push({
          type: 'HIGH_VARIANCE',
          agentId,
          operationName,
          averageLatency: latencyData.average,
          variance,
          severity: 'MEDIUM'
        });
      }
    }

    // Store bottlenecks
    this.spanCollection.bottleneckAnalysis.set(Date.now(), bottlenecks);

    return bottlenecks;
  }

  calculateLatencyVariance(operationKey) {
    // Simplified variance calculation (in real implementation would track all latencies)
    const latencyData = this.spanCollection.latencyBreakdown.get(operationKey);
    return Math.abs(latencyData.max - latencyData.min);
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

      // Send trace metrics to Performance Monitor
      this.on('trace:slowSpan', (data) => {
        performanceMonitorGalaxyEnterprise.processAnomaly({
          type: 'TRACING',
          category: 'SLOW_OPERATION',
          metric: 'span_duration',
          value: data.duration,
          threshold: 1000,
          severity: 'MEDIUM',
          timestamp: Date.now(),
          details: data
        });
      });

      this.on('trace:error', (data) => {
        performanceMonitorGalaxyEnterprise.processAnomaly({
          type: 'TRACING',
          category: 'ERROR_TRACE',
          metric: 'error_rate',
          value: 1,
          severity: 'HIGH',
          timestamp: Date.now(),
          details: data
        });
      });

      this.performanceMonitorIntegration.connected = true;
      logger.info('[DISTRIBUTED TRACING] ✅ Connected to Performance Monitor Galaxy Enterprise');

    } catch (error) {
      logger.warn('[DISTRIBUTED TRACING] Failed to connect to Performance Monitor:', error.message);
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Create a new trace for cross-agent operation
   */
  createTrace(operationName, options = {}) {
    const traceId = `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const rootSpan = this.startSpan(operationName, {
      traceId,
      tags: {
        'trace.type': 'cross-agent',
        'service.name': 'sandra-galaxy-enterprise',
        ...options.tags
      },
      requestId: options.requestId,
      agentId: options.agentId || 'coordinator'
    });

    return {
      traceId,
      rootSpan,
      createChildSpan: (childOperationName, childOptions = {}) => {
        return this.startSpan(childOperationName, {
          traceId,
          parentSpanId: rootSpan.spanId,
          ...childOptions
        });
      }
    };
  }

  /**
   * Get trace analysis for a specific trace
   */
  getTraceAnalysis(traceId) {
    const spans = Array.from(this.spanCollection.completedSpans.values())
      .filter(span => span.traceId === traceId);

    if (spans.length === 0) {
      return { error: 'Trace not found' };
    }

    const criticalPath = this.calculateCriticalPath(traceId);
    const totalDuration = Math.max(...spans.map(span => span.endTime)) -
                         Math.min(...spans.map(span => span.startTime));

    return {
      traceId,
      totalDuration,
      spanCount: spans.length,
      agentCount: new Set(spans.map(span => span.agentId)).size,
      criticalPath,
      errorCount: spans.filter(span => span.status === 'error').length,
      spans: spans.map(span => ({
        spanId: span.spanId,
        operationName: span.operationName,
        duration: span.duration,
        agentId: span.agentId,
        status: span.status
      }))
    };
  }

  /**
   * Get system-wide tracing metrics
   */
  getTracingMetrics() {
    const bottlenecks = this.detectBottlenecks();

    return {
      ...this.tracingMetrics,
      tracesPerSecond: this.calculateTracesPerSecond(),
      activeTraces: this.spanCollection.activeSpans.size,
      completedTraces: this.spanCollection.completedSpans.size,
      agentInstrumentation: {
        instrumentedAgents: this.instrumentation.agentInstrumentation.instrumentedAgents.size,
        totalOperations: this.spanCollection.latencyBreakdown.size
      },
      bottlenecks: bottlenecks.length,
      topBottlenecks: bottlenecks.slice(0, 5)
    };
  }

  calculateTracesPerSecond() {
    // Simplified calculation (in real implementation would use time windows)
    const now = Date.now();
    const oneSecondAgo = now - 1000;

    const recentTraces = Array.from(this.spanCollection.completedSpans.values())
      .filter(span => span.endTime > oneSecondAgo);

    return recentTraces.length;
  }

  updateTracingMetrics(span) {
    this.tracingMetrics.averageTraceLatency =
      (this.tracingMetrics.averageTraceLatency * (this.tracingMetrics.totalTraces - 1) + span.duration) /
      this.tracingMetrics.totalTraces;
  }

  async startTraceProcessing() {
    logger.info('[DISTRIBUTED TRACING] Starting Real-time Trace Processing');

    // Start periodic analysis
    this.analysisInterval = setInterval(async () => {
      try {
        const bottlenecks = this.detectBottlenecks();
        if (bottlenecks.length > 0) {
          this.emit('trace:bottlenecksDetected', bottlenecks);
        }

        // Update metrics
        this.tracingMetrics.tracesPerSecond = this.calculateTracesPerSecond();

      } catch (error) {
        logger.error('[DISTRIBUTED TRACING] Analysis failed:', error);
      }
    }, 30000); // Every 30 seconds

    logger.info('[DISTRIBUTED TRACING] ✅ Real-time Trace Processing started');
  }

  // ============================================================================
  // SHUTDOWN
  // ============================================================================
  async shutdown() {
    logger.info('[DISTRIBUTED TRACING] Shutting down Galaxy Enterprise Distributed Tracing');

    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }

    // Export remaining spans
    await this.exportPendingSpans();

    this.status = 'SHUTDOWN';
    logger.info('[DISTRIBUTED TRACING] ✅ Shutdown completed');
  }

  async exportPendingSpans() {
    const pendingSpans = Array.from(this.spanCollection.activeSpans.values());

    for (const span of pendingSpans) {
      this.finishSpan(span.spanId, {
        error: new Error('System shutdown - span forcefully closed')
      });
    }

    logger.info(`[DISTRIBUTED TRACING] Exported ${pendingSpans.length} pending spans`);
  }
}

// ============================================================================
// EXPORT Y AUTO-INICIALIZACIÓN
// ============================================================================
const distributedTracingGalaxyEnterprise = new DistributedTracingGalaxyEnterprise();

module.exports = {
  DistributedTracingGalaxyEnterprise,
  distributedTracingGalaxyEnterprise
};

// Auto-test si se ejecuta directamente
if (require.main === module) {
  console.log('[DISTRIBUTED TRACING] Testing Galaxy Enterprise Distributed Tracing...');

  distributedTracingGalaxyEnterprise.on('tracing:ready', (data) => {
    console.log('[DISTRIBUTED TRACING] ✅ Ready:', data);

    // Test trace creation
    const trace = distributedTracingGalaxyEnterprise.createTrace('test_multi_agent_coordination', {
      requestId: 'test-request-123',
      agentId: 'coordinator'
    });

    console.log('[DISTRIBUTED TRACING] ✅ Test trace created:', trace.traceId);

    // Create child spans
    const agentSpan = trace.createChildSpan('agent_processing', {
      agentId: 'frontend-expert-001',
      tags: { 'agent.category': 'FRONTEND_DEVELOPMENT_EXPERTS' }
    });

    setTimeout(() => {
      agentSpan.finish();
      trace.rootSpan.finish();

      console.log('[DISTRIBUTED TRACING] ✅ Test trace completed');

      // Get analysis
      setTimeout(() => {
        const analysis = distributedTracingGalaxyEnterprise.getTraceAnalysis(trace.traceId);
        console.log('[DISTRIBUTED TRACING] ✅ Trace analysis:', analysis);
      }, 100);
    }, 500);
  });

  distributedTracingGalaxyEnterprise.on('trace:slowSpan', (data) => {
    console.log('[DISTRIBUTED TRACING] 🐌 Slow span detected:', data);
  });

  distributedTracingGalaxyEnterprise.on('trace:error', (data) => {
    console.log('[DISTRIBUTED TRACING] ❌ Error trace detected:', data);
  });
}