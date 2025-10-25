// backend/server.js
const env = require('../config/env');
const logger = require('./logger');

// Initialize Sandra MCP Bridge with config
require('dotenv').config();

try {
  // Validate environment before starting
  logger.info('Starting Sandra MCP Bridge with validated environment');
  logger.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, 'Environment loaded');
  
  // Import and start the main bridge
  require('../sandra-mcp-bridge');
  
} catch (error) {
  logger.fatal({ error: error.message, stack: error.stack }, 'Failed to start server');
  process.exit(1);
}
