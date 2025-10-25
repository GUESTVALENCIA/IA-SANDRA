/**
 * SANDRA GALAXY ENTERPRISE CONFIGURATION
 * Unified configuration system for all server instances
 * Agent-Organizer Implementation
 */

const path = require('path');

// Galaxy Enterprise Port Strategy
const GALAXY_PORTS = {
  // Primary Sandra Core Engine (SANDRA_NUCLEUS_UNIFIED)
  CORE_ENGINE: process.env.SANDRA_CORE_PORT || 7777,

  // MCP Bridge Server (sandra-mcp-bridge.js)
  MCP_BRIDGE: process.env.SANDRA_MCP_PORT || 3000,

  // Backend Health & Metrics Server (backend/server.js)
  BACKEND_SERVER: process.env.SANDRA_BACKEND_PORT || 3001,

  // WebSocket Server
  WEBSOCKET: process.env.SANDRA_WS_PORT || 7778,

  // Monitoring Dashboard
  MONITORING: process.env.SANDRA_MONITOR_PORT || 7779
};

// Agent Orchestrator Configuration
const AGENT_CONFIG = {
  MAX_CONCURRENT_AGENTS: 248,
  AGENT_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  COORDINATION_INTERVAL: 1000,
  HEALTH_CHECK_INTERVAL: 5000,

  // Agent Categories Priority
  PRIORITY_LEVELS: {
    CRITICAL: 0,    // Core Infrastructure (1-12)
    HIGH: 1,        // Development (13-36)
    MEDIUM_HIGH: 2, // AI/ML (37-72)
    MEDIUM: 3,      // Business Logic (73-120)
    LOW_MEDIUM: 4,  // Integration (121-162)
    LOW: 5          // UX & Specialized (163-248)
  }
};

// Enterprise Context Manager Configuration
const CONTEXT_CONFIG = {
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  SESSION_TTL: 3600, // 1 hour
  MEMORY_LIMIT: 50,  // Last 50 messages per session
  CONTEXT_SYNC_INTERVAL: 2000,

  // Multi-tenant support
  TENANT_CONFIG: {
    default: 'guestsvalencia',
    isolation: true,
    resource_limits: {
      max_sessions: 1000,
      max_memory_per_tenant: '512MB'
    }
  }
};

// Performance & Monitoring Configuration
const PERFORMANCE_CONFIG = {
  // Response time targets (milliseconds)
  TARGETS: {
    AGENT_COORDINATION: 50,
    API_RESPONSE: 200,
    DATABASE_QUERY: 100,
    CACHE_HIT_RATE: 0.95
  },

  // Auto-scaling configuration
  SCALING: {
    CPU_THRESHOLD: 70,
    MEMORY_THRESHOLD: 80,
    SCALE_UP_COOLDOWN: 300000,    // 5 minutes
    SCALE_DOWN_COOLDOWN: 600000   // 10 minutes
  },

  // Monitoring endpoints
  METRICS: {
    enabled: true,
    endpoint: '/metrics',
    format: 'prometheus'
  }
};

// Security Configuration
const SECURITY_CONFIG = {
  CORS: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://sandraia.guestsvalencia.com', 'https://guestsvalencia.com']
      : true,
    credentials: true
  },

  RATE_LIMITING: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP'
  },

  JWT: {
    secret: process.env.JWT_SECRET || 'sandra-galaxy-enterprise-secret',
    expiresIn: '24h'
  }
};

// Database Configuration
const DATABASE_CONFIG = {
  POSTGRESQL: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/sandra_galaxy',
    pool: {
      min: 2,
      max: 20,
      idle: 10000
    }
  },

  REDIS: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3
    }
  }
};

// API Configuration
const API_CONFIG = {
  OPENAI: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-turbo-preview',
    timeout: 30000
  },

  ELEVENLABS: {
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: process.env.ELEVENLABS_VOICE_ID || 'sandra-voice-id'
  },

  DEEPGRAM: {
    apiKey: process.env.DEEPGRAM_API_KEY,
    model: 'nova'
  },

  HEYGEN: {
    apiKey: process.env.HEYGEN_API_KEY,
    avatarId: process.env.HEYGEN_AVATAR_ID || 'sandra-avatar-id'
  }
};

// Server Startup Sequence Configuration
const STARTUP_SEQUENCE = {
  PHASE_1: [
    'Load Environment Variables',
    'Initialize Logger',
    'Connect to Database',
    'Initialize Redis'
  ],

  PHASE_2: [
    'Start Core Engine Server',
    'Initialize Agent Registry',
    'Load Core Infrastructure Agents'
  ],

  PHASE_3: [
    'Start MCP Bridge Server',
    'Start Backend Metrics Server',
    'Initialize WebSocket Server'
  ],

  PHASE_4: [
    'Load All 248 Agents',
    'Initialize Context Manager',
    'Start Health Monitoring'
  ],

  PHASE_5: [
    'Run System Health Check',
    'Initialize Performance Monitoring',
    'Mark System Ready'
  ]
};

// Environment-specific overrides
const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  const envConfigs = {
    development: {
      LOG_LEVEL: 'debug',
      ENABLE_DEBUG_ROUTES: true,
      AUTO_RELOAD: true
    },

    staging: {
      LOG_LEVEL: 'info',
      ENABLE_DEBUG_ROUTES: true,
      AUTO_RELOAD: false
    },

    production: {
      LOG_LEVEL: 'warn',
      ENABLE_DEBUG_ROUTES: false,
      AUTO_RELOAD: false,
      CLUSTERING: true,
      WORKERS: require('os').cpus().length
    }
  };

  return envConfigs[env] || envConfigs.development;
};

// Export unified configuration
module.exports = {
  GALAXY_PORTS,
  AGENT_CONFIG,
  CONTEXT_CONFIG,
  PERFORMANCE_CONFIG,
  SECURITY_CONFIG,
  DATABASE_CONFIG,
  API_CONFIG,
  STARTUP_SEQUENCE,
  ENVIRONMENT: getEnvironmentConfig(),

  // Convenience getters
  getPort: (service) => GALAXY_PORTS[service],
  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV !== 'production',

  // Validation
  validate: () => {
    const required = [
      'OPENAI_API_KEY',
      'DATABASE_URL'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return true;
  },

  // Port conflict detection
  detectPortConflicts: () => {
    const ports = Object.values(GALAXY_PORTS);
    const duplicates = ports.filter((port, index) => ports.indexOf(port) !== index);

    if (duplicates.length > 0) {
      throw new Error(`Port conflicts detected: ${duplicates.join(', ')}`);
    }

    return false;
  },

  // Get service URL
  getServiceUrl: (service) => {
    const port = GALAXY_PORTS[service];
    const host = process.env.HOST || 'localhost';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

    return `${protocol}://${host}:${port}`;
  }
};

console.log(`
╔════════════════════════════════════════╗
║   SANDRA GALAXY ENTERPRISE CONFIG     ║
║          Unified Configuration        ║
╚════════════════════════════════════════╝

Core Engine:     ${GALAXY_PORTS.CORE_ENGINE}
MCP Bridge:      ${GALAXY_PORTS.MCP_BRIDGE}
Backend Server:  ${GALAXY_PORTS.BACKEND_SERVER}
WebSocket:       ${GALAXY_PORTS.WEBSOCKET}
Monitoring:      ${GALAXY_PORTS.MONITORING}

Environment:     ${process.env.NODE_ENV || 'development'}
Agents Limit:    ${AGENT_CONFIG.MAX_CONCURRENT_AGENTS}
`);