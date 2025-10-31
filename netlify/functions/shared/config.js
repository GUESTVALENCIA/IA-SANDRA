// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - SHARED CONFIGURATION
// Centralized configuration for all Netlify Functions
// ═══════════════════════════════════════════════════════════════════

const { buildSystemPrompt, getAvailableRoles, isValidRole } = require('./sandra-prompts');

module.exports = {
  // ====== CORS Headers ======
  corsHeaders: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID, X-Sandra-Role',
    'Access-Control-Max-Age': '86400'
  },

  // ====== Security Headers ======
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'"
  },

  // ====== Rate Limiting ======
  rateLimits: {
    global: {
      windowMs: 60000, // 1 minute
      maxRequests: 100
    },
    chat: {
      windowMs: 60000,
      maxRequests: 60 // 1 request per second
    },
    voice: {
      windowMs: 60000,
      maxRequests: 30 // More expensive
    },
    vision: {
      windowMs: 60000,
      maxRequests: 20 // Very expensive
    },
    documents: {
      windowMs: 60000,
      maxRequests: 30
    }
  },

  // ====== Tier System Configuration ======
  tiers: {
    local: [
      { name: 'Qwen 2.5:7b', model: 'qwen2.5:7b', tier: 1, cost: 'FREE', percentage: 80 },
      { name: 'Mistral 7B', model: 'mistral:7b', tier: 2, cost: 'FREE', percentage: 15 },
      { name: 'Llama 3.1:8b', model: 'llama3.1:8b', tier: 3, cost: 'FREE', percentage: 4 }
    ],
    api: [
      { name: 'GROQ Mixtral', model: 'mixtral-8x7b-32768', tier: 4, cost: 'FREE (limited)', percentage: 1 }
    ]
  },

  // ====== Model Configurations ======
  models: {
    ollama: {
      baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
      timeout: 30000,
      options: {
        temperature: 0.7,
        num_predict: 150
      }
    },
    groq: {
      baseUrl: 'https://api.groq.com/openai/v1',
      model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
      timeout: 30000
    },
    claude: {
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-3-5-haiku-20241022',
      version: '2023-06-01',
      timeout: 30000
    },
    openai: {
      baseUrl: 'https://api.openai.com/v1',
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      timeout: 30000
    },
    whisper: {
      baseUrl: 'https://api.openai.com/v1',
      model: 'whisper-1',
      timeout: 60000
    }
  },

  // ====== TTS Configuration ======
  tts: {
    cartesia: {
      baseUrl: 'https://api.cartesia.ai',
      version: '2024-06-10',
      model: 'sonic-2',
      format: {
        container: 'wav',
        encoding: 'pcm_f32le',
        sample_rate: 44100
      }
    }
  },

  // ====== Vision Configuration ======
  vision: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    compressionQuality: 0.8
  },

  // ====== Documents Configuration ======
  documents: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['application/pdf', 'text/markdown', 'text/plain'],
    tempStorageDir: '/tmp/sandra-documents',
    cleanupAge: 3600000 // 1 hour
  },

  // ====== Cache Configuration ======
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 1000, // Max 1000 entries
    similarityThreshold: 0.85 // For semantic similarity
  },

  // ====== Logging Configuration ======
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    formats: {
      development: 'pretty',
      production: 'json'
    },
    includeTimestamp: true,
    includeRequestId: true
  },

  // ====== Error Messages ======
  errorMessages: {
    es: {
      rateLimit: 'Demasiadas solicitudes. Por favor, espera un momento.',
      invalidInput: 'Entrada inválida. Verifica los datos enviados.',
      serverError: 'Error del servidor. Por favor, reinténtalo.',
      timeout: 'La solicitud tardó demasiado. Reinténtalo.',
      unauthorized: 'No autorizado. Verifica tus credenciales.',
      notFound: 'Recurso no encontrado.',
      methodNotAllowed: 'Método HTTP no permitido.'
    },
    en: {
      rateLimit: 'Too many requests. Please wait a moment.',
      invalidInput: 'Invalid input. Check the data sent.',
      serverError: 'Server error. Please try again.',
      timeout: 'Request took too long. Try again.',
      unauthorized: 'Unauthorized. Check your credentials.',
      notFound: 'Resource not found.',
      methodNotAllowed: 'HTTP method not allowed.'
    }
  },

  // ====== Sandra Personality & Prompts ======
  sandraPrompt: {
    system: buildSystemPrompt('guests-valencia'), // DEFAULT: Guests Valencia
    traits: ['professional', 'empathetic', 'concise', 'helpful', 'warm', 'natural', 'intelligent', 'adaptable'],
    language: 'es-ES',
    maxTokens: 200,
    // NUEVO: Funciones para manejar roles
    getRolePrompt: (role = 'guests-valencia') => {
      return buildSystemPrompt(role);
    },
    getAvailableRoles: () => {
      return getAvailableRoles();
    },
    isValidRole: (role) => {
      return isValidRole(role);
    }
  },

  // ====== Health Check Configuration ======
  healthCheck: {
    checkOllama: true,
    checkRedis: false,
    checkAPIs: true,
    timeout: 5000
  }
};
