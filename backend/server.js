// backend/server.js
const express = require('express');
const env = require('../config/env');
const logger = require('./logger');
const metrics = require('./metrics');

// Initialize Sandra MCP Bridge with config
require('dotenv').config();

const app = express();

// Health Endpoint (GET /health)
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Sandra Backend Server',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    mode: 'GALAXY_ENTERPRISE'
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

try {
  // Validate environment before starting
  logger.info('Starting Sandra Backend Server with Galaxy Enterprise configuration');
  logger.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, 'Environment loaded');

  // Start HTTP server for health checks and metrics
  const server = app.listen(env.PORT || 3001, () => {
    logger.info({ port: env.PORT || 3001 }, 'Sandra Backend Server started (Galaxy Enterprise Mode)');
  });

  // Import and start the main bridge (if not already running)
  if (!process.env.SANDRA_MCP_BRIDGE_RUNNING) {
    require('../sandra-mcp-bridge');
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Sandra Backend Server closed');
      process.exit(0);
    });
  });
} catch (error) {
  logger.fatal({ error: error.message, stack: error.stack }, 'Failed to start server');
  process.exit(1);
}
