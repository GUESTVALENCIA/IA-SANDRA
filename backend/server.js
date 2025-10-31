/**
 * SANDRA IA GALAXY ENTERPRISE - BACKEND SERVER v7.0
 * Servidor Backend Unificado para Ecosistema Galaxy Enterprise
 * Manejo de Health, Metrics, y MCP Bridge Integration
 */

const express = require('express');
const env = require('../config/env');
const logger = require('./logger');
const metrics = require('./metrics');

// Initialize Sandra MCP Bridge with config
require('dotenv').config();

const app = express();
app.use(express.json());

// ============================================================================
// GALAXY ENTERPRISE HEALTH ENDPOINTS
// ============================================================================

// Health Endpoint (GET /health)
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Sandra IA Galaxy Enterprise Backend',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '7.0.0',
    mode: 'GALAXY_ENTERPRISE',
    ecosystem: {
      multiAgentCoordinator: 'ACTIVE',
      errorCoordinatorEnterprise: 'ACTIVE',
      knowledgeSynthesizer: 'ACTIVE',
      workflowOrchestrator: 'ACTIVE',
      guardianProtocol: 'ACTIVE'
    }
  });
});

// Readiness Endpoint (GET /ready)
app.get('/ready', (req, res) => {
  // Check if all critical Galaxy Enterprise services are ready
  const checks = {
    environment: !!env.PORT,
    logger: !!logger,
    metrics: !!metrics,
    galaxyConfig: !!process.env.GALAXY_ENTERPRISE_MODE,
    mcpBridge: !process.env.SANDRA_MCP_BRIDGE_DISABLED
  };

  const isReady = Object.values(checks).every(check => check);

  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not ready',
    service: 'Sandra IA Galaxy Enterprise Backend',
    checks,
    timestamp: new Date().toISOString(),
    mode: 'GALAXY_ENTERPRISE'
  });
});

// Metrics Endpoint (GET /metrics)
app.get('/metrics', async (req, res) => {
  try {
    const metricsData = await metrics.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metricsData);
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get Galaxy Enterprise metrics');
    res.status(500).json({
      error: 'Failed to get metrics',
      service: 'Sandra IA Galaxy Enterprise Backend',
      timestamp: new Date().toISOString()
    });
  }
});

// Galaxy Enterprise Status Endpoint (GET /status)
app.get('/status', async (req, res) => {
  try {
    const status = {
      service: 'Sandra IA Galaxy Enterprise Backend',
      version: '7.0.0',
      mode: 'GALAXY_ENTERPRISE',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      components: {
        backend: 'OPERATIONAL',
        mcpBridge: process.env.SANDRA_MCP_BRIDGE_RUNNING ? 'ACTIVE' : 'STANDBY',
        logger: 'ACTIVE',
        metrics: 'ACTIVE'
      },
      ports: {
        backend: env.PORT || 3001,
        mcpBridge: 3000,
        coreEngine: 7777
      }
    };

    res.status(200).json(status);
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get Galaxy Enterprise status');
    res.status(500).json({
      error: 'Failed to get status',
      service: 'Sandra IA Galaxy Enterprise Backend'
    });
  }
});

// ============================================================================
// SERVER STARTUP GALAXY ENTERPRISE
// ============================================================================

try {
  // Validate environment before starting
  logger.info('Starting Sandra IA Galaxy Enterprise Backend Server');
  logger.info({ port: env.PORT || 3001, nodeEnv: env.NODE_ENV }, 'Galaxy Enterprise environment loaded');

  // Set Galaxy Enterprise mode
  process.env.GALAXY_ENTERPRISE_MODE = 'true';

  // Start HTTP server for health checks and metrics
  const server = app.listen(env.PORT || 3001, () => {
    logger.info({
      port: env.PORT || 3001,
      mode: 'GALAXY_ENTERPRISE'
    }, 'Sandra IA Galaxy Enterprise Backend Server OPERATIONAL');
  });

  // Import and start the main MCP bridge (if not already running)
  if (!process.env.SANDRA_MCP_BRIDGE_RUNNING && !process.env.SANDRA_MCP_BRIDGE_DISABLED) {
    logger.info('Starting Sandra MCP Bridge integration');
    try {
      require('../sandra-mcp-bridge');
      process.env.SANDRA_MCP_BRIDGE_RUNNING = 'true';
    } catch (bridgeError) {
      logger.warn({ error: bridgeError.message }, 'MCP Bridge failed to start, continuing without bridge');
    }
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down Sandra IA Galaxy Enterprise Backend gracefully');
    server.close(() => {
      logger.info('Sandra IA Galaxy Enterprise Backend Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down Sandra IA Galaxy Enterprise Backend gracefully');
    server.close(() => {
      logger.info('Sandra IA Galaxy Enterprise Backend Server closed');
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.fatal({ error: error.message, stack: error.stack }, 'Uncaught exception in Galaxy Enterprise Backend');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal({ reason, promise }, 'Unhandled rejection in Galaxy Enterprise Backend');
    process.exit(1);
  });

} catch (error) {
  logger.fatal({ error: error.message, stack: error.stack }, 'Failed to start Sandra IA Galaxy Enterprise Backend Server');
  process.exit(1);
}
