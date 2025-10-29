// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - MIDDLEWARE UTILITIES
// Request/Response middleware for Netlify Functions
// ═══════════════════════════════════════════════════════════════════

const config = require('./config');
const logger = require('./logger');
const rateLimiter = require('./rate-limiter');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return uuidv4();
}

/**
 * Create standard headers for response
 */
function createHeaders(additionalHeaders = {}, endpoint = 'global', event = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...config.corsHeaders,
    ...config.securityHeaders,
    ...additionalHeaders
  };

  // Add rate limit headers if event provided
  if (event) {
    const rateLimitHeaders = rateLimiter.getRateLimitHeaders(event, endpoint);
    Object.assign(headers, rateLimitHeaders);
  }

  return headers;
}

/**
 * Handle OPTIONS (CORS preflight)
 */
function handleOptions() {
  return {
    statusCode: 200,
    headers: createHeaders(),
    body: ''
  };
}

/**
 * Create error response
 */
function createErrorResponse(error, statusCode = 500, locale = 'es') {
  const errorMessages = config.errorMessages[locale] || config.errorMessages.es;

  let message = errorMessages.serverError;
  let code = statusCode;

  // Map error types to status codes and messages
  if (error.message?.includes('rate limit')) {
    code = 429;
    message = errorMessages.rateLimit;
  } else if (error.message?.includes('invalid') || error.message?.includes('required')) {
    code = 400;
    message = errorMessages.invalidInput;
  } else if (error.message?.includes('timeout')) {
    code = 408;
    message = errorMessages.timeout;
  } else if (error.message?.includes('unauthorized') || error.message?.includes('auth')) {
    code = 401;
    message = errorMessages.unauthorized;
  } else if (error.message?.includes('not found')) {
    code = 404;
    message = errorMessages.notFound;
  }

  return {
    statusCode: code,
    headers: createHeaders(),
    body: JSON.stringify({
      error: message,
      code,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    })
  };
}

/**
 * Create success response
 */
function createSuccessResponse(data, statusCode = 200, additionalHeaders = {}) {
  return {
    statusCode,
    headers: createHeaders(additionalHeaders),
    body: JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  };
}

/**
 * Validate HTTP method
 */
function validateMethod(event, allowedMethods = ['POST']) {
  if (event.httpMethod === 'OPTIONS') {
    return { valid: true, response: handleOptions() };
  }

  if (!allowedMethods.includes(event.httpMethod)) {
    return {
      valid: false,
      response: {
        statusCode: 405,
        headers: createHeaders(),
        body: JSON.stringify({
          error: config.errorMessages.es.methodNotAllowed,
          allowed: allowedMethods
        })
      }
    };
  }

  return { valid: true };
}

/**
 * Parse request body safely
 */
function parseBody(event) {
  try {
    if (!event.body) return {};
    return JSON.parse(event.body);
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Validate required fields
 */
function validateRequired(body, requiredFields = []) {
  const missing = requiredFields.filter(field => !body[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Sanitize input to prevent injection attacks
 */
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .trim()
      .substring(0, 10000); // Limit length
  }
  return input;
}

/**
 * Apply rate limiting
 */
function applyRateLimit(event, endpoint = 'global') {
  if (rateLimiter.isRateLimited(event, endpoint)) {
    throw new Error('Rate limit exceeded');
  }
}

/**
 * Middleware wrapper for Netlify Functions
 */
function withMiddleware(handler, options = {}) {
  const {
    endpoint = 'global',
    methods = ['POST'],
    requiredFields = [],
    rateLimit = true,
    logging = true
  } = options;

  return async (event, context) => {
    const requestId = generateRequestId();
    const startTime = Date.now();

    try {
      // Create request logger
      const requestLogger = logger.child({ requestId, endpoint });

      if (logging) {
        requestLogger.info('Request received', {
          method: event.httpMethod,
          path: event.path
        });
      }

      // Validate HTTP method
      const methodValidation = validateMethod(event, methods);
      if (!methodValidation.valid) {
        return methodValidation.response;
      }
      if (event.httpMethod === 'OPTIONS') {
        return methodValidation.response;
      }

      // Apply rate limiting
      if (rateLimit) {
        applyRateLimit(event, endpoint);
      }

      // Parse and validate body
      const body = parseBody(event);
      validateRequired(body, requiredFields);

      // Sanitize inputs
      Object.keys(body).forEach(key => {
        body[key] = sanitizeInput(body[key]);
      });

      // Call actual handler
      const response = await handler(event, context, { requestId, body, logger: requestLogger });

      // Add request tracking headers
      if (response.headers) {
        response.headers['X-Request-ID'] = requestId;
        response.headers['X-Response-Time'] = `${Date.now() - startTime}ms`;
      }

      if (logging) {
        requestLogger.logRequest(event, response, {
          duration: Date.now() - startTime
        });
      }

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('Request failed', {
        requestId,
        endpoint,
        error: error.message,
        duration
      });

      const errorResponse = createErrorResponse(error);
      errorResponse.headers['X-Request-ID'] = requestId;
      errorResponse.headers['X-Response-Time'] = `${duration}ms`;

      return errorResponse;
    }
  };
}

module.exports = {
  generateRequestId,
  createHeaders,
  handleOptions,
  createErrorResponse,
  createSuccessResponse,
  validateMethod,
  parseBody,
  validateRequired,
  sanitizeInput,
  applyRateLimit,
  withMiddleware
};
