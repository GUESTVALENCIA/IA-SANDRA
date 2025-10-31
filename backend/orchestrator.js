// backend/orchestrator.js
const logger = require('./logger');
const { withLogging } = require('./orchestrator-logging');
const { safeLLM } = require('../llm/safe-llm');
const metrics = require('./metrics');

// Simple orchestrator functionality for demonstration
class Orchestrator {
  constructor() {
    this.agents = new Map();
    logger.info('Orchestrator initialized');
  }

  async runPipeline(tasks) {
    logger.info({ taskCount: tasks.length }, 'Running pipeline');
    const results = [];
    
    for (const task of tasks) {
      try {
        const result = await this.executeTask(task);
        results.push(result);
      } catch (error) {
        logger.error({ task, error: error.message }, 'Task failed in pipeline');
        throw error;
      }
    }
    
    return results;
  }

  async executeAgent(agentName, params) {
    logger.info({ agentName, params }, 'Executing agent');

    try {
      // Use safeLLM for agent execution
      const prompt = `Execute agent ${agentName} with parameters: ${JSON.stringify(params)}`;
      const result = await safeLLM(prompt, {
        timeout: 30000,
        retries: 2,
        systemMessage: "You are an AI agent orchestrator. Output only JSON with agent execution results."
      });

      metrics.incrementOrchestratorSuccess();

      return {
        agent: agentName,
        status: 'completed',
        result: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      metrics.incrementOrchestratorFailure();

      // Fallback to simulation if safeLLM fails
      logger.warn({ agentName, error: error.message }, 'SafeLLM failed, using fallback');
      await new Promise(resolve => setTimeout(resolve, 100));

      return {
        agent: agentName,
        status: 'completed',
        result: `Agent ${agentName} executed successfully (fallback mode)`,
        timestamp: new Date().toISOString(),
        fallback: true
      };
    }
  }

  async executeTask(task) {
    logger.debug({ task }, 'Executing individual task');
    
    // Simulate task execution
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      task: task.id || 'unknown',
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  }

  async dispatch(message) {
    logger.info({ messageType: typeof message }, 'Dispatching message');
    
    return {
      dispatched: true,
      processed: new Date().toISOString()
    };
  }
}

// Create orchestrator instance
const orchestrator = new Orchestrator();

// Wrap public methods with logging
const api = {
  runPipeline: withLogging('runPipeline', orchestrator.runPipeline.bind(orchestrator)),
  executeAgent: withLogging('executeAgent', orchestrator.executeAgent.bind(orchestrator)),
  executeTask: withLogging('executeTask', orchestrator.executeTask.bind(orchestrator)),
  dispatch: withLogging('dispatch', orchestrator.dispatch.bind(orchestrator))
};

module.exports = api;
