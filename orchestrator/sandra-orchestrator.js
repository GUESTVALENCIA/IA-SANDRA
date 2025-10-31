const { SandraAICore } = require('../mcp-servers/sandra-ai-core/server');
const { SandraVoice } = require('../mcp-servers/sandra-voice/server');
const { SandraAvatar } = require('../mcp-servers/sandra-avatar/server');
const { SandraPayments } = require('../mcp-servers/sandra-payments/server');
const { CircuitBreaker } = require('./circuit-breaker');
const { MetricsCollector } = require('./metrics');
const fs = require('fs').promises;
const path = require('path');
const SandraNucleus = require('./sandra-nucleus-core');

class SandraOrchestrator {
  constructor() {
    this.services = {};
    this.circuitBreakers = {};
    this.metrics = new MetricsCollector();
    this.conversationHistory = [];
    this.maxHistoryLength = 50;
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 5000
    };
    
    // Persistencia de historial de conversaciones
    this.historyFilePath = path.join(
      process.env.APPDATA || process.env.HOME || __dirname,
      '.sandra-conversations.json'
    );

    this.isInitialized = false;
    this.startTime = Date.now();

    console.log('Sandra Orchestrator initialized');
  }

  async initialize() {
    try {
      console.log('Initializing Sandra DevConsole services...');

      // Inicializar servicios de forma tolerante a fallos
      // El servicio AI es obligatorio, los otros son opcionales
      try {
        this.services.ai = new SandraAICore();
        console.log('✓ AI Core service initialized');
      } catch (error) {
        console.error('✗ AI Core service failed to initialize:', error.message);
        throw error; // AI es obligatorio
      }

      // Servicios opcionales - si fallan, se marcan como no disponibles pero no detienen la app
      try {
        this.services.voice = new SandraVoice();
        console.log('✓ Voice service initialized');
      } catch (error) {
        console.warn('⚠ Voice service failed to initialize (will be disabled):', error.message);
        this.services.voice = null;
      }

      try {
        this.services.avatar = new SandraAvatar();
        console.log('✓ Avatar service initialized');
      } catch (error) {
        console.warn('⚠ Avatar service failed to initialize (will be disabled):', error.message);
        this.services.avatar = null;
      }

      try {
        this.services.payments = new SandraPayments();
        console.log('✓ Payments service initialized');
      } catch (error) {
        console.warn('⚠ Payments service failed to initialize (will be disabled):', error.message);
        this.services.payments = null;
      }

      // Inicializar Sandra Nucleus (núcleo con programación por voz)
      try {
        await SandraNucleus.initialize();
        console.log('✓ Sandra Nucleus initialized');
        this.services.nucleus = SandraNucleus;
      } catch (error) {
        console.warn('⚠ Sandra Nucleus failed to initialize (voice programming disabled):', error.message);
        this.services.nucleus = null;
      }

      // Configurar circuit breakers solo para servicios disponibles
      if (this.services.ai) {
        this.circuitBreakers.ai = new CircuitBreaker('sandra-ai-core', {
          failureThreshold: 3,
          timeout: 30000,
          resetTimeout: 60000
        });
      }

      if (this.services.voice) {
        this.circuitBreakers.voice = new CircuitBreaker('sandra-voice', {
          failureThreshold: 5,
          timeout: 45000,
          resetTimeout: 120000
        });
      }

      if (this.services.avatar) {
        this.circuitBreakers.avatar = new CircuitBreaker('sandra-avatar', {
          failureThreshold: 3,
          timeout: 60000,
          resetTimeout: 180000
        });
      }

      if (this.services.payments) {
        this.circuitBreakers.payments = new CircuitBreaker('sandra-payments', {
          failureThreshold: 2,
          timeout: 20000,
          resetTimeout: 300000
        });
      }

      // Verificar salud de servicios (no debe fallar si algunos servicios no están disponibles)
      try {
        await this.performHealthChecks();
      } catch (healthError) {
        console.warn('Some health checks failed, continuing anyway:', healthError.message);
      }

      this.isInitialized = true;
      console.log('Sandra DevConsole orchestrator initialized successfully');

      // Mensaje de bienvenida
      return {
        success: true,
        message: '¡Hola Clayton! 💙 Sandra DevConsole está lista. Todos los sistemas están operativos y listos para asistirte.',
        services: this.getServiceStatus(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Orchestrator initialization failed:', error);
      this.isInitialized = false;
      throw new Error(`Failed to initialize Sandra DevConsole: ${error.message}`);
    }
  }

  async processMessage(message, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Orchestrator not initialized');
    }

    const conversationId = options.conversationId || this.generateConversationId();
    const includeVoice = options.includeVoice || false;
    const includeAvatar = options.includeAvatar || false;
    const startTime = Date.now();

    try {
      console.log(`Processing message: "${message.substring(0, 50)}..."`);

      // Procesar mensaje con IA
      const aiResponse = await this.processWithAI(message);

      // Preparar respuesta base
      // Si hay un fallback, aún devolvemos success: true para que se muestre al usuario
      const response = {
        success: aiResponse.success !== false, // true si es exitoso o si hay fallback
        conversationId: conversationId,
        text: aiResponse.response || aiResponse.fallbackResponse || 'Lo siento, no pude procesar tu mensaje.',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        services: {
          ai: { 
            success: aiResponse.success !== false, 
            model: aiResponse.model || 'fallback',
            error: aiResponse.error || null
          }
        }
      };
      
      // Si hay un fallback, agregarlo también
      if (aiResponse.fallbackResponse && !aiResponse.success) {
        response.fallbackResponse = aiResponse.fallbackResponse;
      }

      // Procesar voz si se solicita y el servicio está disponible
      if (includeVoice && this.services.voice) {
        try {
          const voiceResponse = await this.processWithVoice(aiResponse.response);
          response.audio = voiceResponse;
          response.services.voice = { success: voiceResponse.success };
        } catch (error) {
          console.warn('Voice processing failed:', error.message);
          response.services.voice = { success: false, error: error.message };
        }
      } else if (includeVoice && !this.services.voice) {
        response.services.voice = { success: false, error: 'Voice service not available' };
      }

      // Procesar avatar si se solicita y el servicio está disponible
      if (includeAvatar && this.services.avatar) {
        try {
          console.log('[ORCHESTRATOR] Processing avatar with HeyGen...');
          const avatarResponse = await this.processWithAvatar(aiResponse.response);
          
          // Asegurar que el avatar siempre tenga el ID correcto
          if (avatarResponse && avatarResponse.success) {
            avatarResponse.avatarId = avatarResponse.avatarId || '306d1c6f1b014036b467ff70ea38d965';
            avatarResponse.interactiveAvatarUrl = avatarResponse.interactiveAvatarUrl || 
              `https://app.heygen.com/interactive-avatar/${avatarResponse.avatarId}`;
            avatarResponse.embedUrl = avatarResponse.interactiveAvatarUrl;
          }
          
          response.avatar = avatarResponse;
          response.services.avatar = { success: avatarResponse.success };
          console.log('[ORCHESTRATOR] Avatar processed successfully');
        } catch (error) {
          console.warn('[ORCHESTRATOR] Avatar processing failed:', error.message);
          response.services.avatar = { success: false, error: error.message };
        }
      } else if (includeAvatar && !this.services.avatar) {
        console.warn('[ORCHESTRATOR] Avatar service not available');
        response.services.avatar = { success: false, error: 'Avatar service not available' };
      }

      // Guardar en historial
      this.addToConversationHistory({
        user: message,
        sandra: aiResponse.response,
        timestamp: response.timestamp,
        services: Object.keys(response.services),
        conversationId: conversationId
      });

      // Registrar métricas de conversación
      const conversationType = this.getConversationType(includeVoice, includeAvatar);
      this.metrics.recordConversation(conversationType, Date.now() - startTime, 1);

      console.log(`Message processed successfully in ${response.processingTime}ms`);
      return response;

    } catch (error) {
      console.error('Message processing failed:', error);

      // Respuesta de fallback con personalidad de Sandra
      return {
        success: false,
        error: error.message,
        fallbackResponse: "Disculpa Clayton, estoy experimentando algunas dificultades técnicas. 💙 Pero estoy aquí para ti. ¿Podrías repetir tu consulta? Siempre encuentro una manera de ayudarte.",
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        conversationId: conversationId
      };
    }
  }

  async processWithAI(message) {
    const context = {
      conversation: this.getRecentConversationHistory()
    };

    try {
      return await this.circuitBreakers.ai.execute(async () => {
        const startTime = Date.now();
        const result = await this.services.ai.processMessage(message, context);
        const endTime = Date.now();

        this.metrics.recordRequest('sandra-ai-core', startTime, endTime, result.success);

        // Si es exitoso, devolver normalmente
        if (result.success) {
          return result;
        }

        // Si hay un error pero hay fallbackResponse, usarlo pero marcar como fallback
        if (result.fallbackResponse) {
          return { 
            response: result.fallbackResponse, 
            model: 'fallback',
            success: false, // Mantener false para indicar que es un fallback
            error: result.error,
            fallbackResponse: result.fallbackResponse
          };
        }

        // Si no hay éxito ni fallback, crear uno
        return {
          response: "Disculpa Clayton, estoy experimentando algunas dificultades técnicas. 💙 ¿Podrías repetir tu consulta?",
          model: 'fallback',
          success: false,
          error: result.error || 'Unknown error',
          fallbackResponse: "Disculpa Clayton, estoy experimentando algunas dificultades técnicas. 💙 ¿Podrías repetir tu consulta?"
        };
      });
    } catch (error) {
      console.error('Error in processWithAI:', error);
      console.error('Error stack:', error.stack);
      return {
        response: "Disculpa Clayton, estoy experimentando algunas dificultades técnicas. 💙 Pero estoy aquí para ti. ¿Podrías repetir tu consulta? Siempre encuentro una manera de ayudarte.",
        model: 'fallback',
        success: false,
        error: error.message,
        fallbackResponse: "Disculpa Clayton, estoy experimentando algunas dificultades técnicas. 💙 Pero estoy aquí para ti. ¿Podrías repetir tu consulta? Siempre encuentro una manera de ayudarte."
      };
    }
  }

  async processWithVoice(text) {
    return await this.circuitBreakers.voice.execute(async () => {
      const startTime = Date.now();
      const result = await this.services.voice.synthesizeSpeech(text);
      const endTime = Date.now();

      this.metrics.recordRequest('sandra-voice', startTime, endTime, result.success);
      return result;
    });
  }

  async processWithAvatar(text) {
    return await this.circuitBreakers.avatar.execute(async () => {
      const startTime = Date.now();
      const result = await this.services.avatar.generateAvatarVideo(text);
      const endTime = Date.now();

      this.metrics.recordRequest('sandra-avatar', startTime, endTime, result.success);
      return result;
    });
  }

  /**
   * Procesar comando de voz para el asistente IA
   * @param {Buffer} audioBuffer - Audio del comando
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async processAIVoiceCommand(audioBuffer, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Orchestrator not initialized');
    }

    if (!this.services.nucleus || !this.services.nucleus.voiceCommandsForAI) {
      throw new Error('Voice commands for AI not available');
    }

    const startTime = Date.now();
    const conversationId = options.conversationId || this.generateConversationId();

    try {
      console.log('[AI-VOICE-COMMAND] Procesando comando de voz para asistente...');

      const result = await this.services.nucleus.voiceCommandsForAI.processAICommand(audioBuffer);

      this.addToConversationHistory({
        user: `[VOICE COMMAND] ${result.command || 'Comando de voz'}`,
        sandra: result.feedback || result.result?.feedback || 'Comando procesado',
        timestamp: new Date().toISOString(),
        services: ['voice-commands-ai'],
        conversationId: conversationId,
        voiceCommand: true,
        commandType: result.type
      });

      const processingTime = Date.now() - startTime;
      this.metrics.recordConversation('voice-commands-ai', processingTime, 1);

      return {
        success: result.success,
        conversationId: conversationId,
        command: result.command,
        type: result.type,
        result: result.result,
        feedback: result.feedback,
        timestamp: new Date().toISOString(),
        processingTime: processingTime,
        services: {
          'voice-commands-ai': {
            success: result.success,
            commandType: result.type
          }
        }
      };
    } catch (error) {
      console.error('[AI-VOICE-COMMAND] Error:', error);
      return {
        success: false,
        error: error.message,
        message: `Error procesando comando de voz: ${error.message}`,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        conversationId: conversationId
      };
    }
  }

  /**
   * Procesar comando de programación por voz
   * @param {Buffer} audioBuffer - Audio del comando de voz
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async processVoiceCommand(audioBuffer, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Orchestrator not initialized');
    }

    if (!this.services.nucleus || !this.services.nucleus.voiceProgramming) {
      throw new Error('Voice programming not available');
    }

    const startTime = Date.now();
    const conversationId = options.conversationId || this.generateConversationId();

    try {
      console.log('[VOICE-COMMAND] Procesando comando de voz...');

      // Usar el módulo de programación por voz del núcleo
      const result = await this.services.nucleus.voiceProgramming.processVoiceCommand(audioBuffer);

      // Guardar en historial
      this.addToConversationHistory({
        user: `[VOICE COMMAND] ${result.command || 'Comando de voz'}`,
        sandra: result.message || 'Código generado exitosamente',
        timestamp: new Date().toISOString(),
        services: ['voice-programming'],
        conversationId: conversationId,
        voiceCommand: true,
        generatedCode: result.generatedCode
      });

      const processingTime = Date.now() - startTime;
      this.metrics.recordConversation('voice-programming', processingTime, 1);

      return {
        success: result.success,
        conversationId: conversationId,
        command: result.command,
        parsedCommand: result.parsedCommand,
        generatedCode: result.generatedCode,
        applied: result.applied,
        message: result.message,
        audio: result.audio, // Audio de feedback si está disponible
        timestamp: new Date().toISOString(),
        processingTime: processingTime,
        services: {
          'voice-programming': {
            success: result.success,
            role: result.parsedCommand?.role || null
          }
        }
      };
    } catch (error) {
      console.error('[VOICE-COMMAND] Error procesando comando:', error);
      return {
        success: false,
        error: error.message,
        message: `Error procesando comando de voz: ${error.message}`,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        conversationId: conversationId
      };
    }
  }

  async processPayment(amount, description) {
    return await this.circuitBreakers.payments.execute(async () => {
      const startTime = Date.now();
      const result = await this.services.payments.createPayment(amount, 'USD', description);
      const endTime = Date.now();

      this.metrics.recordRequest('sandra-payments', startTime, endTime, result.success);
      return result;
    });
  }

  async performHealthChecks() {
    const healthResults = {};

    for (const [serviceName, service] of Object.entries(this.services)) {
      try {
        healthResults[serviceName] = await service.healthCheck();
        console.log(`${serviceName} health check:`, healthResults[serviceName].status);
      } catch (error) {
        healthResults[serviceName] = {
          status: 'unhealthy',
          error: error.message
        };
        console.error(`${serviceName} health check failed:`, error.message);
      }
    }

    return healthResults;
  }

  getServiceStatus() {
    const status = {};

    for (const [serviceName, service] of Object.entries(this.services)) {
      if (!service) {
        status[serviceName] = {
          available: false,
          healthy: false,
          error: 'Service not initialized',
          circuitBreaker: {
            state: 'UNAVAILABLE',
            failureCount: 0
          },
          capabilities: [],
          provider: 'N/A',
          lastCheck: new Date().toISOString()
        };
        continue;
      }

      const circuitBreakerState = this.circuitBreakers[serviceName]?.getState();
      let capabilities = null;
      
      try {
        if (typeof service.getCapabilities === 'function') {
          capabilities = service.getCapabilities();
        }
      } catch (error) {
        console.warn(`Failed to get capabilities for ${serviceName}:`, error.message);
      }

      status[serviceName] = {
        available: circuitBreakerState?.state === 'CLOSED',
        healthy: circuitBreakerState?.isHealthy || false,
        circuitBreaker: {
          state: circuitBreakerState?.state || 'UNKNOWN',
          failureCount: circuitBreakerState?.failureCount || 0
        },
        capabilities: capabilities?.capabilities || [],
        provider: capabilities?.provider || 'Internal',
        lastCheck: new Date().toISOString()
      };
    }

    return status;
  }

  getMetrics() {
    const systemMetrics = this.metrics.getMetrics();

    return {
      ...systemMetrics,
      orchestrator: {
        uptime: Date.now() - this.startTime,
        conversationHistory: this.conversationHistory.length,
        servicesCount: Object.keys(this.services).length,
        circuitBreakers: Object.keys(this.circuitBreakers).map(name => ({
          name,
          ...this.circuitBreakers[name].getHealthStatus()
        }))
      }
    };
  }

  addToConversationHistory(entry) {
    this.conversationHistory.push(entry);

    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory.shift();
    }
  }

  getRecentConversationHistory(limit = 10) {
    return this.conversationHistory
      .slice(-limit)
      .map(entry => [
        { role: 'user', content: entry.user },
        { role: 'assistant', content: entry.sandra }
      ])
      .flat();
  }

  getConversationType(includeVoice, includeAvatar) {
    if (includeVoice && includeAvatar) return 'fullMultimodal';
    if (includeAvatar) return 'withAvatar';
    if (includeVoice) return 'withVoice';
    return 'textOnly';
  }

  generateConversationId() {
    return `sandra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos de control del sistema
  async resetService(serviceName) {
    if (this.circuitBreakers[serviceName]) {
      this.circuitBreakers[serviceName].reset();
      console.log(`Service ${serviceName} circuit breaker reset`);
    }

    return await this.performHealthChecks();
  }

  async resetAllServices() {
    for (const circuitBreaker of Object.values(this.circuitBreakers)) {
      circuitBreaker.reset();
    }

    console.log('All services reset');
    return await this.performHealthChecks();
  }

  // Cleanup y shutdown
  cleanup() {
    // Limpiar archivos temporales de voz
    if (this.services.voice && typeof this.services.voice.cleanup === 'function') {
      this.services.voice.cleanup();
    }

    // Limpiar archivos temporales de avatar
    if (this.services.avatar && typeof this.services.avatar.cleanup === 'function') {
      this.services.avatar.cleanup();
    }

    console.log('Orchestrator cleanup completed');
  }

  shutdown() {
    console.log('Shutting down Sandra Orchestrator...');
    this.cleanup();
    this.isInitialized = false;
    console.log('Sandra Orchestrator shutdown completed');
  }

  // Información del sistema para el frontend
  getSystemInfo() {
    return {
      name: 'Sandra DevConsole',
      version: '1.0.0',
      orchestrator: {
        initialized: this.isInitialized,
        uptime: this.formatUptime(Date.now() - this.startTime),
        conversationsCount: this.conversationHistory.length
      },
      services: this.getServiceStatus(),
      capabilities: {
        multimodal: true,
        voiceSynthesis: true,
        avatarVideo: true,
        paymentProcessing: true,
        conversationalAI: true
      },
      healthStatus: this.getOverallHealthStatus()
    };
  }

  getOverallHealthStatus() {
    const serviceStatuses = Object.values(this.getServiceStatus());
    const healthyServices = serviceStatuses.filter(s => s.healthy).length;
    const totalServices = serviceStatuses.length;

    if (healthyServices === totalServices) return 'excellent';
    if (healthyServices >= totalServices * 0.75) return 'good';
    if (healthyServices >= totalServices * 0.5) return 'fair';
    return 'poor';
  }

  formatUptime(uptimeMs) {
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

module.exports = { SandraOrchestrator };