/**
 * Performance Monitor para Sandra DevConsole
 * Monitorea latencia, costos y detecta anomalías
 */

const { logger } = require('./logger');

class PerformanceMonitor {
  constructor(functionName = 'unknown') {
    this.functionName = functionName;
    this.metrics = {
      invocations: 0,
      totalLatency: 0,
      totalCost: 0,
      errors: 0,
      coldStarts: 0,
      startTime: Date.now()
    };
    
    // Thresholds para alertas
    this.thresholds = {
      highLatency: 5000, // 5 segundos
      highCostPerHour: 10, // $10/hora
      errorRate: 0.1 // 10% error rate
    };
    
    // Historial de métricas recientes
    this.recentMetrics = [];
    this.maxHistorySize = 100;
  }

  /**
   * Registrar métrica de función
   */
  recordMetric(startTime, status = 'success', cost = 0, isColdStart = false) {
    const latency = Date.now() - startTime;
    this.metrics.invocations++;
    this.metrics.totalLatency += latency;
    this.metrics.totalCost += cost;
    
    if (status !== 'success') {
      this.metrics.errors++;
    }
    
    if (isColdStart) {
      this.metrics.coldStarts++;
    }
    
    // Calcular promedios
    const avgLatency = this.metrics.totalLatency / this.metrics.invocations;
    const avgCost = this.metrics.totalCost / this.metrics.invocations;
    const errorRate = this.metrics.errors / this.metrics.invocations;
    
    // Agregar a historial
    const metric = {
      function: this.functionName,
      latency,
      status,
      cost,
      timestamp: Date.now(),
      isColdStart,
      avgLatency,
      avgCost,
      errorRate
    };
    
    this.recentMetrics.push(metric);
    if (this.recentMetrics.length > this.maxHistorySize) {
      this.recentMetrics.shift();
    }
    
    // Log estructurado
    logger.info('Function metric', metric);
    
    // Verificar alertas
    this.checkAlerts(metric);
    
    return metric;
  }

  /**
   * Verificar condiciones de alerta
   */
  checkAlerts(metric) {
    // Alerta de alta latencia
    if (metric.latency > this.thresholds.highLatency) {
      this.sendAlert('HIGH_LATENCY', {
        function: this.functionName,
        latency: metric.latency,
        threshold: this.thresholds.highLatency,
        message: `Latency ${metric.latency}ms exceeded ${this.thresholds.highLatency}ms`
      });
    }
    
    // Alerta de costo proyectado
    const uptimeHours = (Date.now() - this.metrics.startTime) / 3600000;
    if (uptimeHours > 0) {
      const hourlyCost = (this.metrics.totalCost / uptimeHours);
      if (hourlyCost > this.thresholds.highCostPerHour) {
        this.sendAlert('HIGH_COST', {
          function: this.functionName,
          hourlyCost: hourlyCost.toFixed(2),
          threshold: this.thresholds.highCostPerHour,
          message: `Projected cost $${hourlyCost.toFixed(2)}/hour exceeds $${this.thresholds.highCostPerHour}/hour`
        });
      }
    }
    
    // Alerta de tasa de errores
    if (metric.errorRate > this.thresholds.errorRate) {
      this.sendAlert('HIGH_ERROR_RATE', {
        function: this.functionName,
        errorRate: (metric.errorRate * 100).toFixed(1) + '%',
        threshold: (this.thresholds.errorRate * 100) + '%',
        message: `Error rate ${(metric.errorRate * 100).toFixed(1)}% exceeds ${this.thresholds.errorRate * 100}%`
      });
    }
  }

  /**
   * Enviar alerta
   */
  sendAlert(type, data) {
    logger.error(`[ALERT] ${type}`, data);
    
    // Aquí se puede integrar con servicios de alerting:
    // - Slack webhook
    // - Email
    // - WhatsApp Business API
    // - PagerDuty
    // - etc.
    
    // Por ahora, solo log estructurado
    console.error(JSON.stringify({
      alert: type,
      ...data,
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    const uptimeMs = Date.now() - this.metrics.startTime;
    const uptimeHours = uptimeMs / 3600000;
    
    return {
      function: this.functionName,
      uptime: {
        ms: uptimeMs,
        hours: uptimeHours.toFixed(2)
      },
      metrics: {
        invocations: this.metrics.invocations,
        avgLatency: this.metrics.invocations > 0 
          ? (this.metrics.totalLatency / this.metrics.invocations).toFixed(0) + 'ms'
          : '0ms',
        totalCost: '$' + this.metrics.totalCost.toFixed(4),
        hourlyCost: uptimeHours > 0 
          ? '$' + (this.metrics.totalCost / uptimeHours).toFixed(2) + '/hour'
          : '$0/hour',
        errorRate: this.metrics.invocations > 0
          ? ((this.metrics.errors / this.metrics.invocations) * 100).toFixed(1) + '%'
          : '0%',
        coldStartRate: this.metrics.invocations > 0
          ? ((this.metrics.coldStarts / this.metrics.invocations) * 100).toFixed(1) + '%'
          : '0%'
      },
      recentMetrics: this.recentMetrics.slice(-10) // Últimas 10
    };
  }

  /**
   * Resetear métricas
   */
  reset() {
    this.metrics = {
      invocations: 0,
      totalLatency: 0,
      totalCost: 0,
      errors: 0,
      coldStarts: 0,
      startTime: Date.now()
    };
    this.recentMetrics = [];
    logger.info('Performance metrics reset');
  }
}

// Exportar instancias para cada función
const chatMonitor = new PerformanceMonitor('chat');
const voiceMonitor = new PerformanceMonitor('voice');
const ttsMonitor = new PerformanceMonitor('tts');
const sttMonitor = new PerformanceMonitor('stt');

module.exports = { PerformanceMonitor, chatMonitor, voiceMonitor, ttsMonitor, sttMonitor };

