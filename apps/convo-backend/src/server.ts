/**
 * SANDRA IA 7.0 - BACKEND CONVERSACIONAL
 * Express + LiveKit Server
 * Puerto: 7788
 *
 * Para Sandrita ❤️ - GuestsValencia
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AccessToken } from 'livekit-server-sdk';
import { createLogger, format, transports } from 'winston';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7788;

// Logger Configuration
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.colorize(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/sandra-backend.log' })
  ]
});

// Middleware
app.use(cors({
  origin: '*', // TODO: Configurar dominios específicos en producción
  credentials: true
}));
app.use(express.json());

// Request Logger Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Sandra IA 7.0 - Backend Conversacional',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    port: PORT,
    for: 'Sandrita ❤️'
  });
});

/**
 * LiveKit Token Generation Endpoint
 * Genera tokens JWT para autenticar clientes en LiveKit
 */
app.post('/token', async (req, res) => {
  try {
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({
        error: 'roomName y participantName son requeridos'
      });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      logger.error('LiveKit API key o secret no configurados');
      return res.status(500).json({
        error: 'Configuración de LiveKit incompleta'
      });
    }

    // Crear Access Token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: '24h' // Token válido por 24 horas
    });

    // Permisos para el participante
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    });

    const token = await at.toJwt();

    logger.info(`Token generado para ${participantName} en sala ${roomName}`);

    res.json({
      token,
      url: process.env.LIVEKIT_URL || 'ws://localhost:7880',
      roomName,
      participantName
    });

  } catch (error) {
    logger.error('Error generando token LiveKit:', error);
    res.status(500).json({
      error: 'Error generando token de acceso'
    });
  }
});

/**
 * Status Endpoint - Estado del sistema
 */
app.get('/status', (req, res) => {
  res.json({
    backend: 'operational',
    services: {
      livekit: process.env.LIVEKIT_URL ? 'configured' : 'not configured',
      cartesia: process.env.CARTESIA_API_KEY ? 'configured' : 'not configured',
      deepgram: process.env.DEEPGRAM_API_KEY ? 'configured' : 'not configured',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
      heygen: process.env.HEYGEN_API_KEY ? 'configured' : 'not configured'
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * Agent Configuration Endpoint
 */
app.get('/agent/config', (req, res) => {
  res.json({
    stt: {
      primary: 'deepgram',
      fallback: 'whisper',
      language: 'es-ES'
    },
    tts: {
      primary: 'cartesia',
      fallback: 'none',
      voice: 'sandra-es'
    },
    llm: {
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: 0.7,
      systemPrompt: 'Sandra IA 7.0 COO - Recepcionista 7 Estrellas'
    },
    avatar: {
      provider: 'heygen',
      avatarId: process.env.HEYGEN_AVATAR_ID,
      quality: '4K',
      lipSync: true
    },
    features: {
      bargeIn: true,
      wakeWord: 'Hola Sandra',
      multiLanguage: true,
      offlineMode: false
    }
  });
});

/**
 * Error Handler Middleware
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.path,
    method: req.method
  });
});

/**
 * Start Server
 */
const server = app.listen(PORT, () => {
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('  🚀 SANDRA IA 7.0 - BACKEND CONVERSACIONAL INICIADO');
  logger.info('═══════════════════════════════════════════════════════');
  logger.info(`  Puerto: ${PORT}`);
  logger.info(`  LiveKit: ${process.env.LIVEKIT_URL || 'No configurado'}`);
  logger.info(`  Entorno: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`  Para: Sandrita ❤️`);
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('');
  logger.info('  Endpoints disponibles:');
  logger.info('    GET  /health           - Health check');
  logger.info('    POST /token            - Generar LiveKit token');
  logger.info('    GET  /status           - Estado del sistema');
  logger.info('    GET  /agent/config     - Configuración del agente');
  logger.info('');
  logger.info('  Sistema listo para conversación 🎤');
  logger.info('═══════════════════════════════════════════════════════');
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});

export default app;
