// Fallback metrics module when prom-client is not available
// Provides same interface but with simplified implementation

// Simple counter implementation
class SimpleCounter {
  constructor(config) {
    this.name = config.name;
    this.help = config.help;
    this.value = 0;
  }

  inc(amount = 1) {
    this.value += amount;
  }

  getValue() {
    return this.value;
  }
}

// Create simple counters for critical operations
const orchestratorTasksSuccess = new SimpleCounter({
  name: 'sandra_orchestrator_tasks_success_total',
  help: 'Total number of successful orchestrator tasks'
});

const orchestratorTasksFail = new SimpleCounter({
  name: 'sandra_orchestrator_tasks_fail_total',
  help: 'Total number of failed orchestrator tasks'
});

const llmCallsSuccess = new SimpleCounter({
  name: 'sandra_llm_calls_success_total',
  help: 'Total number of successful LLM API calls'
});

const llmCallsFail = new SimpleCounter({
  name: 'sandra_llm_calls_fail_total',
  help: 'Total number of failed LLM API calls'
});

const llmCallsRetries = new SimpleCounter({
  name: 'sandra_llm_calls_retries_total',
  help: 'Total number of LLM call retries due to parsing failures'
});

// Custom metrics for multi-agent coordinator
const multiAgentTasksSuccess = new SimpleCounter({
  name: 'sandra_multi_agent_tasks_success_total',
  help: 'Total number of successful multi-agent tasks'
});

const multiAgentTasksFail = new SimpleCounter({
  name: 'sandra_multi_agent_tasks_fail_total',
  help: 'Total number of failed multi-agent tasks'
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

function incrementMultiAgentSuccess() {
  multiAgentTasksSuccess.inc();
}

function incrementMultiAgentFailure() {
  multiAgentTasksFail.inc();
}

// Record custom metric
function recordMetric(name, value) {
  // Simple implementation - could be enhanced
  console.debug(`[METRICS] ${name}: ${value}`);
}

// Export simple metrics format
function getMetrics() {
  const metrics = {
    timestamp: new Date().toISOString(),
    counters: {
      orchestrator_tasks_success: orchestratorTasksSuccess.getValue(),
      orchestrator_tasks_fail: orchestratorTasksFail.getValue(),
      llm_calls_success: llmCallsSuccess.getValue(),
      llm_calls_fail: llmCallsFail.getValue(),
      llm_calls_retries: llmCallsRetries.getValue(),
      multi_agent_tasks_success: multiAgentTasksSuccess.getValue(),
      multi_agent_tasks_fail: multiAgentTasksFail.getValue()
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };

  // Return as text format for compatibility
  return JSON.stringify(metrics, null, 2);
}

// Simple register mock
const register = {
  metrics: getMetrics,
  setDefaultLabels: () => {},
  clear: () => {}
};

module.exports = {
  register,
  getMetrics,
  incrementOrchestratorSuccess,
  incrementOrchestratorFailure,
  incrementLLMSuccess,
  incrementLLMFailure,
  incrementRetries,
  incrementMultiAgentSuccess,
  incrementMultiAgentFailure,
  recordMetric
};