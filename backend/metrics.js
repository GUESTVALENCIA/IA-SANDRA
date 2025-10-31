// Try to load prom-client, fallback to simple implementation if not available
let client, register;

try {
  client = require('prom-client');
  // Create a Registry which registers the metrics
  register = new client.Registry();
} catch (error) {
  console.warn('[METRICS] prom-client not available, using fallback implementation');
  const fallback = require('./metrics-fallback');
  module.exports = fallback;
  return;
}

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'sandra-ia'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Create custom counters for critical operations
const orchestratorTasksSuccess = new client.Counter({
  name: 'sandra_orchestrator_tasks_success_total',
  help: 'Total number of successful orchestrator tasks',
  registers: [register]
});

const orchestratorTasksFail = new client.Counter({
  name: 'sandra_orchestrator_tasks_fail_total',
  help: 'Total number of failed orchestrator tasks',
  registers: [register]
});

const llmCallsSuccess = new client.Counter({
  name: 'sandra_llm_calls_success_total',
  help: 'Total number of successful LLM API calls',
  registers: [register]
});

const llmCallsFail = new client.Counter({
  name: 'sandra_llm_calls_fail_total',
  help: 'Total number of failed LLM API calls',
  registers: [register]
});

const llmCallsRetries = new client.Counter({
  name: 'sandra_llm_calls_retries_total',
  help: 'Total number of LLM call retries due to parsing failures',
  registers: [register]
});

// Galaxy Enterprise Metrics
const agentPerformanceGauge = new client.Gauge({
  name: 'sandra_agent_performance',
  help: 'Current performance metrics for agents',
  labelNames: ['agent_id', 'metric_type'],
  registers: [register]
});

const systemHealthGauge = new client.Gauge({
  name: 'sandra_system_health',
  help: 'System health indicators',
  labelNames: ['component', 'metric'],
  registers: [register]
});

const coordinationMetrics = new client.Counter({
  name: 'sandra_coordination_operations_total',
  help: 'Total coordination operations',
  labelNames: ['operation_type', 'status'],
  registers: [register]
});

const performanceAnomalies = new client.Counter({
  name: 'sandra_performance_anomalies_total',
  help: 'Total performance anomalies detected',
  labelNames: ['anomaly_type', 'severity'],
  registers: [register]
});

const resourceUtilization = new client.Gauge({
  name: 'sandra_resource_utilization',
  help: 'Resource utilization metrics',
  labelNames: ['resource_type'],
  registers: [register]
});

// Export functions to increment counters
function incrementOrchestratorSuccess() {
  orchestratorTasksSuccess.inc();
}

function incrementOrchestratorFailure() {
  orchestratorTasksFail.inc();
}

function incrementLLMSuccess() {
  llmCallsSuccess.inc();
}

function incrementLLMFailure() {
  llmCallsFail.inc();
}

function incrementRetries() {
  llmCallsRetries.inc();
}

// Galaxy Enterprise metric functions
function recordAgentPerformance(agentId, metricType, value) {
  try {
    agentPerformanceGauge.set({ agent_id: agentId, metric_type: metricType }, value);
  } catch (error) {
    console.warn(`[METRICS] Failed to record agent performance: ${error.message}`);
  }
}

function recordSystemHealth(component, metric, value) {
  try {
    systemHealthGauge.set({ component, metric }, value);
  } catch (error) {
    console.warn(`[METRICS] Failed to record system health: ${error.message}`);
  }
}

function incrementCoordinationOperation(operationType, status) {
  try {
    coordinationMetrics.inc({ operation_type: operationType, status });
  } catch (error) {
    console.warn(`[METRICS] Failed to increment coordination metric: ${error.message}`);
  }
}

function incrementPerformanceAnomaly(anomalyType, severity) {
  try {
    performanceAnomalies.inc({ anomaly_type: anomalyType, severity });
  } catch (error) {
    console.warn(`[METRICS] Failed to increment anomaly metric: ${error.message}`);
  }
}

function recordResourceUtilization(resourceType, value) {
  try {
    resourceUtilization.set({ resource_type: resourceType }, value);
  } catch (error) {
    console.warn(`[METRICS] Failed to record resource utilization: ${error.message}`);
  }
}

function recordMetric(metricName, value, labels = {}) {
  try {
    // Generic metric recording function for compatibility
    switch (metricName) {
      case 'multi_agent_coordinator_active_agents':
        recordSystemHealth('coordinator', 'active_agents', value);
        break;
      case 'multi_agent_coordinator_ready_agents':
        recordSystemHealth('coordinator', 'ready_agents', value);
        break;
      case 'multi_agent_coordinator_workflows':
        recordSystemHealth('coordinator', 'workflows', value);
        break;
      default:
        // For unknown metrics, use system health with generic component
        recordSystemHealth('system', metricName, value);
    }
  } catch (error) {
    console.warn(`[METRICS] Failed to record generic metric ${metricName}: ${error.message}`);
  }
}

// Performance Monitor integration functions
function recordPerformanceMetrics(data) {
  try {
    if (data.agents) {
      recordSystemHealth('system', 'total_agents', data.agents.totalAgents || 0);
      recordSystemHealth('system', 'active_agents', data.agents.activeAgents || 0);
      recordSystemHealth('system', 'agent_response_time', data.agents.averageResponseTime || 0);
      recordSystemHealth('system', 'agent_success_rate', data.agents.successRate || 0);
      recordSystemHealth('system', 'agent_throughput', data.agents.throughput || 0);
      recordSystemHealth('system', 'agent_error_rate', data.agents.errorRate || 0);
    }

    if (data.system) {
      recordResourceUtilization('cpu', data.system.cpuUsage || 0);
      recordResourceUtilization('memory', data.system.memoryUsage || 0);
      recordResourceUtilization('network', data.system.networkLatency || 0);
      recordResourceUtilization('disk', data.system.diskIOPS || 0);
    }

    if (data.kpis) {
      recordSystemHealth('kpi', 'availability', data.kpis.availability || 0);
      recordSystemHealth('kpi', 'performance', data.kpis.systemThroughput || 0);
      recordSystemHealth('kpi', 'response_time', data.kpis.responseTime || 0);
      recordSystemHealth('kpi', 'error_rate', data.kpis.errorRate || 0);
    }
  } catch (error) {
    console.warn(`[METRICS] Failed to record performance metrics: ${error.message}`);
  }
}

function recordAnomalyDetected(anomaly) {
  try {
    incrementPerformanceAnomaly(anomaly.category || 'unknown', anomaly.severity || 'unknown');
    recordSystemHealth('anomaly', 'last_detected', Date.now());
  } catch (error) {
    console.warn(`[METRICS] Failed to record anomaly: ${error.message}`);
  }
}

function recordAlertGenerated(alert) {
  try {
    incrementCoordinationOperation('alert', alert.severity || 'unknown');
    recordSystemHealth('alert', 'last_generated', Date.now());
  } catch (error) {
    console.warn(`[METRICS] Failed to record alert: ${error.message}`);
  }
}

// Export the register for metrics endpoint
function getMetrics() {
  return register.metrics();
}

// Enhanced metrics export for Galaxy Enterprise
async function getEnterpriseMetrics() {
  try {
    const metrics = await register.metrics();
    return {
      prometheus: metrics,
      timestamp: Date.now(),
      format: 'prometheus',
      source: 'sandra_galaxy_enterprise'
    };
  } catch (error) {
    console.error(`[METRICS] Failed to get enterprise metrics: ${error.message}`);
    return {
      error: error.message,
      timestamp: Date.now()
    };
  }
}

module.exports = {
  register,
  getMetrics,
  getEnterpriseMetrics,

  // Original functions
  incrementOrchestratorSuccess,
  incrementOrchestratorFailure,
  incrementLLMSuccess,
  incrementLLMFailure,
  incrementRetries,

  // Galaxy Enterprise functions
  recordAgentPerformance,
  recordSystemHealth,
  incrementCoordinationOperation,
  incrementPerformanceAnomaly,
  recordResourceUtilization,
  recordMetric,

  // Performance Monitor integration
  recordPerformanceMetrics,
  recordAnomalyDetected,
  recordAlertGenerated
};