/**
 * Logger estructurado para Sandra DevConsole
 * Soporta diferentes niveles y formato JSON para producción
 */

class Logger {
  constructor(options = {}) {
    this.level = options.level || (process.env.LOG_LEVEL || 'info');
    this.enableJSON = options.json || process.env.NODE_ENV === 'production';
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    
    if (this.enableJSON) {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        ...meta
      });
    }
    
    // Formato legible para desarrollo
    const metaStr = Object.keys(meta).length > 0 
      ? ` ${JSON.stringify(meta)}` 
      : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  error(message, meta = {}) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  info(message, meta = {}) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  // Métodos helper específicos
  request(req, res, responseTime) {
    this.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.connection.remoteAddress
    });
  }

  errorHandler(error, context = {}) {
    this.error('Error occurred', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  serviceStatus(service, status, details = {}) {
    this.info(`Service ${status}`, {
      service,
      ...details
    });
  }
}

// Exportar instancia singleton
const logger = new Logger({
  level: process.env.LOG_LEVEL || 'info',
  json: process.env.NODE_ENV === 'production'
});

module.exports = { Logger, logger };

