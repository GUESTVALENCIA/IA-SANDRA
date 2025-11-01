// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - MIDDLEWARE UTILITIES (Vercel Version)
// Request/Response middleware for Vercel Serverless Functions
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
function createHeaders(additionalHeaders = {}, endpoint = 'global', req = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...config.corsHeaders,
    ...config.securityHeaders,
    ...additionalHeaders
  };

  // Add rate limit headers if req provided
  if (req) {
    // Adapt rate limiter for Vercel (simplified)
    // In Vercel, we can use req.headers['x-forwarded-for'] for IP
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     'unknown';
    
    // Simplified rate limit headers
    headers['X-RateLimit-Limit'] = '10';
    headers['X-RateLimit-Window'] = '60';
  }

  return headers;
}

/**
 * Handle OPTIONS (CORS preflight)
 */
function handleOptions(req, res) {
  const headers = createHeaders();
  Object.keys(headers).forEach(key => {
    res.setHeader(key, headers[key]);
  });
  res.status(200).end();
}

/**
 * Create error response
 */
function createErrorResponse(error, includeStack = false) {
  return {
    success: false,
    error: error.message || 'Internal server error',
    ...(includeStack && { stack: error.stack })
  };
}

/**
 * Create success response
 */
function createSuccessResponse(data) {
  return {
    success: true,
    ...data
  };
}

/**
 * Main middleware wrapper for Vercel
 */
function withMiddleware(handler, options = {}) {
  const {
    endpoint = 'unknown',
    methods = ['GET', 'POST'],
    requiredFields = [],
    rateLimit = true,
    logging = true
  } = options;

  return async function(req, res) {
    const startTime = Date.now();
    const requestId = generateRequestId();

    // Parse body if string
    if (typeof req.body === 'string' && req.body) {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {
        // Body is not JSON, keep as string
      }
    }

    // Log request
    if (logging) {
      logger.info('Request received', {
        requestId,
        endpoint,
        method: req.method,
        path: req.url
      });
    }

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return handleOptions(req, res);
    }

    // Check method
    if (!methods.includes(req.method)) {
      const headers = createHeaders();
      Object.keys(headers).forEach(key => {
        res.setHeader(key, headers[key]);
      });
      res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed. Allowed: ${methods.join(', ')}`
      });
      return;
    }

    // Rate limiting
    if (rateLimit) {
      const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                       req.headers['x-real-ip'] || 
                       'unknown';
      
      // Simple rate limit check (in production, use Redis)
      // For now, we'll skip rate limiting in Vercel or implement simple check
      // TODO: Implement proper rate limiting with Redis or Vercel Edge Config
    }

    // Validate required fields
    if (requiredFields.length > 0 && req.method === 'POST') {
      const missing = requiredFields.filter(field => !req.body || !req.body[field]);
      if (missing.length > 0) {
        const headers = createHeaders();
        Object.keys(headers).forEach(key => {
          res.setHeader(key, headers[key]);
        });
        res.status(400).json({
          success: false,
          error: `Missing required fields: ${missing.join(', ')}`
        });
        return;
      }
    }

    // Set headers
    const headers = createHeaders({}, endpoint, req);
    Object.keys(headers).forEach(key => {
      res.setHeader(key, headers[key]);
    });

    // Call handler with context
    try {
      const context = {
        requestId,
        body: req.body,
        query: req.query,
        headers: req.headers,
        method: req.method,
        url: req.url,
        logger: logger.child({ requestId, endpoint })
      };

      const result = await handler(req, res, context);

      // If handler returns data (not using res directly), send it
      if (result && !res.headersSent) {
        if (result.success !== undefined) {
          res.json(result);
        } else {
          res.json(createSuccessResponse(result));
        }
      }

      // Log response
      if (logging) {
        const duration = Date.now() - startTime;
        logger.info('Request completed', {
          requestId,
          endpoint,
          method: req.method,
          duration: `${duration}ms`,
          status: res.statusCode || 200
        });
      }
    } catch (error) {
      logger.error('Request failed', {
        requestId,
        endpoint,
        error: error.message,
        stack: error.stack
      });

      if (!res.headersSent) {
        res.status(500).json(createErrorResponse(error, process.env.NODE_ENV !== 'production'));
      }
    }
  };
}

module.exports = {
  withMiddleware,
  createSuccessResponse,
  createErrorResponse,
  handleOptions,
  createHeaders,
  generateRequestId
};

