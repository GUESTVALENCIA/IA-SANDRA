/**
 * Autenticación Básica para Endpoints Públicos
 * Sistema de API keys simple para proteger endpoints sensibles
 */

const crypto = require('crypto');
const { logger } = require('./logger');

class AuthManager {
  constructor() {
    // API keys válidas (en producción, usar base de datos o servicio de secrets)
    this.validKeys = new Set();
    
    // Cargar keys desde variables de entorno
    const apiKeysEnv = process.env.API_KEYS;
    if (apiKeysEnv) {
      apiKeysEnv.split(',').forEach(key => {
        if (key.trim()) {
          this.validKeys.add(key.trim());
        }
      });
    }
    
    // Key por defecto para desarrollo (NO USAR EN PRODUCCIÓN)
    if (process.env.NODE_ENV === 'development' && this.validKeys.size === 0) {
      this.validKeys.add('dev-key-default');
      logger.warn('Using default dev API key - NOT SECURE FOR PRODUCTION');
    }
    
    // Rate limiting por key
    this.keyUsage = new Map();
  }

  /**
   * Generar nueva API key
   */
  generateApiKey(prefix = 'sk') {
    const randomBytes = crypto.randomBytes(32);
    return `${prefix}_${randomBytes.toString('hex')}`;
  }

  /**
   * Validar API key
   */
  validateApiKey(apiKey) {
    if (!apiKey) {
      return { valid: false, reason: 'API key is required' };
    }
    
    // Verificar formato básico
    if (!apiKey.startsWith('sk_') && !apiKey.startsWith('pk_')) {
      // Permitir keys de desarrollo
      if (process.env.NODE_ENV === 'development' && apiKey === 'dev-key-default') {
        return { valid: true, key: apiKey };
      }
      return { valid: false, reason: 'Invalid API key format' };
    }
    
    // Verificar si existe
    if (!this.validKeys.has(apiKey)) {
      return { valid: false, reason: 'Invalid API key' };
    }
    
    // Registrar uso
    this.recordUsage(apiKey);
    
    return { valid: true, key: apiKey };
  }

  /**
   * Registrar uso de API key (para analytics)
   */
  recordUsage(apiKey) {
    const now = Date.now();
    if (!this.keyUsage.has(apiKey)) {
      this.keyUsage.set(apiKey, {
        count: 0,
        firstUse: now,
        lastUse: now
      });
    }
    
    const usage = this.keyUsage.get(apiKey);
    usage.count++;
    usage.lastUse = now;
  }

  /**
   * Middleware para Express
   */
  middleware(options = {}) {
    const { required = false, skipPaths = [] } = options;
    
    return (req, res, next) => {
      // Skip si la ruta está en la lista de exclusión
      if (skipPaths.some(path => req.path.startsWith(path))) {
        return next();
      }
      
      // Obtener API key del header
      const apiKey = req.headers['x-api-key'] 
        || req.headers['authorization']?.replace('Bearer ', '')
        || req.query.apiKey;
      
      // Si no es requerido y no se proporciona, permitir
      if (!required && !apiKey) {
        return next();
      }
      
      // Si es requerido o se proporciona, validar
      const validation = this.validateApiKey(apiKey);
      
      if (!validation.valid) {
        logger.warn('Invalid API key attempt', {
          path: req.path,
          ip: req.ip,
          reason: validation.reason
        });
        
        return res.status(401).json({
          error: 'Unauthorized',
          message: validation.reason || 'Invalid API key',
          code: 'INVALID_API_KEY'
        });
      }
      
      // Agregar info de key a request
      req.apiKey = validation.key;
      req.user = { authenticated: true, apiKey: validation.key };
      
      next();
    };
  }

  /**
   * Agregar API key válida (admin function)
   */
  addApiKey(key, metadata = {}) {
    this.validKeys.add(key);
    logger.info('API key added', { key: key.substring(0, 10) + '...', ...metadata });
    return true;
  }

  /**
   * Remover API key (revocación)
   */
  revokeApiKey(key) {
    const removed = this.validKeys.delete(key);
    if (removed) {
      this.keyUsage.delete(key);
      logger.warn('API key revoked', { key: key.substring(0, 10) + '...' });
    }
    return removed;
  }

  /**
   * Obtener estadísticas de uso
   */
  getUsageStats() {
    return {
      totalKeys: this.validKeys.size,
      activeKeys: this.keyUsage.size,
      usage: Array.from(this.keyUsage.entries()).map(([key, data]) => ({
        key: key.substring(0, 10) + '...',
        count: data.count,
        lastUse: new Date(data.lastUse).toISOString()
      }))
    };
  }
}

// Exportar instancia singleton
const authManager = new AuthManager();

module.exports = { AuthManager, authManager };

