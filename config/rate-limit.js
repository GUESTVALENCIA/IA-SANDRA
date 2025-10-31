// API Rate Limiting Configuration
module.exports = {
  // Global rate limits
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Strict limits for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5, // Max 5 auth attempts per 15 minutes
    skipSuccessfulRequests: false
  },

  // API endpoints
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Max 30 API calls per minute
    keyGenerator: (req) => {
      // Use API key if provided, otherwise IP
      return req.headers['x-api-key'] || req.ip;
    }
  },

  // AI service endpoints (expensive operations)
  ai: {
    windowMs: 1 * 60 * 1000,
    max: 10, // Max 10 AI calls per minute
    skipFailedRequests: false
  },

  // File upload endpoints
  upload: {
    windowMs: 15 * 60 * 1000,
    max: 10, // Max 10 uploads per 15 minutes
    skipFailedRequests: false
  }
};
