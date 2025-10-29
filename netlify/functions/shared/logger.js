// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - STRUCTURED LOGGER
// Enterprise-grade logging with request tracking
// ═══════════════════════════════════════════════════════════════════

const config = require('./config');

class Logger {
  constructor() {
    this.level = config.logging.level;
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  /**
   * Format log entry with metadata
   */
  format(level, message, meta = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    };

    // Add request ID if available
    if (meta.requestId) {
      entry.requestId = meta.requestId;
    }

    // Add error stack if present
    if (meta.error instanceof Error) {
      entry.error = {
        message: meta.error.message,
        stack: meta.error.stack,
        name: meta.error.name
      };
    }

    return entry;
  }

  /**
   * Check if log level should be output
   */
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }

  /**
   * Output log entry
   */
  output(entry) {
    const env = process.env.NODE_ENV || 'production';

    if (env === 'development' || config.logging.formats.development === 'pretty') {
      // Pretty print for development
      console.log(
        `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`,
        Object.keys(entry).length > 3 ? JSON.stringify(entry, null, 2) : ''
      );
    } else {
      // JSON for production (easier to parse)
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Log error message
   */
  error(message, meta = {}) {
    if (this.shouldLog('error')) {
      this.output(this.format('error', message, meta));
    }
  }

  /**
   * Log warning message
   */
  warn(message, meta = {}) {
    if (this.shouldLog('warn')) {
      this.output(this.format('warn', message, meta));
    }
  }

  /**
   * Log info message
   */
  info(message, meta = {}) {
    if (this.shouldLog('info')) {
      this.output(this.format('info', message, meta));
    }
  }

  /**
   * Log debug message
   */
  debug(message, meta = {}) {
    if (this.shouldLog('debug')) {
      this.output(this.format('debug', message, meta));
    }
  }

  /**
   * Create child logger with default metadata
   */
  child(meta = {}) {
    const childLogger = new Logger();
    childLogger.defaultMeta = meta;

    // Override methods to include default meta
    const originalMethods = ['error', 'warn', 'info', 'debug'];
    originalMethods.forEach(method => {
      const original = childLogger[method].bind(childLogger);
      childLogger[method] = (message, additionalMeta = {}) => {
        original(message, { ...meta, ...additionalMeta });
      };
    });

    return childLogger;
  }

  /**
   * Log function execution with timing
   */
  async logExecution(fnName, fn, meta = {}) {
    const startTime = Date.now();
    this.info(`Starting ${fnName}`, meta);

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.info(`Completed ${fnName}`, { ...meta, duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`Failed ${fnName}`, { ...meta, error, duration: `${duration}ms` });
      throw error;
    }
  }

  /**
   * Log HTTP request/response
   */
  logRequest(event, response, meta = {}) {
    const logEntry = {
      method: event.httpMethod,
      path: event.path,
      statusCode: response.statusCode,
      ...meta
    };

    if (response.statusCode >= 500) {
      this.error('HTTP Request Failed', logEntry);
    } else if (response.statusCode >= 400) {
      this.warn('HTTP Request Warning', logEntry);
    } else {
      this.info('HTTP Request Success', logEntry);
    }
  }
}

// Export singleton instance
const logger = new Logger();

module.exports = logger;
module.exports.Logger = Logger;
