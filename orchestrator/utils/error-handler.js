/**
 * Error Handler Centralizado
 * Manejo consistente de errores en toda la aplicación
 */

const { getLogger } = require('./logger');

class ErrorHandler {
  constructor() {
    this.logger = getLogger('ERROR-HANDLER');
    this.errorCounts = new Map();
  }

  /**
   * Manejar error de forma estándar
   */
  handle(error, context = {}) {
    const errorId = this.generateErrorId();
    const errorInfo = {
      id: errorId,
      message: error.message,
      name: error.name,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      count: this.incrementErrorCount(error.name)
    };

    // Log error
    this.logger.error(`[${errorId}] ${error.message}`, errorInfo);

    // Categorizar error
    const category = this.categorizeError(error);
    errorInfo.category = category;

    // Retornar respuesta estructurada
    return {
      success: false,
      error: {
        id: errorId,
        message: this.getUserFriendlyMessage(error, category),
        category,
        details: process.env.NODE_ENV === 'development' ? errorInfo : undefined
      },
      timestamp: errorInfo.timestamp
    };
  }

  /**
   * Categorizar error por tipo
   */
  categorizeError(error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return 'NETWORK_ERROR';
    }
    if (error.response?.status === 401 || error.message.includes('API Key')) {
      return 'AUTHENTICATION_ERROR';
    }
    if (error.response?.status === 429) {
      return 'RATE_LIMIT_ERROR';
    }
    if (error.response?.status >= 500) {
      return 'SERVER_ERROR';
    }
    if (error.message.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    if (error.message.includes('syntax') || error.message.includes('parse')) {
      return 'SYNTAX_ERROR';
    }
    return 'UNKNOWN_ERROR';
  }

  /**
   * Obtener mensaje amigable para el usuario
   */
  getUserFriendlyMessage(error, category) {
    const messages = {
      NETWORK_ERROR: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
      AUTHENTICATION_ERROR: 'Error de autenticación. Verifica tu configuración de API keys.',
      RATE_LIMIT_ERROR: 'Límite de solicitudes excedido. Intenta más tarde.',
      SERVER_ERROR: 'Error del servidor. Nuestro equipo ha sido notificado.',
      TIMEOUT_ERROR: 'La solicitud tardó demasiado. Intenta de nuevo.',
      SYNTAX_ERROR: 'Error en el código generado. Se creará un reporte.',
      UNKNOWN_ERROR: 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
    };

    return messages[category] || messages.UNKNOWN_ERROR;
  }

  /**
   * Generar ID único para el error
   */
  generateErrorId() {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Incrementar contador de errores
   */
  incrementErrorCount(errorName) {
    const current = this.errorCounts.get(errorName) || 0;
    const newCount = current + 1;
    this.errorCounts.set(errorName, newCount);
    
    // Alertar si hay muchos errores del mismo tipo
    if (newCount > 10) {
      this.logger.warn(`Many errors of type ${errorName}: ${newCount}`);
    }
    
    return newCount;
  }

  /**
   * Wrap async function con manejo de errores
   */
  wrapAsync(fn) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        return this.handle(error, { function: fn.name, args: args.length });
      }
    };
  }

  /**
   * Obtener estadísticas de errores
   */
  getErrorStats() {
    return {
      totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
      errorCounts: Object.fromEntries(this.errorCounts),
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton
const errorHandler = new ErrorHandler();

module.exports = { ErrorHandler, errorHandler };

