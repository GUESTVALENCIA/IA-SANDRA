// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - METRICS ENDPOINT
// Telemetry, Performance Tracking, Health Dashboard
// ═══════════════════════════════════════════════════════════════════

const { withMiddleware, createSuccessResponse, createErrorResponse } = require('./shared/middleware');
const config = require('./shared/config');
const logger = require('./shared/logger');
const cache = require('./shared/cache');
const rateLimiter = require('./shared/rate-limiter');

// In-memory metrics storage
const metrics = {
  requests: {
    total: 0,
    byEndpoint: {},
    byStatus: {},
    errors: []
  },
  performance: {
    latency: [],
    tierUsage: {}
  },
  models: {
    calls: 0,
    failures: 0,
    byModel: {}
  },
  system: {
    startTime: Date.now(),
    lastHealthCheck: null,
    memory: []
  }
};

/**
 * Record request metric
 */
function recordRequest(endpoint, statusCode, latency) {
  metrics.requests.total++;

  // By endpoint
  if (!metrics.requests.byEndpoint[endpoint]) {
    metrics.requests.byEndpoint[endpoint] = 0;
  }
  metrics.requests.byEndpoint[endpoint]++;

  // By status
  const statusGroup = Math.floor(statusCode / 100) + 'xx';
  if (!metrics.requests.byStatus[statusGroup]) {
    metrics.requests.byStatus[statusGroup] = 0;
  }
  metrics.requests.byStatus[statusGroup]++;

  // Performance
  metrics.performance.latency.push({
    endpoint,
    latency,
    timestamp: Date.now()
  });

  // Keep only last 1000 latency entries
  if (metrics.performance.latency.length > 1000) {
    metrics.performance.latency = metrics.performance.latency.slice(-1000);
  }
}

/**
 * Record model usage
 */
function recordModelUsage(model, tier, success = true) {
  metrics.models.calls++;

  if (!success) {
    metrics.models.failures++;
  }

  // By model
  if (!metrics.models.byModel[model]) {
    metrics.models.byModel[model] = {
      calls: 0,
      failures: 0,
      tier
    };
  }
  metrics.models.byModel[model].calls++;
  if (!success) {
    metrics.models.byModel[model].failures++;
  }

  // Tier usage
  if (!metrics.performance.tierUsage[tier]) {
    metrics.performance.tierUsage[tier] = 0;
  }
  metrics.performance.tierUsage[tier]++;
}

/**
 * Record error
 */
function recordError(endpoint, error, context = {}) {
  metrics.requests.errors.push({
    endpoint,
    error: error.message,
    context,
    timestamp: Date.now()
  });

  // Keep only last 100 errors
  if (metrics.requests.errors.length > 100) {
    metrics.requests.errors = metrics.requests.errors.slice(-100);
  }
}

/**
 * Record memory usage
 */
function recordMemory() {
  const usage = process.memoryUsage();
  metrics.system.memory.push({
    rss: usage.rss,
    heapTotal: usage.heapTotal,
    heapUsed: usage.heapUsed,
    external: usage.external,
    timestamp: Date.now()
  });

  // Keep only last 100 memory snapshots
  if (metrics.system.memory.length > 100) {
    metrics.system.memory = metrics.system.memory.slice(-100);
  }
}

/**
 * Calculate statistics
 */
function calculateStats() {
  // Latency stats
  const latencies = metrics.performance.latency.map(l => l.latency);
  const avgLatency = latencies.length > 0
    ? latencies.reduce((a, b) => a + b, 0) / latencies.length
    : 0;
  const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;
  const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0;

  // Error rate
  const errorCount = metrics.requests.byStatus['5xx'] || 0;
  const errorRate = metrics.requests.total > 0
    ? (errorCount / metrics.requests.total * 100).toFixed(2)
    : 0;

  // Model success rate
  const modelSuccessRate = metrics.models.calls > 0
    ? ((1 - metrics.models.failures / metrics.models.calls) * 100).toFixed(2)
    : 100;

  // Uptime
  const uptime = Date.now() - metrics.system.startTime;

  return {
    latency: {
      avg: Math.round(avgLatency),
      max: maxLatency,
      min: minLatency,
      unit: 'ms'
    },
    errorRate: `${errorRate}%`,
    modelSuccessRate: `${modelSuccessRate}%`,
    uptime: formatUptime(uptime),
    requestsPerMinute: calculateRPM()
  };
}

/**
 * Format uptime
 */
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Calculate requests per minute
 */
function calculateRPM() {
  const oneMinuteAgo = Date.now() - 60000;
  const recentRequests = metrics.performance.latency.filter(
    l => l.timestamp > oneMinuteAgo
  );
  return recentRequests.length;
}

/**
 * Check health of external services
 */
async function checkHealth() {
  const health = {
    status: 'healthy',
    checks: {},
    timestamp: Date.now()
  };

  // Check Ollama
  if (config.healthCheck.checkOllama) {
    try {
      const response = await fetch(`${config.models.ollama.baseUrl}/api/tags`, {
        timeout: config.healthCheck.timeout
      });
      health.checks.ollama = response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      health.checks.ollama = 'unhealthy';
      health.status = 'degraded';
    }
  }

  // Check API keys
  health.checks.apiKeys = {
    groq: !!process.env.GROQ_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    cartesia: !!process.env.CARTESIA_API_KEY
  };

  metrics.system.lastHealthCheck = health;
  return health;
}

/**
 * Get tier distribution
 */
function getTierDistribution() {
  const total = Object.values(metrics.performance.tierUsage)
    .reduce((a, b) => a + b, 0);

  if (total === 0) return {};

  const distribution = {};
  for (const [tier, count] of Object.entries(metrics.performance.tierUsage)) {
    distribution[`tier${tier}`] = {
      count,
      percentage: `${(count / total * 100).toFixed(2)}%`
    };
  }

  return distribution;
}

/**
 * Main handler
 */
const handler = async (event, context, { requestId, body, logger: requestLogger }) => {
  try {
    const { action = 'stats', endpoint, period = '1h' } = body;

    let result = {};

    switch (action) {
      case 'stats':
        // Return overall statistics
        result = {
          stats: calculateStats(),
          requests: {
            total: metrics.requests.total,
            byEndpoint: metrics.requests.byEndpoint,
            byStatus: metrics.requests.byStatus
          },
          models: {
            calls: metrics.models.calls,
            failures: metrics.models.failures,
            successRate: calculateStats().modelSuccessRate,
            byModel: metrics.models.byModel
          },
          tierDistribution: getTierDistribution(),
          cache: cache.getStats(),
          rateLimiter: rateLimiter.getStats()
        };
        break;

      case 'health':
        // Perform health check
        result = await checkHealth();
        break;

      case 'performance':
        // Return performance metrics
        const recentLatencies = metrics.performance.latency.slice(-100);
        result = {
          latency: recentLatencies,
          stats: calculateStats().latency,
          tierUsage: getTierDistribution()
        };
        break;

      case 'errors':
        // Return recent errors
        result = {
          errors: metrics.requests.errors,
          errorRate: calculateStats().errorRate,
          total: metrics.requests.errors.length
        };
        break;

      case 'system':
        // Record current memory and return
        recordMemory();
        const latestMemory = metrics.system.memory[metrics.system.memory.length - 1];
        result = {
          memory: {
            current: latestMemory,
            history: metrics.system.memory,
            unit: 'bytes'
          },
          uptime: calculateStats().uptime,
          startTime: new Date(metrics.system.startTime).toISOString(),
          nodeVersion: process.version
        };
        break;

      case 'record':
        // Record custom metric
        const { type, data } = body;
        if (type === 'request') {
          recordRequest(data.endpoint, data.statusCode, data.latency);
        } else if (type === 'model') {
          recordModelUsage(data.model, data.tier, data.success);
        } else if (type === 'error') {
          recordError(data.endpoint, new Error(data.error), data.context);
        }
        result = { recorded: true };
        break;

      default:
        throw new Error('Invalid action');
    }

    result.requestId = requestId;
    result.timestamp = new Date().toISOString();

    return createSuccessResponse(result);

  } catch (error) {
    requestLogger.error('Metrics endpoint failed', { error: error.message });
    return createErrorResponse(error);
  }
};

// Export with middleware
export default withMiddleware(handler, {
  endpoint: 'metrics',
  methods: ['GET', 'POST'],
  rateLimit: false, // Don't rate limit metrics endpoint
  logging: false // Don't log metrics requests to avoid recursion
});

// Export functions for use by other endpoints
module.exports.recordRequest = recordRequest;
module.exports.recordModelUsage = recordModelUsage;
module.exports.recordError = recordError;
module.exports.recordMemory = recordMemory;

