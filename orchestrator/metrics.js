// Prometheus metrics (opcional, solo si prom-client está disponible)
let promRegistry = null;
let promClient = null;

try {
  promClient = require('prom-client');
  promRegistry = new promClient.Registry();
  
  // Registrar métricas básicas
  promRegistry.setDefaultLabels({ app: 'sandra-devconsole' });
  
  console.log('[METRICS] Prometheus client initialized');
} catch (error) {
  console.warn('[METRICS] prom-client not available, using internal metrics only');
}

class MetricsCollector {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      system: {
        uptime: 0,
        totalRequests: 0,
        totalResponses: 0,
        averageResponseTime: 0,
        peakResponseTime: 0,
        errorRate: 0,
        successRate: 0,
        requestsPerMinute: 0,
        memoryUsage: 0,
        cpuUsage: 0
      },
      services: {},
      conversations: {
        total: 0,
        active: 0,
        averageLength: 0,
        averageDuration: 0,
        multimodalUsage: {
          textOnly: 0,
          withVoice: 0,
          withAvatar: 0,
          fullMultimodal: 0
        }
      },
      errors: {
        total: 0,
        byService: {},
        byType: {},
        recent: []
      },
      performance: {
        responseTimeHistory: [],
        requestHistory: [],
        errorHistory: []
      }
    };

    this.requestHistory = [];
    this.maxHistorySize = 1000;

    // Inicializar métricas Prometheus si está disponible
    if (promClient && promRegistry) {
      this.initPrometheusMetrics();
    }

    // Iniciar recolección automática
    this.startPeriodicCollection();
  }

  initPrometheusMetrics() {
    // Contador de requests totales
    this.promRequestsTotal = new promClient.Counter({
      name: 'sandra_requests_total',
      help: 'Total number of requests',
      labelNames: ['service', 'status'],
      registers: [promRegistry]
    });

    // Histograma de tiempo de respuesta
    this.promResponseTime = new promClient.Histogram({
      name: 'sandra_response_time_seconds',
      help: 'Response time in seconds',
      labelNames: ['service'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [promRegistry]
    });

    // Gauge de uptime
    this.promUptime = new promClient.Gauge({
      name: 'sandra_uptime_seconds',
      help: 'System uptime in seconds',
      registers: [promRegistry]
    });

    // Gauge de memoria
    this.promMemory = new promClient.Gauge({
      name: 'sandra_memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
      registers: [promRegistry]
    });
  }

  getPrometheusMetrics() {
    if (!promRegistry) {
      return null;
    }
    return promRegistry.metrics();
  }

  recordRequest(serviceName, startTime, endTime, success, error = null) {
    const responseTime = endTime - startTime;
    const timestamp = Date.now();

    // Métricas del sistema
    this.metrics.system.totalRequests++;
    if (success) {
      this.metrics.system.totalResponses++;
    }

    // Actualizar tiempo de respuesta promedio
    this.updateAverageResponseTime(responseTime);

    // Actualizar pico de tiempo de respuesta
    if (responseTime > this.metrics.system.peakResponseTime) {
      this.metrics.system.peakResponseTime = responseTime;
    }

    // Métricas por servicio
    if (!this.metrics.services[serviceName]) {
      this.metrics.services[serviceName] = {
        requests: 0,
        responses: 0,
        errors: 0,
        averageResponseTime: 0,
        totalResponseTime: 0,
        status: 'unknown',
        lastRequest: timestamp,
        uptime: 100
      };
    }

    const service = this.metrics.services[serviceName];
    service.requests++;
    service.lastRequest = timestamp;

    if (success) {
      service.responses++;
      service.totalResponseTime += responseTime;
      service.averageResponseTime = service.totalResponseTime / service.responses;
      service.status = 'healthy';
    } else {
      service.errors++;
      service.status = 'error';

      // Registrar error
      this.recordError(serviceName, error);
    }

    // Calcular uptime del servicio
    service.uptime = service.requests > 0 ? (service.responses / service.requests) * 100 : 0;

    // Historial de requests
    this.requestHistory.push({
      timestamp,
      serviceName,
      responseTime,
      success,
      error: error?.message
    });

    if (this.requestHistory.length > this.maxHistorySize) {
      this.requestHistory.shift();
    }

    // Actualizar métricas Prometheus
    if (this.promRequestsTotal) {
      this.promRequestsTotal.inc({
        service: serviceName,
        status: success ? 'success' : 'error'
      });
    }
    if (this.promResponseTime) {
      this.promResponseTime.observe({ service: serviceName }, responseTime / 1000);
    }

    // Actualizar historial de performance
    this.metrics.performance.responseTimeHistory.push({
      timestamp,
      value: responseTime,
      service: serviceName
    });

    this.metrics.performance.requestHistory.push({
      timestamp,
      success,
      service: serviceName
    });

    // Mantener solo últimos 500 puntos
    if (this.metrics.performance.responseTimeHistory.length > 500) {
      this.metrics.performance.responseTimeHistory.shift();
    }

    if (this.metrics.performance.requestHistory.length > 500) {
      this.metrics.performance.requestHistory.shift();
    }

    this.updateSystemMetrics();
  }

  recordError(serviceName, error) {
    this.metrics.errors.total++;

    // Por servicio
    if (!this.metrics.errors.byService[serviceName]) {
      this.metrics.errors.byService[serviceName] = 0;
    }
    this.metrics.errors.byService[serviceName]++;

    // Por tipo de error
    const errorType = error?.name || 'UnknownError';
    if (!this.metrics.errors.byType[errorType]) {
      this.metrics.errors.byType[errorType] = 0;
    }
    this.metrics.errors.byType[errorType]++;

    // Errores recientes
    this.metrics.errors.recent.push({
      timestamp: Date.now(),
      service: serviceName,
      type: errorType,
      message: error?.message || 'Unknown error',
      stack: error?.stack
    });

    // Mantener solo últimos 100 errores
    if (this.metrics.errors.recent.length > 100) {
      this.metrics.errors.recent.shift();
    }

    // Historial de errores para gráficos
    this.metrics.performance.errorHistory.push({
      timestamp: Date.now(),
      service: serviceName,
      type: errorType
    });

    if (this.metrics.performance.errorHistory.length > 200) {
      this.metrics.performance.errorHistory.shift();
    }
  }

  recordConversation(type = 'textOnly', duration = 0, messageCount = 0) {
    this.metrics.conversations.total++;

    // Tipo de conversación
    if (this.metrics.conversations.multimodalUsage[type]) {
      this.metrics.conversations.multimodalUsage[type]++;
    }

    // Actualizar promedios
    if (messageCount > 0) {
      this.updateAverageConversationLength(messageCount);
    }

    if (duration > 0) {
      this.updateAverageConversationDuration(duration);
    }
  }

  updateAverageResponseTime(responseTime) {
    const currentAvg = this.metrics.system.averageResponseTime;
    const totalResponses = this.metrics.system.totalResponses;

    if (totalResponses === 0) {
      this.metrics.system.averageResponseTime = responseTime;
    } else {
      this.metrics.system.averageResponseTime =
        ((currentAvg * (totalResponses - 1)) + responseTime) / totalResponses;
    }
  }

  updateAverageConversationLength(messageCount) {
    const currentAvg = this.metrics.conversations.averageLength;
    const total = this.metrics.conversations.total;

    this.metrics.conversations.averageLength =
      ((currentAvg * (total - 1)) + messageCount) / total;
  }

  updateAverageConversationDuration(duration) {
    const currentAvg = this.metrics.conversations.averageDuration;
    const total = this.metrics.conversations.total;

    this.metrics.conversations.averageDuration =
      ((currentAvg * (total - 1)) + duration) / total;
  }

  updateSystemMetrics() {
    // Uptime del sistema
    const uptimeMs = Date.now() - this.startTime;
    this.metrics.system.uptime = uptimeMs;
    
    // Actualizar Prometheus uptime
    if (this.promUptime) {
      this.promUptime.set(uptimeMs / 1000);
    }

    // Tasa de éxito/error
    const totalRequests = this.metrics.system.totalRequests;
    if (totalRequests > 0) {
      this.metrics.system.successRate =
        (this.metrics.system.totalResponses / totalRequests) * 100;
      this.metrics.system.errorRate =
        ((totalRequests - this.metrics.system.totalResponses) / totalRequests) * 100;
    }

    // Requests por minuto (últimos 60 segundos)
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = this.requestHistory.filter(req => req.timestamp > oneMinuteAgo);
    this.metrics.system.requestsPerMinute = recentRequests.length;

    // Uso de memoria (si está disponible)
    if (process.memoryUsage) {
      const memUsage = process.memoryUsage();
      this.metrics.system.memoryUsage = {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024) // MB
      };
      
      // Actualizar métricas Prometheus
      if (this.promMemory) {
        this.promMemory.set({ type: 'rss' }, memUsage.rss);
        this.promMemory.set({ type: 'heapUsed' }, memUsage.heapUsed);
        this.promMemory.set({ type: 'heapTotal' }, memUsage.heapTotal);
        this.promMemory.set({ type: 'external' }, memUsage.external);
      }
    }
  }

  startPeriodicCollection() {
    // Actualizar métricas cada 30 segundos
    setInterval(() => {
      this.updateSystemMetrics();
      this.cleanupOldData();
    }, 30000);

    // Reporte de salud cada 5 minutos
    setInterval(() => {
      this.generateHealthReport();
    }, 300000);
  }

  cleanupOldData() {
    const oneHourAgo = Date.now() - 3600000;

    // Limpiar errores antiguos
    this.metrics.errors.recent = this.metrics.errors.recent.filter(
      error => error.timestamp > oneHourAgo
    );

    // Limpiar historial de performance antiguo
    this.metrics.performance.responseTimeHistory =
      this.metrics.performance.responseTimeHistory.filter(
        entry => entry.timestamp > oneHourAgo
      );

    this.metrics.performance.requestHistory =
      this.metrics.performance.requestHistory.filter(
        entry => entry.timestamp > oneHourAgo
      );

    this.metrics.performance.errorHistory =
      this.metrics.performance.errorHistory.filter(
        entry => entry.timestamp > oneHourAgo
      );
  }

  generateHealthReport() {
    const report = {
      timestamp: new Date().toISOString(),
      system: {
        status: this.getSystemHealthStatus(),
        uptime: this.formatUptime(this.metrics.system.uptime),
        requestsPerMinute: this.metrics.system.requestsPerMinute,
        errorRate: this.metrics.system.errorRate.toFixed(2) + '%',
        averageResponseTime: this.metrics.system.averageResponseTime.toFixed(0) + 'ms'
      },
      services: Object.keys(this.metrics.services).map(serviceName => ({
        name: serviceName,
        status: this.metrics.services[serviceName].status,
        uptime: this.metrics.services[serviceName].uptime.toFixed(1) + '%',
        avgResponseTime: this.metrics.services[serviceName].averageResponseTime.toFixed(0) + 'ms',
        requests: this.metrics.services[serviceName].requests,
        errors: this.metrics.services[serviceName].errors
      })),
      recommendations: this.generateRecommendations()
    };

    console.log('Sandra DevConsole Health Report:', JSON.stringify(report, null, 2));
    return report;
  }

  getSystemHealthStatus() {
    if (this.metrics.system.errorRate > 20) return 'critical';
    if (this.metrics.system.errorRate > 10) return 'warning';
    if (this.metrics.system.averageResponseTime > 5000) return 'degraded';
    return 'healthy';
  }

  generateRecommendations() {
    const recommendations = [];

    // Alta tasa de errores
    if (this.metrics.system.errorRate > 10) {
      recommendations.push('Investigar alta tasa de errores en el sistema');
    }

    // Tiempo de respuesta alto
    if (this.metrics.system.averageResponseTime > 3000) {
      recommendations.push('Optimizar tiempo de respuesta del sistema');
    }

    // Servicios con problemas
    Object.keys(this.metrics.services).forEach(serviceName => {
      const service = this.metrics.services[serviceName];
      if (service.uptime < 90) {
        recommendations.push(`Verificar conectividad del servicio ${serviceName}`);
      }
      if (service.averageResponseTime > 5000) {
        recommendations.push(`Optimizar rendimiento del servicio ${serviceName}`);
      }
    });

    return recommendations;
  }

  formatUptime(uptimeMs) {
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  getMetrics() {
    return {
      ...this.metrics,
      timestamp: Date.now(),
      systemHealth: this.getSystemHealthStatus(),
      summary: {
        totalServices: Object.keys(this.metrics.services).length,
        healthyServices: Object.values(this.metrics.services)
          .filter(s => s.status === 'healthy').length,
        uptimeFormatted: this.formatUptime(this.metrics.system.uptime),
        requestsPerMinute: this.metrics.system.requestsPerMinute,
        errorRateFormatted: this.metrics.system.errorRate.toFixed(2) + '%'
      }
    };
  }

  reset() {
    this.startTime = Date.now();
    this.requestHistory = [];
    this.metrics = {
      system: {
        uptime: 0,
        totalRequests: 0,
        totalResponses: 0,
        averageResponseTime: 0,
        peakResponseTime: 0,
        errorRate: 0,
        successRate: 0,
        requestsPerMinute: 0,
        memoryUsage: 0,
        cpuUsage: 0
      },
      services: {},
      conversations: {
        total: 0,
        active: 0,
        averageLength: 0,
        averageDuration: 0,
        multimodalUsage: {
          textOnly: 0,
          withVoice: 0,
          withAvatar: 0,
          fullMultimodal: 0
        }
      },
      errors: {
        total: 0,
        byService: {},
        byType: {},
        recent: []
      },
      performance: {
        responseTimeHistory: [],
        requestHistory: [],
        errorHistory: []
      }
    };

    console.log('Metrics collector reset');
  }
}

module.exports = { MetricsCollector };