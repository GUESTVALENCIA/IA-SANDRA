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

// Export the register for metrics endpoint
function getMetrics() {
  return register.metrics();
}

module.exports = {
  register,
  getMetrics,
  incrementOrchestratorSuccess,
  incrementOrchestratorFailure,
  incrementLLMSuccess,
  incrementLLMFailure,
  incrementRetries
};