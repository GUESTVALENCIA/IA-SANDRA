/**
 * Logger estructurado para Sandra DevConsole
 * Proporciona logging consistente y filtrable
 */

class Logger {
  constructor(context = 'SANDRA') {
    this.context = context;
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    this.currentLevel = process.env.LOG_LEVEL || 'INFO';
  }

  _shouldLog(level) {
    return this.levels[level] <= this.levels[this.currentLevel];
  }

  _formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...(data && { data })
    };

    // Formato para consola
    const prefix = `[${timestamp}] [${level}] [${this.context}]`;
    
    return { logEntry, prefix };
  }

  error(message, error = null) {
    if (!this._shouldLog('ERROR')) return;
    
    const { logEntry, prefix } = this._formatMessage('ERROR', message, error);
    console.error(`${prefix} ${message}`, error || '');
    
    // Aquí se podría enviar a servicio de logging externo
    return logEntry;
  }

  warn(message, data = null) {
    if (!this._shouldLog('WARN')) return;
    
    const { logEntry, prefix } = this._formatMessage('WARN', message, data);
    console.warn(`${prefix} ${message}`, data || '');
    
    return logEntry;
  }

  info(message, data = null) {
    if (!this._shouldLog('INFO')) return;
    
    const { logEntry, prefix } = this._formatMessage('INFO', message, data);
    console.log(`${prefix} ${message}`, data || '');
    
    return logEntry;
  }

  debug(message, data = null) {
    if (!this._shouldLog('DEBUG')) return;
    
    const { logEntry, prefix } = this._formatMessage('DEBUG', message, data);
    console.log(`${prefix} ${message}`, data || '');
    
    return logEntry;
  }

  // Métodos de conveniencia
  logRequest(method, path, status, duration) {
    this.info(`HTTP ${method} ${path}`, {
      status,
      duration: `${duration}ms`
    });
  }

  logError(error, context = {}) {
    this.error(error.message, {
      ...context,
      stack: error.stack,
      name: error.name
    });
  }

  logPerformance(operation, duration, metadata = {}) {
    if (duration > 1000) {
      this.warn(`Slow operation: ${operation}`, { duration, ...metadata });
    } else {
      this.debug(`Operation: ${operation}`, { duration, ...metadata });
    }
  }
}

// Singleton por contexto
const loggers = new Map();

function getLogger(context = 'SANDRA') {
  if (!loggers.has(context)) {
    loggers.set(context, new Logger(context));
  }
  return loggers.get(context);
}

module.exports = { Logger, getLogger };

