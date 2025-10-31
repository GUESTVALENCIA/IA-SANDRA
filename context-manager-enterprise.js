/**
 * SANDRA IA GALAXY ENTERPRISE - CONTEXT MANAGER v7.0
 * Sistema Centralizado de Gestión de Contexto para Ecosistema Galaxy Enterprise
 * Unifica gestión de contexto dispersa y optimiza acceso cross-agent
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');
const { performance } = require('perf_hooks');

// Importar ecosistema Sandra IA Galaxy Enterprise
const logger = require('./backend/logger');
const metrics = require('./backend/metrics');

class ContextManagerEnterprise extends EventEmitter {
  constructor() {
    super();
    this.name = "SANDRA_CONTEXT_MANAGER_ENTERPRISE";
    this.version = "7.0_GALAXY_ENTERPRISE";
    this.mode = "CENTRALIZED_CONTEXT_MANAGEMENT";

    // Estado del sistema de contexto
    this.contextState = {
      status: 'INITIALIZING',
      totalContexts: 0,
      activeContexts: 0,
      contextSizeBytes: 0,
      lastOptimization: null,
      cacheMisses: 0,
      cacheHits: 0
    };

    // Configuración Galaxy Enterprise
    this.galaxyConfig = {
      enableDistributedContext: true,
      enableContextCaching: true,
      enableContextCompression: true,
      enableCrossAgentContext: true,
      maxContextSize: 50 * 1024 * 1024, // 50MB
      maxActiveContexts: 1000,
      contextTTL: 3600000, // 1 hora
      cacheEvictionPolicy: 'LRU',
      compressionThreshold: 1024 // 1KB
    };

    // Storage centralizado de contextos
    this.centralContextStorage = {
      // Contextos por agente
      agentContexts: new Map(),

      // Contextos compartidos cross-agent
      sharedContexts: new Map(),

      // Contextos del sistema Galaxy
      systemContexts: new Map(),

      // Contextos de workflow
      workflowContexts: new Map(),

      // Contextos de conocimiento
      knowledgeContexts: new Map(),

      // Contextos temporales
      temporaryContexts: new Map(),

      // Metadatos de contextos
      contextMetadata: new Map()
    };

    // Sistema de cache distribuido
    this.distributedCache = {
      // Cache L1 (memoria local)
      l1Cache: new Map(),

      // Cache L2 (memoria compartida)
      l2Cache: new Map(),

      // Índices de cache
      cacheIndices: {
        byAgent: new Map(),
        byType: new Map(),
        byTimestamp: new Map(),
        bySize: new Map()
      },

      // Métricas de cache
      cacheMetrics: {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalAccess: 0,
        hitRate: 0
      }
    };

    // Context Compression Engine
    this.compressionEngine = {
      enabled: true,
      algorithms: new Map([
        ['gzip', { compression: 0.7, speed: 'fast' }],
        ['lz4', { compression: 0.5, speed: 'fastest' }],
        ['brotli', { compression: 0.8, speed: 'slow' }]
      ]),
      defaultAlgorithm: 'lz4',
      compressionStats: {
        totalCompressed: 0,
        totalSaved: 0,
        compressionRatio: 0
      }
    };

    // Context Synchronization
    this.synchronization = {
      // Eventos de sincronización
      syncEvents: new Map(),

      // Estado de sincronización por agente
      agentSyncState: new Map(),

      // Conflicts y resolución
      conflictResolution: {
        strategy: 'LAST_WRITE_WINS',
        conflicts: new Map(),
        resolutions: new Map()
      },

      // Distribución de eventos
      eventDistribution: {
        subscribers: new Map(),
        eventQueue: [],
        processingQueue: false
      }
    };

    // Context Analytics
    this.contextAnalytics = {
      // Patrones de uso
      usagePatterns: new Map(),

      // Access patterns
      accessPatterns: new Map(),

      // Performance patterns
      performancePatterns: new Map(),

      // Optimization opportunities
      optimizationOpportunities: new Map(),

      // Context lifecycle tracking
      lifecycleTracking: new Map()
    };

    // Integración Galaxy Enterprise
    this.galaxyIntegration = {
      multiAgentCoordinator: null,
      errorCoordinatorEnterprise: null,
      workflowOrchestrator: null,
      knowledgeSynthesizerGalaxy: null,
      guardianProtocol: null
    };

    this.initialize();
  }

  async initialize() {
    logger.info('[CONTEXT MANAGER ENTERPRISE] Initializing Galaxy Enterprise Context Management System');

    try {
      // 1. Inicializar storage centralizado
      await this.initializeCentralStorage();

      // 2. Configurar cache distribuido
      await this.setupDistributedCache();

      // 3. Inicializar compression engine
      await this.initializeCompressionEngine();

      // 4. Configurar sincronización
      await this.setupSynchronization();

      // 5. Inicializar analytics
      await this.initializeContextAnalytics();

      // 6. Configurar integración Galaxy
      await this.setupGalaxyIntegration();

      // 7. Activar optimización automática
      await this.activateAutomaticOptimization();

      this.contextState.status = 'GALAXY_CONTEXT_ACTIVE';
      logger.info('[CONTEXT MANAGER ENTERPRISE] ✅ Galaxy Enterprise Context Management System OPERATIONAL');

      this.emit('context-manager:ready', {
        system: this.name,
        version: this.version,
        mode: this.mode,
        totalContexts: this.contextState.totalContexts
      });

    } catch (error) {
      logger.error('[CONTEXT MANAGER ENTERPRISE] Initialization failed:', error);
      this.contextState.status = 'ERROR';
      throw error;
    }
  }

  // ============================================================================
  // CENTRAL STORAGE MANAGEMENT
  // ============================================================================
  async initializeCentralStorage() {
    logger.info('[CONTEXT MANAGER ENTERPRISE] Initializing Central Context Storage');

    // Configurar storage por categorías
    const storageCategories = [
      'agentContexts',
      'sharedContexts',
      'systemContexts',
      'workflowContexts',
      'knowledgeContexts',
      'temporaryContexts'
    ];

    for (const category of storageCategories) {
      this.centralContextStorage[category] = new Map();
      this.centralContextStorage.contextMetadata.set(category, {
        name: category,
        totalContexts: 0,
        totalSize: 0,
        lastAccess: new Date(),
        compressionEnabled: true
      });
    }

    // Cargar contextos existentes si los hay
    await this.loadExistingContexts();

    logger.info('[CONTEXT MANAGER ENTERPRISE] ✅ Central Context Storage initialized');
  }

  async storeContext(contextId, contextData, options = {}) {
    const startTime = performance.now();

    try {
      const {
        category = 'agentContexts',
        agentId = null,
        persistent = false,
        ttl = this.galaxyConfig.contextTTL,
        compress = true,
        shared = false
      } = options;

      // Validar tamaño del contexto
      const contextSize = this.calculateContextSize(contextData);
      if (contextSize > this.galaxyConfig.maxContextSize) {
        throw new Error(`Context size ${contextSize} exceeds maximum ${this.galaxyConfig.maxContextSize}`);
      }

      // Comprimir si es necesario
      let processedData = contextData;
      let compressionInfo = null;

      if (compress && contextSize > this.galaxyConfig.compressionThreshold) {
        const compressionResult = await this.compressContext(contextData);
        processedData = compressionResult.compressedData;
        compressionInfo = compressionResult.info;
      }

      // Crear entrada de contexto
      const contextEntry = {
        id: contextId,
        data: processedData,
        metadata: {
          category,
          agentId,
          size: contextSize,
          compressed: !!compressionInfo,
          compressionInfo,
          persistent,
          ttl,
          shared,
          createdAt: new Date(),
          lastAccess: new Date(),
          accessCount: 0
        }
      };

      // Almacenar en categoría apropiada
      const storage = this.centralContextStorage[category];
      if (!storage) {
        throw new Error(`Invalid context category: ${category}`);
      }

      storage.set(contextId, contextEntry);

      // Actualizar cache si corresponde
      await this.updateCache(contextId, contextEntry);

      // Actualizar metadatos
      this.updateStorageMetadata(category, contextSize);

      // Actualizar analytics
      this.trackContextStorage(contextId, contextEntry);

      // Configurar TTL si no es persistente
      if (!persistent && ttl > 0) {
        setTimeout(() => {
          this.removeContext(contextId, category);
        }, ttl);
      }

      // Actualizar estado
      this.contextState.totalContexts++;
      this.contextState.activeContexts = this.getActiveContextsCount();
      this.contextState.contextSizeBytes += contextSize;

      const storageTime = performance.now() - startTime;
      logger.debug(`[CONTEXT MANAGER ENTERPRISE] Context stored: ${contextId} (${storageTime.toFixed(2)}ms)`);

      // Emitir evento
      this.emit('context:stored', {
        contextId,
        category,
        size: contextSize,
        compressed: !!compressionInfo,
        storageTime
      });

      return {
        contextId,
        stored: true,
        size: contextSize,
        compressed: !!compressionInfo,
        category,
        storageTime
      };

    } catch (error) {
      logger.error(`[CONTEXT MANAGER ENTERPRISE] Failed to store context ${contextId}:`, error);
      metrics.incrementContextStorageFailure();
      throw error;
    }
  }

  async retrieveContext(contextId, category = null) {
    const startTime = performance.now();

    try {
      // Buscar en cache primero
      const cacheResult = await this.retrieveFromCache(contextId);
      if (cacheResult) {
        this.distributedCache.cacheMetrics.hits++;
        this.updateCacheMetrics();

        const retrievalTime = performance.now() - startTime;
        logger.debug(`[CONTEXT MANAGER ENTERPRISE] Context retrieved from cache: ${contextId} (${retrievalTime.toFixed(2)}ms)`);

        return cacheResult;
      }

      this.distributedCache.cacheMetrics.misses++;
      this.contextState.cacheMisses++;

      // Buscar en storage
      let contextEntry = null;
      let foundCategory = null;

      if (category) {
        // Buscar en categoría específica
        const storage = this.centralContextStorage[category];
        if (storage && storage.has(contextId)) {
          contextEntry = storage.get(contextId);
          foundCategory = category;
        }
      } else {
        // Buscar en todas las categorías
        for (const [cat, storage] of Object.entries(this.centralContextStorage)) {
          if (storage instanceof Map && storage.has(contextId)) {
            contextEntry = storage.get(contextId);
            foundCategory = cat;
            break;
          }
        }
      }

      if (!contextEntry) {
        throw new Error(`Context not found: ${contextId}`);
      }

      // Descomprimir si es necesario
      let contextData = contextEntry.data;
      if (contextEntry.metadata.compressed) {
        contextData = await this.decompressContext(
          contextEntry.data,
          contextEntry.metadata.compressionInfo
        );
      }

      // Actualizar metadatos de acceso
      contextEntry.metadata.lastAccess = new Date();
      contextEntry.metadata.accessCount++;

      // Actualizar cache
      await this.updateCache(contextId, contextEntry);

      // Track analytics
      this.trackContextRetrieval(contextId, contextEntry);

      this.updateCacheMetrics();

      const retrievalTime = performance.now() - startTime;
      logger.debug(`[CONTEXT MANAGER ENTERPRISE] Context retrieved from storage: ${contextId} (${retrievalTime.toFixed(2)}ms)`);

      return {
        contextId,
        data: contextData,
        metadata: contextEntry.metadata,
        category: foundCategory,
        retrievalTime
      };

    } catch (error) {
      logger.error(`[CONTEXT MANAGER ENTERPRISE] Failed to retrieve context ${contextId}:`, error);
      metrics.incrementContextRetrievalFailure();
      throw error;
    }
  }

  // ============================================================================
  // DISTRIBUTED CACHE MANAGEMENT
  // ============================================================================
  async setupDistributedCache() {
    logger.info('[CONTEXT MANAGER ENTERPRISE] Setting up Distributed Cache System');

    // Configurar políticas de cache
    this.distributedCache.policies = {
      eviction: this.galaxyConfig.cacheEvictionPolicy,
      maxSize: Math.floor(this.galaxyConfig.maxContextSize * 0.1), // 10% del max context size
      ttl: this.galaxyConfig.contextTTL * 0.5 // 50% del TTL de contexto
    };

    // Inicializar índices de cache
    for (const [indexName, index] of Object.entries(this.distributedCache.cacheIndices)) {
      index.clear();
    }

    // Configurar limpieza automática de cache
    setInterval(() => {
      this.cleanupCache();
    }, 300000); // Cada 5 minutos

    logger.info('[CONTEXT MANAGER ENTERPRISE] ✅ Distributed Cache System configured');
  }

  async updateCache(contextId, contextEntry) {
    // Verificar espacio en cache
    if (this.distributedCache.l1Cache.size >= 100) { // Límite L1
      await this.evictFromCache('l1');
    }

    // Almacenar en L1 cache
    this.distributedCache.l1Cache.set(contextId, {
      ...contextEntry,
      cachedAt: new Date()
    });

    // Actualizar índices
    if (contextEntry.metadata.agentId) {
      this.addToCacheIndex('byAgent', contextEntry.metadata.agentId, contextId);
    }
    this.addToCacheIndex('byType', contextEntry.metadata.category, contextId);
    this.addToCacheIndex('byTimestamp', new Date().getTime(), contextId);
    this.addToCacheIndex('bySize', contextEntry.metadata.size, contextId);
  }

  async retrieveFromCache(contextId) {
    // Buscar en L1 cache
    if (this.distributedCache.l1Cache.has(contextId)) {
      const entry = this.distributedCache.l1Cache.get(contextId);

      // Verificar TTL
      const age = Date.now() - entry.cachedAt.getTime();
      if (age < this.distributedCache.policies.ttl) {
        return {
          contextId,
          data: entry.data,
          metadata: entry.metadata,
          cached: true,
          cacheLevel: 'L1'
        };
      } else {
        // Expirado, remover del cache
        this.distributedCache.l1Cache.delete(contextId);
      }
    }

    // Buscar en L2 cache
    if (this.distributedCache.l2Cache.has(contextId)) {
      const entry = this.distributedCache.l2Cache.get(contextId);

      const age = Date.now() - entry.cachedAt.getTime();
      if (age < this.distributedCache.policies.ttl) {
        // Promover a L1
        await this.updateCache(contextId, entry);

        return {
          contextId,
          data: entry.data,
          metadata: entry.metadata,
          cached: true,
          cacheLevel: 'L2'
        };
      } else {
        this.distributedCache.l2Cache.delete(contextId);
      }
    }

    return null;
  }

  // ============================================================================
  // COMPRESSION ENGINE
  // ============================================================================
  async initializeCompressionEngine() {
    logger.info('[CONTEXT MANAGER ENTERPRISE] Initializing Context Compression Engine');

    // Configurar algoritmos disponibles
    this.compressionEngine.enabled = this.galaxyConfig.enableContextCompression;

    if (this.compressionEngine.enabled) {
      logger.info('[CONTEXT MANAGER ENTERPRISE] ✅ Context Compression Engine enabled');
    } else {
      logger.info('[CONTEXT MANAGER ENTERPRISE] Context Compression Engine disabled');
    }
  }

  async compressContext(contextData) {
    if (!this.compressionEngine.enabled) {
      return { compressedData: contextData, info: null };
    }

    const startTime = performance.now();
    const originalSize = this.calculateContextSize(contextData);

    try {
      // Serializar contexto
      const serialized = JSON.stringify(contextData);

      // Comprimir usando algoritmo por defecto (simulado)
      const compressed = Buffer.from(serialized).toString('base64');
      const compressedSize = Buffer.byteLength(compressed);

      const compressionRatio = compressedSize / originalSize;
      const compressionTime = performance.now() - startTime;

      const compressionInfo = {
        algorithm: this.compressionEngine.defaultAlgorithm,
        originalSize,
        compressedSize,
        compressionRatio,
        compressionTime,
        savedBytes: originalSize - compressedSize
      };

      // Actualizar estadísticas
      this.compressionEngine.compressionStats.totalCompressed++;
      this.compressionEngine.compressionStats.totalSaved += compressionInfo.savedBytes;
      this.compressionEngine.compressionStats.compressionRatio =
        (this.compressionEngine.compressionStats.compressionRatio + compressionRatio) / 2;

      logger.debug(`[CONTEXT MANAGER ENTERPRISE] Context compressed: ${originalSize} -> ${compressedSize} bytes (${compressionRatio.toFixed(2)})`);

      return {
        compressedData: compressed,
        info: compressionInfo
      };

    } catch (error) {
      logger.error('[CONTEXT MANAGER ENTERPRISE] Context compression failed:', error);
      return { compressedData: contextData, info: null };
    }
  }

  async decompressContext(compressedData, compressionInfo) {
    if (!compressionInfo) {
      return compressedData;
    }

    try {
      // Descomprimir (simulado)
      const decompressed = Buffer.from(compressedData, 'base64').toString();
      return JSON.parse(decompressed);

    } catch (error) {
      logger.error('[CONTEXT MANAGER ENTERPRISE] Context decompression failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // SYNCHRONIZATION SYSTEM
  // ============================================================================
  async setupSynchronization() {
    logger.info('[CONTEXT MANAGER ENTERPRISE] Setting up Context Synchronization System');

    // Configurar estrategia de resolución de conflictos
    this.synchronization.conflictResolution.strategy = 'LAST_WRITE_WINS';

    // Configurar distribución de eventos
    this.synchronization.eventDistribution.processingQueue = false;

    // Iniciar procesamiento de eventos
    this.startEventProcessing();

    logger.info('[CONTEXT MANAGER ENTERPRISE] ✅ Context Synchronization System configured');
  }

  startEventProcessing() {
    setInterval(() => {
      if (!this.synchronization.eventDistribution.processingQueue) {
        this.processEventQueue();
      }
    }, 1000); // Cada segundo
  }

  async processEventQueue() {
    if (this.synchronization.eventDistribution.eventQueue.length === 0) {
      return;
    }

    this.synchronization.eventDistribution.processingQueue = true;

    try {
      while (this.synchronization.eventDistribution.eventQueue.length > 0) {
        const event = this.synchronization.eventDistribution.eventQueue.shift();
        await this.processContextEvent(event);
      }
    } catch (error) {
      logger.error('[CONTEXT MANAGER ENTERPRISE] Event processing failed:', error);
    } finally {
      this.synchronization.eventDistribution.processingQueue = false;
    }
  }

  async processContextEvent(event) {
    // Distribuir evento a subscribers
    const subscribers = this.synchronization.eventDistribution.subscribers.get(event.type) || [];

    for (const subscriber of subscribers) {
      try {
        await subscriber.handler(event);
      } catch (error) {
        logger.error(`[CONTEXT MANAGER ENTERPRISE] Event handler failed for ${subscriber.id}:`, error);
      }
    }
  }

  // ============================================================================
  // GALAXY INTEGRATION
  // ============================================================================
  async setupGalaxyIntegration() {
    logger.info('[CONTEXT MANAGER ENTERPRISE] Setting up Galaxy Enterprise Integration');

    // Configurar conexiones cuando estén disponibles
    this.on('integration:connect', (component, instance) => {
      this.galaxyIntegration[component] = instance;
      logger.info(`[CONTEXT MANAGER ENTERPRISE] Connected to ${component}`);
    });

    // Configurar event handlers para integración
    this.setupGalaxyEventHandlers();

    logger.info('[CONTEXT MANAGER ENTERPRISE] ✅ Galaxy Enterprise Integration configured');
  }

  setupGalaxyEventHandlers() {
    // Handler para eventos de multi-agent-coordinator
    this.on('agent:context_request', async (data) => {
      try {
        const context = await this.retrieveContext(data.contextId, 'agentContexts');
        this.emit('agent:context_response', {
          requestId: data.requestId,
          agentId: data.agentId,
          context
        });
      } catch (error) {
        this.emit('agent:context_error', {
          requestId: data.requestId,
          agentId: data.agentId,
          error: error.message
        });
      }
    });

    // Handler para eventos de workflow-orchestrator
    this.on('workflow:context_request', async (data) => {
      try {
        const context = await this.retrieveContext(data.contextId, 'workflowContexts');
        this.emit('workflow:context_response', {
          requestId: data.requestId,
          workflowId: data.workflowId,
          context
        });
      } catch (error) {
        this.emit('workflow:context_error', {
          requestId: data.requestId,
          workflowId: data.workflowId,
          error: error.message
        });
      }
    });
  }

  // ============================================================================
  // CONTEXT ANALYTICS
  // ============================================================================
  async initializeContextAnalytics() {
    logger.info('[CONTEXT MANAGER ENTERPRISE] Initializing Context Analytics');

    // Configurar tracking de patrones
    this.contextAnalytics.enabled = true;

    // Iniciar análisis automático
    setInterval(() => {
      this.analyzeContextPatterns();
    }, 600000); // Cada 10 minutos

    logger.info('[CONTEXT MANAGER ENTERPRISE] ✅ Context Analytics initialized');
  }

  trackContextStorage(contextId, contextEntry) {
    const pattern = {
      contextId,
      category: contextEntry.metadata.category,
      size: contextEntry.metadata.size,
      agentId: contextEntry.metadata.agentId,
      timestamp: new Date(),
      operation: 'STORE'
    };

    this.contextAnalytics.usagePatterns.set(`${contextId}_store`, pattern);
  }

  trackContextRetrieval(contextId, contextEntry) {
    const pattern = {
      contextId,
      category: contextEntry.metadata.category,
      agentId: contextEntry.metadata.agentId,
      accessCount: contextEntry.metadata.accessCount,
      timestamp: new Date(),
      operation: 'RETRIEVE'
    };

    this.contextAnalytics.accessPatterns.set(`${contextId}_retrieve_${Date.now()}`, pattern);
  }

  async analyzeContextPatterns() {
    // Análisis de patrones de uso
    const usageAnalysis = this.analyzeUsagePatterns();

    // Análisis de patrones de acceso
    const accessAnalysis = this.analyzeAccessPatterns();

    // Identificar oportunidades de optimización
    const optimizations = this.identifyOptimizationOpportunities(usageAnalysis, accessAnalysis);

    logger.debug(`[CONTEXT MANAGER ENTERPRISE] Pattern analysis completed: ${optimizations.length} optimizations identified`);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  calculateContextSize(contextData) {
    try {
      return Buffer.byteLength(JSON.stringify(contextData));
    } catch (error) {
      return 0;
    }
  }

  async loadExistingContexts() {
    // Cargar contextos existentes si hay persistencia configurada
    // Por ahora, inicializar vacío
  }

  updateStorageMetadata(category, size) {
    const metadata = this.centralContextStorage.contextMetadata.get(category);
    if (metadata) {
      metadata.totalContexts++;
      metadata.totalSize += size;
      metadata.lastAccess = new Date();
    }
  }

  getActiveContextsCount() {
    let total = 0;
    for (const [_, storage] of Object.entries(this.centralContextStorage)) {
      if (storage instanceof Map) {
        total += storage.size;
      }
    }
    return total;
  }

  updateCacheMetrics() {
    const totalAccess = this.distributedCache.cacheMetrics.hits + this.distributedCache.cacheMetrics.misses;
    this.distributedCache.cacheMetrics.totalAccess = totalAccess;
    this.distributedCache.cacheMetrics.hitRate = totalAccess > 0 ?
      this.distributedCache.cacheMetrics.hits / totalAccess : 0;

    this.contextState.cacheHits = this.distributedCache.cacheMetrics.hits;
  }

  addToCacheIndex(indexName, key, contextId) {
    const index = this.distributedCache.cacheIndices[indexName];
    if (index) {
      if (!index.has(key)) {
        index.set(key, new Set());
      }
      index.get(key).add(contextId);
    }
  }

  async removeContext(contextId, category) {
    const storage = this.centralContextStorage[category];
    if (storage && storage.has(contextId)) {
      storage.delete(contextId);
      this.contextState.activeContexts = this.getActiveContextsCount();
    }

    // Remover del cache
    this.distributedCache.l1Cache.delete(contextId);
    this.distributedCache.l2Cache.delete(contextId);
  }

  async evictFromCache(level) {
    // Implementar estrategia LRU
    const cache = level === 'l1' ? this.distributedCache.l1Cache : this.distributedCache.l2Cache;

    if (cache.size > 0) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
      this.distributedCache.cacheMetrics.evictions++;
    }
  }

  cleanupCache() {
    // Limpiar contextos expirados del cache
    const now = Date.now();
    const ttl = this.distributedCache.policies.ttl;

    for (const [contextId, entry] of this.distributedCache.l1Cache) {
      if (now - entry.cachedAt.getTime() > ttl) {
        this.distributedCache.l1Cache.delete(contextId);
      }
    }

    for (const [contextId, entry] of this.distributedCache.l2Cache) {
      if (now - entry.cachedAt.getTime() > ttl) {
        this.distributedCache.l2Cache.delete(contextId);
      }
    }
  }

  async activateAutomaticOptimization() {
    // Optimización cada 15 minutos
    setInterval(() => {
      this.optimizeContextStorage();
    }, 900000);
  }

  async optimizeContextStorage() {
    logger.info('[CONTEXT MANAGER ENTERPRISE] Running context storage optimization');

    // Limpiar contextos expirados
    await this.cleanupExpiredContexts();

    // Optimizar cache
    this.cleanupCache();

    // Actualizar métricas
    this.contextState.lastOptimization = new Date();

    logger.info('[CONTEXT MANAGER ENTERPRISE] ✅ Context storage optimization completed');
  }

  async cleanupExpiredContexts() {
    const now = Date.now();

    for (const [category, storage] of Object.entries(this.centralContextStorage)) {
      if (storage instanceof Map) {
        for (const [contextId, entry] of storage) {
          if (entry.metadata && !entry.metadata.persistent) {
            const age = now - entry.metadata.createdAt.getTime();
            if (age > entry.metadata.ttl) {
              storage.delete(contextId);
            }
          }
        }
      }
    }
  }

  analyzeUsagePatterns() {
    // Análisis básico de patrones de uso
    return { patterns: this.contextAnalytics.usagePatterns.size };
  }

  analyzeAccessPatterns() {
    // Análisis básico de patrones de acceso
    return { patterns: this.contextAnalytics.accessPatterns.size };
  }

  identifyOptimizationOpportunities(usageAnalysis, accessAnalysis) {
    // Identificar oportunidades de optimización
    return [];
  }

  // ============================================================================
  // API METHODS GALAXY ENTERPRISE
  // ============================================================================
  getContextManagerStatus() {
    return {
      manager: this.name,
      version: this.version,
      mode: this.mode,
      status: this.contextState.status,
      contexts: {
        total: this.contextState.totalContexts,
        active: this.contextState.activeContexts,
        sizeBytes: this.contextState.contextSizeBytes
      },
      cache: {
        hits: this.contextState.cacheHits,
        misses: this.contextState.cacheMisses,
        hitRate: this.distributedCache.cacheMetrics.hitRate,
        l1Size: this.distributedCache.l1Cache.size,
        l2Size: this.distributedCache.l2Cache.size
      },
      compression: {
        enabled: this.compressionEngine.enabled,
        totalCompressed: this.compressionEngine.compressionStats.totalCompressed,
        totalSaved: this.compressionEngine.compressionStats.totalSaved,
        avgCompressionRatio: this.compressionEngine.compressionStats.compressionRatio
      },
      storage: {
        categories: Object.keys(this.centralContextStorage).length,
        lastOptimization: this.contextState.lastOptimization
      },
      analytics: {
        usagePatterns: this.contextAnalytics.usagePatterns.size,
        accessPatterns: this.contextAnalytics.accessPatterns.size
      }
    };
  }

  // Métodos públicos para integración Galaxy
  async createAgentContext(agentId, contextData, options = {}) {
    const contextId = `agent_${agentId}_${Date.now()}`;
    return await this.storeContext(contextId, contextData, {
      ...options,
      category: 'agentContexts',
      agentId
    });
  }

  async getAgentContext(agentId, contextId) {
    return await this.retrieveContext(contextId, 'agentContexts');
  }

  async createSharedContext(contextId, contextData, options = {}) {
    return await this.storeContext(contextId, contextData, {
      ...options,
      category: 'sharedContexts',
      shared: true
    });
  }

  async getSharedContext(contextId) {
    return await this.retrieveContext(contextId, 'sharedContexts');
  }

  async createWorkflowContext(workflowId, contextData, options = {}) {
    const contextId = `workflow_${workflowId}_${Date.now()}`;
    return await this.storeContext(contextId, contextData, {
      ...options,
      category: 'workflowContexts'
    });
  }

  async getWorkflowContext(workflowId, contextId) {
    return await this.retrieveContext(contextId, 'workflowContexts');
  }
}

// ============================================================================
// EXPORT Y AUTO-INICIALIZACIÓN
// ============================================================================
const contextManagerEnterprise = new ContextManagerEnterprise();

module.exports = {
  ContextManagerEnterprise,
  contextManagerEnterprise
};

// Auto-test si se ejecuta directamente
if (require.main === module) {
  console.log('[CONTEXT MANAGER ENTERPRISE] Testing Galaxy Enterprise Context Management System...');

  contextManagerEnterprise.on('context-manager:ready', (data) => {
    console.log('[CONTEXT MANAGER ENTERPRISE] ✅ Ready:', data);

    // Test de almacenamiento y recuperación
    const testContext = {
      agentId: 'test-agent-001',
      data: { message: 'Test context data', timestamp: new Date() },
      metadata: { version: '1.0', type: 'test' }
    };

    contextManagerEnterprise.createAgentContext('test-agent-001', testContext)
      .then(result => {
        console.log('[CONTEXT MANAGER ENTERPRISE] ✅ Context stored:', result.contextId);

        return contextManagerEnterprise.getAgentContext('test-agent-001', result.contextId);
      })
      .then(retrievedContext => {
        console.log('[CONTEXT MANAGER ENTERPRISE] ✅ Context retrieved');
        console.log('   - Context ID:', retrievedContext.contextId);
        console.log('   - Data Size:', retrievedContext.metadata.size);
        console.log('   - Compressed:', retrievedContext.metadata.compressed);
      })
      .catch(error => {
        console.error('[CONTEXT MANAGER ENTERPRISE] ❌ Test failed:', error);
      });
  });
}