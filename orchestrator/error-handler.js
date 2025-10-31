/**
 * Error Handler Centralizado para Producción
 * Maneja errores de forma consistente y segura
 */

const { logger } = require('./logger');

class ErrorHandler {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Formatear error para respuesta HTTP
   */
  formatError(error, includeStack = false) {
    const formatted = {
      error: true,
      message: error.message || 'An error occurred',
      timestamp: new Date().toISOString()
    };

    // En producción, no exponer detalles del error
    if (this.isProduction) {
      formatted.message = 'Internal server error';
    } else {
      // En desarrollo, incluir más detalles
      if (includeStack) {
        formatted.stack = error.stack;
      }
      if (error.code) {
        formatted.code = error.code;
      }
      if (error.statusCode) {
        formatted.statusCode = error.statusCode;
      }
    }

    return formatted;
  }

  /**
   * Handler para Express middleware
   */
  expressHandler(error, req, res, next) {
    // Log del error
    logger.errorHandler(error, {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Determinar status code
    const statusCode = error.statusCode || error.status || 500;

    // Responder
    res.status(statusCode).json(this.formatError(error, !this.isProduction));
  }

  /**
   * Wrapper async para rutas Express
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Handler para errores de API
   */
  apiError(message, statusCode = 500, code = null) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
  }

  /**
   * Validar y manejar errores de validación
   */
  validationError(field, message) {
    const error = this.apiError(`Validation error: ${message}`, 400, 'VALIDATION_ERROR');
    error.field = field;
    return error;
  }

  /**
   * Handler para errores de autenticación
   */
  authenticationError(message = 'Authentication required') {
    return this.apiError(message, 401, 'AUTHENTICATION_ERROR');
  }

  /**
   * Handler para errores de autorización
   */
  authorizationError(message = 'Insufficient permissions') {
    return this.apiError(message, 403, 'AUTHORIZATION_ERROR');
  }

  /**
   * Handler para errores de recurso no encontrado
   */
  notFoundError(resource = 'Resource') {
    return this.apiError(`${resource} not found`, 404, 'NOT_FOUND');
  }

  /**
   * Handler para errores de rate limit
   */
  rateLimitError(message = 'Too many requests') {
    return this.apiError(message, 429, 'RATE_LIMIT_ERROR');
  }

  /**
   * Handler para errores de servicio externo
   */
  externalServiceError(service, message) {
    const error = this.apiError(
      `External service error: ${service} - ${message}`,
      502,
      'EXTERNAL_SERVICE_ERROR'
    );
    error.service = service;
    return error;
  }
}

// Exportar instancia singleton
const errorHandler = new ErrorHandler();

module.exports = { ErrorHandler, errorHandler };

