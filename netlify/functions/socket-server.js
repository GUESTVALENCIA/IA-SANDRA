// SANDRA IA - SOCKET.IO SERVER (Netlify Function)
// Real-time bidirectional communication with WebSocket support
// Architecture: Socket.IO with Redis adapter for horizontal scaling

const { Server } = require('socket.io');
const SocketHandlers = require('../../lib/socket-handlers');
const SessionManager = require('../../lib/session-manager');

// Global instances (persisted across function invocations)
let io = null;
let socketHandlers = null;
let sessionManager = null;

// CORS configuration
const CORS_CONFIG = {
  origin: [
    'https://sandra.guestsvalencia.es',
    'http://localhost:8080',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST'],
  credentials: true
};

// Initialize Socket.IO server
async function initializeSocketIO() {
  if (io) {
    return io; // Already initialized
  }

  console.log('🚀 Initializing Socket.IO server...');

  // Create Socket.IO server
  io = new Server({
    cors: CORS_CONFIG,
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 10000,
    path: '/socket.io/',
    serveClient: false
  });

  // Initialize session manager
  sessionManager = new SessionManager({
    redisEnabled: false, // Enable when Redis is available
    sessionTTL: 3600
  });

  await sessionManager.initialize();
  sessionManager.startCleanupInterval();

  // Initialize socket handlers
  socketHandlers = new SocketHandlers(io, {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    cartesiaApiKey: process.env.CARTESIA_API_KEY,
    cartesiaVoiceId: process.env.CARTESIA_VOICE_ID
  });

  // Socket.IO namespace for Sandra conversations
  const sandraNamespace = io.of('/sandra');

  // Connection handler
  sandraNamespace.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    // Register event handlers
    socketHandlers.registerHandlers(socket);

    // Track connection metrics
    emitMetrics();
  });

  // Global error handler
  io.on('error', (error) => {
    console.error('❌ Socket.IO error:', error);
  });

  console.log('✅ Socket.IO server initialized');

  return io;
}

// Emit server metrics
function emitMetrics() {
  if (!io || !sessionManager) return;

  const metrics = {
    timestamp: Date.now(),
    connections: io.engine.clientsCount,
    sessions: sessionManager.getSessionCount(),
    activeCalls: sessionManager.getActiveCalls(),
    uptime: process.uptime()
  };

  io.of('/sandra').emit('metrics', metrics);
}

// Start metrics interval
setInterval(() => {
  emitMetrics();
}, 30000); // Every 30 seconds

// Netlify Function Handler
exports.handler = async (event, context) => {
  try {
    // Initialize Socket.IO if not already done
    await initializeSocketIO();

    // Handle HTTP upgrade for WebSocket
    if (event.headers.upgrade === 'websocket') {
      return {
        statusCode: 101,
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade'
        }
      };
    }

    // Handle regular HTTP requests
    const path = event.path.replace('/.netlify/functions/socket-server', '');

    // Health check endpoint
    if (path === '/health' || path === '/') {
      const stats = sessionManager ? sessionManager.getStatistics() : {};

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          status: 'ok',
          service: 'Sandra IA Socket.IO Server',
          version: '1.0.0',
          timestamp: Date.now(),
          socketIO: {
            initialized: !!io,
            connections: io ? io.engine.clientsCount : 0
          },
          sessions: stats
        })
      };
    }

    // Metrics endpoint
    if (path === '/metrics') {
      const stats = sessionManager ? sessionManager.getStatistics() : {};

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          timestamp: Date.now(),
          connections: io ? io.engine.clientsCount : 0,
          sessions: stats
        })
      };
    }

    // 404 for unknown paths
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Not found',
        path: path,
        availableEndpoints: ['/health', '/metrics']
      })
    };

  } catch (error) {
    console.error('❌ Socket server error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message || 'Internal server error',
        service: 'Sandra IA Socket.IO Server'
      })
    };
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔌 Graceful shutdown initiated...');

  if (sessionManager) {
    await sessionManager.shutdown();
  }

  if (io) {
    io.close(() => {
      console.log('✅ Socket.IO server closed');
    });
  }

  process.exit(0);
});
