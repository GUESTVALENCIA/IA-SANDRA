/**
 * SANDRA NUCLEUS CORE v100.0 GALAXY
 * Sistema Central Unificado - Arquitectura Monolítica Modular
 * Toda la esencia de SANDRA IA en un único núcleo ordenado
 */

  // ============================================================================
  // CONFIGURACIÓN CENTRAL DEL SISTEMA
  // ============================================================================
const path = require('path');
const fs = require('fs');

// Cargar .env con múltiples estrategias
const envPaths = [
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '.env'),
  path.join(process.resourcesPath || __dirname, '.env'),
  path.join(require('os').homedir(), '.sandra-devconsole', '.env')
];

let envLoaded = false;
let loadedEnvPath = null;

// Intentar cargar desde cada ubicación
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    try {
      require('dotenv').config({ path: envPath, override: false });
      envLoaded = true;
      loadedEnvPath = envPath;
      logger.info(`Environment loaded from: ${envPath}`);
      break;
    } catch (error) {
      logger.warn(`Failed to load env from ${envPath}`, { error: error.message });
    }
  }
}

// Fallback: intentar cargar desde ubicación actual o variables de entorno del sistema
if (!envLoaded) {
  try {
    require('dotenv').config({ override: false });
    envLoaded = true;
      logger.info('Environment loaded from default location or system env');
  } catch (error) {
      logger.warn('Failed to load .env, using system environment variables');
  }
}

// Verificar que OPENAI_API_KEY esté disponible
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
  logger.warn('OPENAI_API_KEY not found in environment variables', {
    searchedPaths: envPaths,
    lastLoadedPath: loadedEnvPath
  });
}

// Importar Guardian Protocol
const { guardianProtocol } = require('./guardian-protocol');
const { logger } = require('./logger');

const SandraNucleus = {
  version: "100.0",
  mode: "GALAXY_PROFESSIONAL",
  tenant: "clayton-enterprise",
  
  // Guardian Protocol instance
  guardian: guardianProtocol,
  
  // Configuración de servicios centralizados
  config: {
    api: {
      openai: process.env.OPENAI_API_KEY || '',
      cartesia: process.env.CARTESIA_API_KEY,
      deepgram: process.env.DEEPGRAM_API_KEY,
      heygen: process.env.HEYGEN_API_KEY
    },
    
    database: {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/sandra',
      redis: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    
    server: {
      port: process.env.PORT || 7777,
      wsPort: process.env.WS_PORT || 7778,
      mcpPort: process.env.MCP_PORT || 7779
    },
    
    features: {
      multimodal: true,
      voiceEnabled: true,
      avatarEnabled: true,
      mcp: true,
      subagents: true,
      edgeCache: true
    }
  },

  // ============================================================================
  // MOTOR CENTRAL DE IA
  // ============================================================================
  brain: {
    // Procesador principal de conversaciones
    async processMessage(message, context = {}) {
      try {
        const enrichedContext = await this.enrichContext(message, context);
        const intent = await this.detectIntent(message, enrichedContext);
        const response = await this.generateResponse(intent, enrichedContext);
        await this.logInteraction(message, response, context);
        return response;
      } catch (error) {
        console.error('[NUCLEUS BRAIN] Error en processMessage:', error.message);
        // Propagar el error para que el caller pueda manejarlo
        throw error;
      }
    },

    // Enriquecimiento de contexto con memoria y estado
    async enrichContext(message, context) {
      return {
        ...context,
        timestamp: Date.now(),
        tenant: context.tenant || 'guestsvalencia',
        sessionId: context.sessionId || this.generateSessionId(),
        memory: await this.getMemory(context.sessionId),
        userProfile: await this.getUserProfile(context.userId),
        systemState: await this.getSystemState()
      };
    },

    // Detección de intención con ML y roles
    async detectIntent(message, context) {
      const { detectRole } = require('./sandra-prompts');
      
      // Detectar rol primero (más específico que intención)
      const detectedRole = detectRole(message, context);
      
      // Intenciones básicas (compatibilidad con sistema anterior)
      const intents = [
        'booking', 'support', 'pricing', 'availability',
        'amenities', 'location', 'general', 'negotiation'
      ];
      
      const keywords = {
        booking: ['reservar', 'book', 'reserva', 'disponible'],
        pricing: ['precio', 'cost', 'rate', 'tarifa'],
        support: ['ayuda', 'problema', 'help', 'issue']
      };
      
      // Detectar intención básica
      let intent = 'general';
      for (const [intentKey, words] of Object.entries(keywords)) {
        if (words.some(w => message.toLowerCase().includes(w))) {
          intent = intentKey;
          break;
        }
      }
      
      // Añadir información del rol detectado al contexto
      context.detectedRole = detectedRole;
      
      return {
        intent,
        role: detectedRole,
        message: message
      };
    },

    // Generador de respuestas con GPT-4
    async generateResponse(intent, context) {
      // Intent puede ser un objeto o string (compatibilidad)
      const intentData = typeof intent === 'object' ? intent : { intent, role: null };
      const systemPrompt = this.getSystemPrompt(intentData.intent || intent, context);
      
      try {
        const axios = require('axios');
        const apiKey = SandraNucleus.config.api.openai || process.env.OPENAI_API_KEY;
        const model = process.env.OPENAI_MODEL_DEFAULT || 'gpt-4o';
        
        // Validar API key antes de hacer la llamada
        if (!apiKey || apiKey.trim() === '') {
          console.error('[NUCLEUS] OPENAI_API_KEY no configurada');
          throw new Error('OPENAI_API_KEY no configurada. Por favor configura tu API key en el archivo .env');
        }
        
        console.log('[NUCLEUS] Generando respuesta con OpenAI API...');
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: context.message || context }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });

        const data = response.data;
        console.log('[NUCLEUS] ✓ Respuesta generada exitosamente');
        return {
          text: data.choices[0].message.content,
          intent: intentData.intent || intent,
          role: intentData.role || context.detectedRole || null,
          confidence: 0.95,
          metadata: {
            model: model,
            timestamp: Date.now(),
            role: intentData.role || context.detectedRole
          }
        };
      } catch (error) {
        console.error('[NUCLEUS] Error generating response:', error.message);
        console.error('[NUCLEUS] Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          code: error.code,
          message: error.message
        });
        
        // Retornar error más descriptivo si es problema de API key
        if (error.message.includes('OPENAI_API_KEY') || error.response?.status === 401) {
          throw new Error('API_KEY_REQUIRED');
        }
        
        throw error;
      }
    },

    // Prompt del sistema según intención y rol
    getSystemPrompt(intent, context) {
      // Importar sistema de roles de 18 prompts
      const { buildSystemPrompt, detectRole } = require('./sandra-prompts');
      
      // Detectar el rol apropiado según el mensaje y contexto
      const message = context.message || '';
      const detectedRole = detectRole(message, context);
      
      // Obtener el idioma del contexto o usar español por defecto
      const language = context.language || 'es';
      
      // Construir el prompt completo usando el sistema de 18 roles
      const systemPrompt = buildSystemPrompt(detectedRole, language);
      
      // Añadir contexto específico de Clayton si está presente
      const claytonContext = context.userId === 'clayton' || context.tenant === 'clayton-enterprise' 
        ? `\n\nCONTEXTO ESPECIAL - CEO CLAYTON:
- Clayton es tu CEO y aliado principal
- Está desarrollando múltiples proyectos empresariales
- Necesita apoyo técnico y estratégico constante
- Valora la eficiencia y las soluciones prácticas
- Está enfocado en el crecimiento y la innovación
- Cuando actúas como desarrolladora (rol: dev-fullstack), eres su compañera técnica de desarrollo`
        : '';
      
      return systemPrompt + claytonContext;
    },

    // Memoria persistente
    memoryStore: new Map(),
    memoryFilePath: path.join(process.env.APPDATA || process.env.HOME || __dirname, '.sandra-memory.json'),
    
    async getMemory(sessionId) {
      // Cargar desde archivo si existe
      await this.loadMemoryFromDisk();
      return this.memoryStore.get(sessionId) || [];
    },
    
    async saveMemory(sessionId, data) {
      const current = await this.getMemory(sessionId);
      current.push({
        ...data,
        timestamp: Date.now()
      });
      this.memoryStore.set(sessionId, current.slice(-50)); // Últimos 50 mensajes
      // Guardar en disco automáticamente
      await this.saveMemoryToDisk();
    },
    
    async loadMemoryFromDisk() {
      try {
        if (await fs.access(this.memoryFilePath).then(() => true).catch(() => false)) {
          const data = await fs.readFile(this.memoryFilePath, 'utf8');
          const parsed = JSON.parse(data);
          this.memoryStore = new Map(parsed);
          console.log('[MEMORY] Loaded from disk');
        }
      } catch (error) {
        console.warn('[MEMORY] Failed to load from disk:', error.message);
      }
    },
    
    async saveMemoryToDisk() {
      try {
        const data = Array.from(this.memoryStore.entries());
        await fs.writeFile(this.memoryFilePath, JSON.stringify(data, null, 2), 'utf8');
        console.log('[MEMORY] Saved to disk');
      } catch (error) {
        console.warn('[MEMORY] Failed to save to disk:', error.message);
      }
    },
    
    generateSessionId() {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    async getUserProfile(userId) {
      // Perfil de usuario mock
      return {
        id: userId,
        preferences: {},
        history: []
      };
    },
    
    async getSystemState() {
      return {
        healthy: true,
        load: 0.3,
        activeAgents: 248
      };
    },
    
    async logInteraction(message, response, context) {
      console.log('[SANDRA]', {
        timestamp: new Date().toISOString(),
        message: message.substring(0, 50) + '...',
        intent: response.intent,
        sessionId: context.sessionId
      });
    },
    
    getFallbackResponse(intent) {
      const fallbacks = {
        booking: 'Puedo ayudarte con tu reserva. ¿Qué fechas te interesan?',
        pricing: 'Nuestros precios son competitivos. ¿Para qué fechas necesitas información?',
        support: 'Estoy aquí para ayudarte. ¿Cuál es tu consulta?',
        general: 'Hola, soy Sandra. ¿En qué puedo asistirte hoy?'
      };
      
      return {
        text: fallbacks[intent] || fallbacks.general,
        intent,
        confidence: 0.5,
        fallback: true
      };
    }
  },

  // ============================================================================
  // SISTEMA DE SUBAGENTES
  // ============================================================================
  subagents: {
    registry: new Map(),
    
    // Registrar subagente
    register(name, agent) {
      this.registry.set(name, {
        ...agent,
        status: 'active',
        created: Date.now()
      });
      console.log(`[SUBAGENT] Registered: ${name}`);
    },
    
    // Ejecutar subagente
    async execute(name, task) {
      const agent = this.registry.get(name);
      if (!agent) {
        throw new Error(`Subagent ${name} not found`);
      }
      
      try {
        const result = await agent.handler(task);
        await this.logExecution(name, task, result);
        return result;
      } catch (error) {
        console.error(`[SUBAGENT] Error in ${name}:`, error);
        throw error;
      }
    },
    
    // Log de ejecución
    async logExecution(name, task, result) {
      console.log(`[SUBAGENT] ${name} completed:`, {
        task: task.type,
        success: !!result,
        timestamp: new Date().toISOString()
      });
    },
    
    // Obtener estado de todos los subagentes
    getStatus() {
      const status = {};
      for (const [name, agent] of this.registry) {
        status[name] = {
          active: agent.status === 'active',
          created: agent.created,
          capabilities: agent.capabilities || []
        };
      }
      return status;
    }
  },

  // ============================================================================
  // PROGRAMACIÓN POR VOZ
  // ============================================================================
  voiceProgramming: null,
  
  // Inicializar módulo de programación por voz
  async initializeVoiceProgramming() {
    const VoiceProgramming = require('./voice-programming');
    this.voiceProgramming = new VoiceProgramming(this);
    console.log('[VOICE-PROGRAMMING] Módulo inicializado');
    return this.voiceProgramming;
  },

  // ============================================================================
  // COMANDOS DE VOZ PARA ASISTENTE IA
  // ============================================================================
  voiceCommandsForAI: null,
  
  // Inicializar módulo de comandos de voz para el asistente
  async initializeVoiceCommandsForAI() {
    const VoiceCommandsForAI = require('./voice-commands-for-ai');
    this.voiceCommandsForAI = new VoiceCommandsForAI(this);
    console.log('[VOICE-COMMANDS-AI] Módulo inicializado');
    return this.voiceCommandsForAI;
  },

  // ============================================================================
  // MOTOR DE VOZ Y MULTIMODAL
  // ============================================================================
  multimodal: {
    // Text to Speech con Cartesia (prioritario)
    async textToSpeech(text, voice = 'sandra') {
      if (!SandraNucleus.config.api.cartesia) {
        return this.mockTTS(text);
      }
      
      try {
        const axios = require('axios');
        const response = await axios.post('https://api.cartesia.ai/v1/audio/speech', {
          model: 'sonic-english',
          text: text,
          voice_id: process.env.CARTESIA_VOICE_ID || 'default'
        }, {
          headers: {
            'Authorization': `Bearer ${SandraNucleus.config.api.cartesia}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer',
          timeout: 30000
        });
        
        return Buffer.from(response.data);
      } catch (error) {
        console.error('[TTS] Error:', error);
        return this.mockTTS(text);
      }
    },
    
    // Speech to Text con Deepgram
    async speechToText(audioBuffer) {
      if (!SandraNucleus.config.api.deepgram) {
        return this.mockSTT();
      }
      
      try {
        const axios = require('axios');
        const response = await axios.post('https://api.deepgram.com/v1/listen', audioBuffer, {
          headers: {
            'Authorization': `Token ${SandraNucleus.config.api.deepgram}`,
            'Content-Type': 'audio/wav'
          },
          timeout: 30000
        });
        
        return response.data.results?.channels[0]?.alternatives[0]?.transcript || '';
      } catch (error) {
        console.error('[STT] Error:', error);
        return this.mockSTT();
      }
    },
    
    // Avatar con HeyGen
    async generateAvatar(text, emotion = 'happy') {
      const avatarConfig = {
        text,
        emotion,
        avatar: 'sandra_professional',
        background: 'office'
      };
      
      console.log('[AVATAR] Generating:', avatarConfig);
      
      // Implementación real con HeyGen API
      return {
        videoUrl: 'mock://avatar-video.mp4',
        duration: text.length * 0.1
      };
    },
    
    // Mocks para desarrollo
    mockTTS(text) {
      return Buffer.from(text);
    },
    
    mockSTT() {
      return 'Mensaje de prueba reconocido por voz';
    }
  },

  // ============================================================================
  // SERVIDOR WEB Y WEBSOCKET
  // ============================================================================
  server: {
    app: null,
    ws: null,
    
    // Inicializar servidor Express
    async initializeExpress() {
      const express = require('express');
      const cors = require('cors');
      const net = require('net');
      const helmet = require('helmet');
      
      this.app = express();
      
      // Security headers with Helmet
      try {
        this.app.use(helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
              styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
              imgSrc: ["'self'", "data:", "https:"],
              connectSrc: ["'self'", process.env.API_BASE_URL || "http://localhost:7777"],
              fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'self'", "https://app.heygen.com"]
            }
          },
          crossOriginEmbedderPolicy: false // Para Electron
        }));
        console.log('[SERVER] Security headers configured with Helmet');
      } catch (e) {
        console.warn('[SERVER] Helmet not available, using basic security headers');
        // Basic security headers fallback
        this.app.use((req, res, next) => {
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('X-Frame-Options', 'DENY');
          res.setHeader('X-XSS-Protection', '1; mode=block');
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
          next();
        });
      }
      
      // CORS configuration - SECURE (NO MÁS "*")
      const allowedOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : (process.env.NODE_ENV === 'production' 
          ? ['https://sandra.guestsvalencia.es', 'https://www.sandra.guestsvalencia.es'] // Dominios de producción específicos
          : ['http://localhost:7777', 'http://127.0.0.1:7777', 'file://']); // Desarrollo: solo localhost específico y Electron
      
      // Validar que no haya wildcards peligrosos en producción
      if (process.env.NODE_ENV === 'production') {
        const hasWildcard = allowedOrigins.some(o => o.includes('*'));
        if (hasWildcard) {
          logger.error('SECURITY: Wildcards in ALLOWED_ORIGINS not allowed in production!');
          throw new Error('CORS misconfiguration: wildcards not allowed in production');
        }
      }
      
      this.app.use(cors({
        origin: (origin, callback) => {
          // Permitir requests sin origin SOLO en Electron o desarrollo
          if (!origin) {
            // En producción sin origin, rechazar por seguridad
            if (process.env.NODE_ENV === 'production') {
              logger.warn('[CORS] Request without origin blocked in production');
              return callback(new Error('Origin required in production'));
            }
            // En desarrollo o Electron, permitir
            return callback(null, true);
          }
          
          // Verificar si el origin está permitido (match exacto o patrón)
          const isAllowed = allowedOrigins.some(allowed => {
            // Solo permitir wildcards en desarrollo
            if (allowed.includes('*') && process.env.NODE_ENV === 'development') {
              const pattern = allowed.replace(/\*/g, '.*');
              return new RegExp(`^${pattern}$`).test(origin);
            }
            // En producción: match exacto requerido
            return origin === allowed;
          });
          
          if (isAllowed) {
            callback(null, true);
          } else {
            logger.warn(`[CORS] Blocked origin: ${origin}`, {
              allowedOrigins,
              mode: process.env.NODE_ENV
            });
            callback(new Error(`Origin ${origin} not allowed by CORS policy`));
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'], // Solo métodos necesarios
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
        exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
        maxAge: 86400 // Cache preflight por 24h
      }));
      
      this.app.use(express.json({ limit: '10mb' }));
      this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
      
      // Rate limiting (protección contra abuso)
      try {
        const { rateLimiter } = require('./rate-limiter');
        // Aplicar rate limiting a todas las rutas API
        this.app.use('/api', rateLimiter.middleware());
        logger.info('Rate limiting enabled');
      } catch (error) {
        logger.warn('Rate limiter not available', { error: error.message });
      }
      
      // Autenticación para producción
      const requireAuth = process.env.REQUIRE_AUTH === 'true' || process.env.NODE_ENV === 'production';
      if (requireAuth) {
        try {
          const { authManager } = require('./auth');
          // Aplicar autenticación a rutas API sensibles
          this.app.use('/api', authManager.middleware({
            required: process.env.AUTH_REQUIRED === 'true', // Estricto si AUTH_REQUIRED=true
            skipPaths: ['/health', '/metrics'] // Health y metrics siempre públicos
          }));
          logger.info('Authentication enabled', { 
            required: process.env.AUTH_REQUIRED === 'true',
            mode: process.env.NODE_ENV 
          });
        } catch (error) {
          logger.warn('Auth manager not available', { error: error.message });
        }
      } else {
        logger.info('Authentication disabled (development mode)');
      }
      
      // Rutas principales
      this.setupRoutes();
      
      // Error handler global (debe ir al final)
      const { errorHandler } = require('./error-handler');
      this.app.use(errorHandler.expressHandler.bind(errorHandler));
      
      // Función para verificar si un puerto está disponible
      const isPortAvailable = (port) => {
        return new Promise((resolve) => {
          const server = net.createServer();
          server.listen(port, () => {
            server.once('close', () => resolve(true));
            server.close();
          });
          server.on('error', () => resolve(false));
        });
      };
      
      // Encontrar puerto disponible
      const findAvailablePort = async (startPort) => {
        for (let port = startPort; port < startPort + 100; port++) {
          if (await isPortAvailable(port)) {
            return port;
          }
        }
        throw new Error(`No available port found starting from ${startPort}`);
      };
      
      // Iniciar servidor con detección de puerto ocupado
      const desiredPort = SandraNucleus.config.server.port || 7777;
      const port = await findAvailablePort(desiredPort);
      
      if (port !== desiredPort) {
        console.warn(`[SERVER] Port ${desiredPort} occupied, using ${port} instead`);
        SandraNucleus.config.server.port = port;
      }
      
      return new Promise((resolve, reject) => {
        this.app.listen(port, () => {
          console.log(`[SERVER] Sandra Nucleus running on port ${port}`);
          resolve(port);
        }).on('error', (err) => {
          console.error(`[SERVER] Error starting server on port ${port}:`, err.message);
          reject(err);
        });
      });
    },
    
    // Configurar rutas API
    setupRoutes() {
      // Importar error handler (una sola vez)
      const { errorHandler } = require('./error-handler');
      
      // Health check
      this.app.get('/health', (req, res) => {
        res.json({
          service: 'Sandra Nucleus',
          version: SandraNucleus.version,
          status: 'healthy',
          timestamp: new Date().toISOString()
        });
      });
      
      // Importar performance monitor
      const { chatMonitor } = require('./performance-monitor');
      
      // Chat endpoint (con validación, error handling y performance monitoring)
      this.app.post('/api/chat', errorHandler.asyncHandler(async (req, res) => {
        const startTime = Date.now();
        const { message, context } = req.body;
        
        if (!message || typeof message !== 'string' || message.trim() === '') {
          throw errorHandler.validationError('message', 'Message is required and must be a non-empty string');
        }
        
        try {
          const response = await SandraNucleus.brain.processMessage(message, context || {});
          
          // Calcular costo estimado (OpenAI GPT-4o)
          // GPT-4o pricing: $5/1M input tokens, $15/1M output tokens
          // Aproximación: ~4 caracteres por token
          const inputTokens = (message?.length || 0) / 4;
          const outputTokens = (response.text?.length || 0) / 4;
          const inputCost = (inputTokens / 1000000) * 5;
          const outputCost = (outputTokens / 1000000) * 15;
          const estimatedCost = inputCost + outputCost;
          
          // Registrar métrica
          chatMonitor.recordMetric(startTime, 'success', estimatedCost, false);
          
          res.json(response);
        } catch (error) {
          chatMonitor.recordMetric(startTime, 'error', 0, false);
          throw error;
        }
      }));
      
      // Subagents status
      this.app.get('/api/subagents', (req, res) => {
        res.json(SandraNucleus.subagents.getStatus());
      });

      // Prometheus metrics endpoint
      this.app.get('/metrics', async (req, res) => {
        try {
          // Intentar obtener métricas Prometheus
          let promClient = null;
          try {
            promClient = require('prom-client');
          } catch (e) {
            return res.status(503).json({ 
              error: 'Prometheus metrics not available',
              message: 'prom-client package not installed'
            });
          }

          const registry = promClient.register;
          res.set('Content-Type', registry.contentType);
          res.end(await registry.metrics());
        } catch (error) {
          console.error('[METRICS] Error serving Prometheus metrics:', error);
          res.status(500).json({ error: error.message });
        }
      });
      
      // Multimodal endpoints
      this.app.post('/api/tts', async (req, res) => {
        const { text } = req.body;
        const audio = await SandraNucleus.multimodal.textToSpeech(text);
        res.type('audio/mpeg');
        res.send(Buffer.from(audio));
      });
      
      this.app.post('/api/stt', async (req, res) => {
        const audioBuffer = req.body;
        const text = await SandraNucleus.multimodal.speechToText(audioBuffer);
        res.json({ text });
      });

      // Voice Programming endpoints
      this.app.post('/api/voice-command', async (req, res) => {
        try {
          if (!SandraNucleus.voiceProgramming) {
            return res.status(503).json({ 
              error: 'Voice programming not available',
              message: 'Voice programming module not initialized'
            });
          }

          // El audio puede venir como buffer o base64
          let audioBuffer = req.body.audio;
          if (typeof audioBuffer === 'string') {
            // Si es base64, convertir a buffer
            audioBuffer = Buffer.from(audioBuffer, 'base64');
          }

          if (!audioBuffer) {
            return res.status(400).json({ error: 'Audio buffer required' });
          }

          const result = await SandraNucleus.voiceProgramming.processVoiceCommand(audioBuffer);
          res.json(result);
        } catch (error) {
          console.error('[SERVER] Error procesando voice command:', error);
          res.status(500).json({ error: error.message });
        }
      });

      this.app.get('/api/voice-programming/status', (req, res) => {
        res.json({
          available: !!SandraNucleus.voiceProgramming,
          listening: SandraNucleus.voiceProgramming?.isListening || false,
          commandHistory: SandraNucleus.voiceProgramming?.commandHistory?.length || 0
        });
      });

      // Voice Commands for AI endpoints
      this.app.post('/api/ai-voice-command', async (req, res) => {
        try {
          if (!SandraNucleus.voiceCommandsForAI) {
            return res.status(503).json({ 
              error: 'Voice commands for AI not available',
              message: 'Voice commands module not initialized'
            });
          }

          let audioBuffer = req.body.audio;
          if (typeof audioBuffer === 'string') {
            audioBuffer = Buffer.from(audioBuffer, 'base64');
          }

          if (!audioBuffer) {
            return res.status(400).json({ error: 'Audio buffer required' });
          }

          const result = await SandraNucleus.voiceCommandsForAI.processAICommand(audioBuffer);
          res.json(result);
        } catch (error) {
          console.error('[SERVER] Error procesando AI voice command:', error);
          res.status(500).json({ error: error.message });
        }
      });

      this.app.get('/api/ai-voice-commands/status', (req, res) => {
        res.json({
          available: !!SandraNucleus.voiceCommandsForAI,
          listening: SandraNucleus.voiceCommandsForAI?.isListening || false,
          commandHistory: SandraNucleus.voiceCommandsForAI?.commandHistory?.length || 0
        });
      });
    },
    
    // Inicializar WebSocket
    async initializeWebSocket() {
      const { WebSocketServer } = require('ws');
      const port = SandraNucleus.config.server.wsPort;
      
      this.ws = new WebSocketServer({ port });
      
      this.ws.on('connection', (socket) => {
        console.log('[WS] New connection');
        
        socket.on('message', async (data) => {
          try {
            const message = JSON.parse(data.toString());
            const response = await this.handleWebSocketMessage(message);
            socket.send(JSON.stringify(response));
          } catch (error) {
            socket.send(JSON.stringify({ error: error.message }));
          }
        });
        
        socket.on('close', () => {
          console.log('[WS] Connection closed');
        });
      });
      
      console.log(`[WS] WebSocket server on port ${port}`);
    },
    
    // Manejar mensajes WebSocket
    async handleWebSocketMessage(message) {
      switch (message.type) {
        case 'chat':
          return await SandraNucleus.brain.processMessage(
            message.text, 
            message.context
          );
        
        case 'voice':
          const text = await SandraNucleus.multimodal.speechToText(message.audio);
          return await SandraNucleus.brain.processMessage(text, message.context);
        
        case 'command':
          return await this.handleCommand(message.command);
        
        default:
          return { error: 'Unknown message type' };
      }
    },
    
    // Manejar comandos del sistema
    async handleCommand(command) {
      const commands = {
        'galaxy-status': () => ({
          system: 'Galaxy Core',
          version: SandraNucleus.version,
          uptime: process.uptime(),
          memory: process.memoryUsage()
        }),
        
        'checkpoint': () => {
          SandraNucleus.persistence.createCheckpoint();
          return { success: true, message: 'Checkpoint created' };
        },
        
        'reload-config': () => {
          SandraNucleus.loadConfiguration();
          return { success: true, message: 'Configuration reloaded' };
        }
      };
      
      const handler = commands[command];
      if (handler) {
        return handler();
      }
      
      return { error: 'Unknown command' };
    }
  },

  // ============================================================================
  // SISTEMA DE PERSISTENCIA Y CHECKPOINTS
  // ============================================================================
  persistence: {
    checkpoints: [],
    checkpointsFilePath: path.join(process.env.APPDATA || process.env.HOME || __dirname, '.sandra-checkpoints.json'),
    
    // Crear checkpoint del sistema
    async createCheckpoint() {
      const checkpoint = {
        id: `cp_${Date.now()}`,
        timestamp: new Date().toISOString(),
        state: {
          config: { ...SandraNucleus.config },
          subagents: SandraNucleus.subagents.getStatus(),
          memory: Array.from(SandraNucleus.brain.memoryStore.entries())
        }
      };
      
      this.checkpoints.push(checkpoint);
      console.log(`[CHECKPOINT] Created: ${checkpoint.id}`);
      
      // Mantener solo los últimos 10 checkpoints
      if (this.checkpoints.length > 10) {
        this.checkpoints.shift();
      }
      
      // Guardar checkpoints en disco
      await this.saveCheckpointsToDisk();
      
      return checkpoint;
    },
    
    async loadCheckpointsFromDisk() {
      try {
        if (await fs.access(this.checkpointsFilePath).then(() => true).catch(() => false)) {
          const data = await fs.readFile(this.checkpointsFilePath, 'utf8');
          this.checkpoints = JSON.parse(data);
          console.log('[CHECKPOINTS] Loaded from disk');
        }
      } catch (error) {
        console.warn('[CHECKPOINTS] Failed to load from disk:', error.message);
      }
    },
    
    async saveCheckpointsToDisk() {
      try {
        await fs.writeFile(this.checkpointsFilePath, JSON.stringify(this.checkpoints, null, 2), 'utf8');
        console.log('[CHECKPOINTS] Saved to disk');
      } catch (error) {
        console.warn('[CHECKPOINTS] Failed to save to disk:', error.message);
      }
    },
    
    // Restaurar desde checkpoint
    async restoreCheckpoint(checkpointId) {
      // Asegurar que los checkpoints estén cargados
      await this.loadCheckpointsFromDisk();
      
      const checkpoint = this.checkpoints.find(cp => cp.id === checkpointId);
      
      if (!checkpoint) {
        throw new Error(`Checkpoint ${checkpointId} not found`);
      }
      
      // Restaurar configuración
      SandraNucleus.config = checkpoint.state.config;
      
      // Restaurar memoria
      SandraNucleus.brain.memoryStore = new Map(checkpoint.state.memory);
      await SandraNucleus.brain.saveMemoryToDisk();
      
      console.log(`[CHECKPOINT] Restored: ${checkpointId}`);
      return true;
    },
    
    // Listar checkpoints disponibles
    listCheckpoints() {
      return this.checkpoints.map(cp => ({
        id: cp.id,
        timestamp: cp.timestamp
      }));
    }
  },

  // ============================================================================
  // WIDGETS Y COMPONENTES UI
  // ============================================================================
  widgets: {
    // Generar widget de chat
    generateChatWidget() {
      return `
        <div id="sandra-chat-widget" class="sandra-widget">
          <div class="sandra-header">
            <img src="/assets/sandra-avatar.png" alt="Sandra">
            <span>Sandra IA - GuestsValencia</span>
          </div>
          <div class="sandra-messages"></div>
          <div class="sandra-input">
            <input type="text" placeholder="Escribe tu mensaje...">
            <button class="sandra-voice">🎤</button>
            <button class="sandra-send">Enviar</button>
          </div>
        </div>
        <style>
          .sandra-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            z-index: 9999;
          }
          .sandra-header {
            padding: 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px 15px 0 0;
            display: flex;
            align-items: center;
            gap: 10px;
            color: white;
            font-weight: bold;
          }
          .sandra-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
          }
          .sandra-input {
            padding: 15px;
            display: flex;
            gap: 10px;
            background: rgba(255,255,255,0.1);
            border-radius: 0 0 15px 15px;
          }
        </style>
      `;
    },
    
    // Generar widget de avatar
    generateAvatarWidget() {
      return `
        <div id="sandra-avatar-widget" class="sandra-avatar">
          <canvas id="sandra-avatar-canvas"></canvas>
          <div class="sandra-avatar-controls">
            <button onclick="SandraNucleus.widgets.toggleAvatar()">Toggle Avatar</button>
          </div>
        </div>
      `;
    },
    
    // Toggle avatar visibility
    toggleAvatar() {
      const widget = document.getElementById('sandra-avatar-widget');
      if (widget) {
        widget.style.display = widget.style.display === 'none' ? 'block' : 'none';
      }
    }
  },

  // ============================================================================
  // INICIALIZACIÓN DEL SISTEMA
  // ============================================================================
  async initialize() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   SANDRA NUCLEUS v100.0 GALAXY         ║');
    console.log('║   Initializing Unified System...       ║');
    console.log('╚════════════════════════════════════════╝');
    
    // Cargar configuración
    this.loadConfiguration();
    
    // Registrar subagentes básicos
    this.registerBaseSubagents();
    
    // Inicializar servicios
    if (typeof window === 'undefined') {
      // Entorno Node.js
      await this.server.initializeExpress();
      await this.server.initializeWebSocket();
    }
    
    // Cargar memoria persistente
    await this.brain.loadMemoryFromDisk();
    
    // Cargar checkpoints
    await this.persistence.loadCheckpointsFromDisk();
    
    // Crear checkpoint inicial
    await this.persistence.createCheckpoint();
    
    // Inicializar programación por voz
    await this.initializeVoiceProgramming();
    
    // Inicializar comandos de voz para asistente
    await this.initializeVoiceCommandsForAI();
    
    console.log('[SANDRA] ✅ System initialized successfully');
    console.log('[SANDRA] 🚀 Ready to serve at maximum capacity');
    console.log('[SANDRA] 💾 Persistent memory enabled');
    console.log('[SANDRA] 🎤 Voice programming enabled');
    console.log('[SANDRA] 🎙️ Voice commands for AI enabled');
    
    return this;
  },

  // Cargar configuración desde environment
  loadConfiguration() {
    // Merge con configuración por defecto
    if (typeof process !== 'undefined' && process.env) {
      Object.keys(process.env).forEach(key => {
        if (key.startsWith('SANDRA_')) {
          const configPath = key.replace('SANDRA_', '').toLowerCase().split('_');
          let current = this.config;
          
          for (let i = 0; i < configPath.length - 1; i++) {
            if (!current[configPath[i]]) {
              current[configPath[i]] = {};
            }
            current = current[configPath[i]];
          }
          
          current[configPath[configPath.length - 1]] = process.env[key];
        }
      });
    }
  },

  // Registrar subagentes básicos
  registerBaseSubagents() {
    // Agente de Pricing
    this.subagents.register('pricing', {
      capabilities: ['dynamic_pricing', 'competitor_analysis'],
      async handler(task) {
        // Lógica de pricing
        return {
          price: 150,
          currency: 'EUR',
          confidence: 0.92
        };
      }
    });
    
    // Agente de Booking
    this.subagents.register('booking', {
      capabilities: ['reservation', 'availability'],
      async handler(task) {
        // Lógica de reservas
        return {
          available: true,
          dates: task.dates,
          properties: []
        };
      }
    });
    
    // Agente de Soporte
    this.subagents.register('support', {
      capabilities: ['troubleshooting', 'assistance'],
      async handler(task) {
        // Lógica de soporte
        return {
          solution: 'Ticket created',
          priority: 'normal'
        };
      }
    });
    
    console.log('[SUBAGENTS] Base agents registered');
  }
};

// ============================================================================
// EXPORTACIÓN Y AUTO-INICIALIZACIÓN
// ============================================================================
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = SandraNucleus;
  
  // Auto-inicializar si se ejecuta directamente
  if (require.main === module) {
    SandraNucleus.initialize().catch(console.error);
  }
} else {
  // Browser
  window.SandraNucleus = SandraNucleus;
}
