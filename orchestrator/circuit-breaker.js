class CircuitBreaker {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.failureThreshold = options.failureThreshold || 5;
    this.timeoutDuration = options.timeout || 30000; // 30 segundos
    this.resetTimeout = options.resetTimeout || 60000; // 1 minuto
    this.monitoringPeriod = options.monitoringPeriod || 300000; // 5 minutos

    // Estados: CLOSED, OPEN, HALF_OPEN
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = Date.now();

    // Métricas
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      timeouts: 0,
      circuitOpenCount: 0,
      averageResponseTime: 0,
      lastResponseTime: 0,
      uptime: 0,
      lastSuccessTime: Date.now(),
      consecutiveFailures: 0,
      consecutiveSuccesses: 0
    };

    this.responseTimes = [];
    this.maxResponseTimeHistory = 100; // Mantener últimas 100 respuestas

    console.log(`Circuit Breaker initialized for ${serviceName}`);
  }

  async execute(operation) {
    this.metrics.totalRequests++;

    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker OPEN for ${this.serviceName}. Next attempt in ${Math.ceil((this.nextAttempt - Date.now()) / 1000)}s`);
      } else {
        this.state = 'HALF_OPEN';
        console.log(`Circuit breaker for ${this.serviceName} transitioning to HALF_OPEN`);
      }
    }

    const startTime = Date.now();

    try {
      // Timeout wrapper
      const result = await Promise.race([
        operation(),
        this.createTimeoutPromise()
      ]);

      const responseTime = Date.now() - startTime;
      this.onSuccess(responseTime);

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (error.message === 'Operation timeout') {
        this.metrics.timeouts++;
      }

      this.onFailure(error, responseTime);
      throw error;
    }
  }

  createTimeoutPromise() {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Operation timeout'));
      }, this.timeoutDuration);
    });
  }

  onSuccess(responseTime) {
    this.failureCount = 0;
    this.metrics.successfulRequests++;
    this.metrics.consecutiveFailures = 0;
    this.metrics.consecutiveSuccesses++;
    this.metrics.lastSuccessTime = Date.now();
    this.metrics.lastResponseTime = responseTime;

    // Actualizar tiempo de respuesta promedio
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.maxResponseTimeHistory) {
      this.responseTimes.shift();
    }
    this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log(`Circuit breaker for ${this.serviceName} CLOSED after successful recovery`);
    }

    this.calculateUptime();
  }

  onFailure(error, responseTime) {
    this.failureCount++;
    this.metrics.failedRequests++;
    this.metrics.consecutiveSuccesses = 0;
    this.metrics.consecutiveFailures++;
    this.lastFailureTime = Date.now();
    this.metrics.lastResponseTime = responseTime;

    console.error(`Circuit breaker failure for ${this.serviceName}:`, error.message);

    if (this.failureCount >= this.failureThreshold) {
      this.tripCircuit();
    }

    this.calculateUptime();
  }

  tripCircuit() {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.resetTimeout;
    this.metrics.circuitOpenCount++;

    console.warn(`Circuit breaker OPENED for ${this.serviceName}. Will retry at ${new Date(this.nextAttempt).toISOString()}`);
  }

  calculateUptime() {
    const total = this.metrics.successfulRequests + this.metrics.failedRequests;
    if (total > 0) {
      this.metrics.uptime = (this.metrics.successfulRequests / total) * 100;
    }
  }

  getState() {
    return {
      serviceName: this.serviceName,
      state: this.state,
      failureCount: this.failureCount,
      nextAttempt: this.nextAttempt,
      isHealthy: this.state === 'CLOSED' && this.metrics.consecutiveFailures < 3,
      metrics: { ...this.metrics }
    };
  }

  getHealthStatus() {
    const now = Date.now();
    const timeSinceLastSuccess = now - this.metrics.lastSuccessTime;
    const isStale = timeSinceLastSuccess > this.monitoringPeriod;

    let healthLevel = 'healthy';

    if (this.state === 'OPEN') {
      healthLevel = 'critical';
    } else if (this.metrics.consecutiveFailures >= 3 || isStale) {
      healthLevel = 'warning';
    } else if (this.metrics.uptime < 90) {
      healthLevel = 'degraded';
    }

    return {
      serviceName: this.serviceName,
      level: healthLevel,
      uptime: this.metrics.uptime,
      averageResponseTime: this.metrics.averageResponseTime,
      consecutiveFailures: this.metrics.consecutiveFailures,
      lastSuccess: new Date(this.metrics.lastSuccessTime).toISOString(),
      isStale: isStale,
      state: this.state,
      recommendation: this.getHealthRecommendation(healthLevel)
    };
  }

  getHealthRecommendation(level) {
    switch (level) {
      case 'critical':
        return `Servicio ${this.serviceName} está offline. Verificar conectividad y configuración.`;
      case 'warning':
        return `Servicio ${this.serviceName} presenta fallas intermitentes. Monitorear de cerca.`;
      case 'degraded':
        return `Servicio ${this.serviceName} funcionando con latencia elevada. Considerar optimización.`;
      default:
        return `Servicio ${this.serviceName} funcionando correctamente.`;
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = Date.now();

    console.log(`Circuit breaker for ${this.serviceName} manually reset`);
  }

  // Métricas detalladas para dashboard
  getDetailedMetrics() {
    return {
      serviceName: this.serviceName,
      state: this.state,
      metrics: {
        ...this.metrics,
        healthLevel: this.getHealthStatus().level,
        responseTimeHistory: [...this.responseTimes],
        errorRate: this.metrics.totalRequests > 0
          ? (this.metrics.failedRequests / this.metrics.totalRequests) * 100
          : 0,
        successRate: this.metrics.totalRequests > 0
          ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
          : 0,
        timeoutRate: this.metrics.totalRequests > 0
          ? (this.metrics.timeouts / this.metrics.totalRequests) * 100
          : 0
      },
      configuration: {
        failureThreshold: this.failureThreshold,
        timeoutDuration: this.timeoutDuration,
        resetTimeout: this.resetTimeout,
        monitoringPeriod: this.monitoringPeriod
      },
      timestamps: {
        lastFailure: this.lastFailureTime,
        lastSuccess: this.metrics.lastSuccessTime,
        nextAttempt: this.nextAttempt
      }
    };
  }
}

module.exports = { CircuitBreaker };