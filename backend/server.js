// backend/server.js
<<<<<<< HEAD
const env = require('../config/env');
const logger = require('./logger');
=======
const express = require('express');
const env = require('../config/env');
const logger = require('./logger');
const metrics = require('./metrics');
>>>>>>> 92152f2f6324c2fba025f9e798014e14d7a75193

// Initialize Sandra MCP Bridge with config
require('dotenv').config();

<<<<<<< HEAD
=======
const app = express();

// Health Endpoint (GET /health)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Readiness Endpoint (GET /ready)
app.get('/ready', (req, res) => {
  // Check if all critical services are ready
  const checks = {
    environment: !!env.PORT,
    logger: !!logger,
    metrics: !!metrics
  };

  const isReady = Object.values(checks).every(check => check);

  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not ready',
    checks,
    timestamp: new Date().toISOString()
  });
});

// Metrics Endpoint (GET /metrics)
app.get('/metrics', async (req, res) => {
  try {
    const metricsData = await metrics.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metricsData);
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get metrics');
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

>>>>>>> 92152f2f6324c2fba025f9e798014e14d7a75193
try {
  // Validate environment before starting
  logger.info('Starting Sandra MCP Bridge with validated environment');
  logger.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, 'Environment loaded');
<<<<<<< HEAD
  
  // Import and start the main bridge
  require('../sandra-mcp-bridge');
  
=======

  // Start HTTP server for health checks and metrics
  const server = app.listen(env.PORT || 3000, () => {
    logger.info({ port: env.PORT || 3000 }, 'Health and metrics server started');
  });

  // Import and start the main bridge
  require('../sandra-mcp-bridge');

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });

>>>>>>> 92152f2f6324c2fba025f9e798014e14d7a75193
} catch (error) {
  logger.fatal({ error: error.message, stack: error.stack }, 'Failed to start server');
  process.exit(1);
}
