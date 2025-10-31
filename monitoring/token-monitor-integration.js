/**
 * INTEGRATION: Token Monitor con Orquestador
 * Integra el monitoreo de tokens en el sistema de orquestación
 */

const { getTokenMonitor } = require('./token-monitor');

class TokenMonitorIntegration {
  constructor() {
    this.monitor = getTokenMonitor();
    this.estimatedTokensPerRequest = {
      orchestrator: 3000, // Estimación por interacción
      subagent: 4000,      // Estimación por tarea de subagente
      chat: 2000,          // Estimación por mensaje de chat
      codeGeneration: 5000, // Estimación por generación de código
      analysis: 3500       // Estimación por análisis
    };
  }

  // Registrar consumo estimado (cuando no tenemos datos exactos)
  async recordEstimated(source, requestType = 'orchestrator') {
    const tokens = this.estimatedTokensPerRequest[requestType] || 3000;
    return await this.monitor.recordConsumption(source, tokens);
  }

  // Registrar consumo real (cuando tenemos datos exactos de API)
  async recordActual(source, tokens, cost = null) {
    return await this.monitor.recordConsumption(source, tokens, cost);
  }

  // Obtener reporte actual
  async getReport() {
    return await this.monitor.generateReport();
  }

  // Verificar si podemos agregar más subagentes
  async canAddSubagents(currentSubagents = 0, desiredSubagents = 1) {
    const projection = await this.monitor.getProjection();
    const avgDailyPerSubagent = 5; // $5/día estimado por subagente activo
    
    const additionalCost = avgDailyPerSubagent * projection.daysRemaining * desiredSubagents;
    const totalProjected = projection.projected + additionalCost;
    
    return {
      canAdd: totalProjected <= this.monitor.settings.planLimit * 1.1, // 10% margen
      currentProjected: projection.projected,
      withSubagents: totalProjected,
      recommendedPlan: this.monitor.getRecommendedPlan(totalProjected),
      warning: totalProjected > this.monitor.settings.planLimit
    };
  }

  // Log automático de consumo
  async logOrchestratorAction(actionType) {
    return await this.recordEstimated('orchestrator', actionType);
  }

  async logSubagentAction(subagentName, taskType = 'subagent') {
    return await this.recordEstimated(`subagent-${subagentName}`, taskType);
  }
}

module.exports = {
  TokenMonitorIntegration
};

