// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - RATE LIMITER
// In-memory rate limiting with IP tracking
// ═══════════════════════════════════════════════════════════════════

const config = require('./config');
const logger = require('./logger');

class RateLimiter {
  constructor() {
    this.requests = new Map(); // Map<IP, Array<timestamp>>
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  /**
   * Get client identifier from event
   */
  getClientId(event) {
    // Try to get real IP from headers (Netlify provides this)
    const forwardedFor = event.headers['x-forwarded-for'];
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    // Fallback to other headers
    return (
      event.headers['x-real-ip'] ||
      event.headers['client-ip'] ||
      event.requestContext?.identity?.sourceIp ||
      'unknown'
    );
  }

  /**
   * Check if request should be rate limited
   */
  isRateLimited(event, endpoint = 'global') {
    const clientId = this.getClientId(event);
    const now = Date.now();

    // Get rate limit config for endpoint
    const limits = config.rateLimits[endpoint] || config.rateLimits.global;
    const { windowMs, maxRequests } = limits;

    // Get or create request history for this client
    if (!this.requests.has(clientId)) {
      this.requests.set(clientId, []);
    }

    const requestHistory = this.requests.get(clientId);

    // Remove old requests outside the time window
    const validRequests = requestHistory.filter(timestamp => now - timestamp < windowMs);
    this.requests.set(clientId, validRequests);

    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      logger.warn('Rate limit exceeded', {
        clientId,
        endpoint,
        requests: validRequests.length,
        limit: maxRequests
      });
      return true;
    }

    // Add current request to history
    validRequests.push(now);
    this.requests.set(clientId, validRequests);

    return false;
  }

  /**
   * Get rate limit info for response headers
   */
  getRateLimitHeaders(event, endpoint = 'global') {
    const clientId = this.getClientId(event);
    const limits = config.rateLimits[endpoint] || config.rateLimits.global;
    const { maxRequests, windowMs } = limits;

    const requestHistory = this.requests.get(clientId) || [];
    const now = Date.now();
    const validRequests = requestHistory.filter(timestamp => now - timestamp < windowMs);

    const remaining = Math.max(0, maxRequests - validRequests.length);
    const resetTime = validRequests.length > 0
      ? Math.ceil((validRequests[0] + windowMs) / 1000)
      : Math.ceil((now + windowMs) / 1000);

    return {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString(),
      'X-RateLimit-Window': (windowMs / 1000).toString()
    };
  }

  /**
   * Cleanup old entries
   */
  cleanup() {
    const now = Date.now();
    const maxWindow = Math.max(
      ...Object.values(config.rateLimits).map(limit => limit.windowMs)
    );

    for (const [clientId, requestHistory] of this.requests.entries()) {
      const validRequests = requestHistory.filter(
        timestamp => now - timestamp < maxWindow
      );

      if (validRequests.length === 0) {
        this.requests.delete(clientId);
      } else {
        this.requests.set(clientId, validRequests);
      }
    }

    logger.debug('Rate limiter cleanup completed', {
      activeClients: this.requests.size
    });
  }

  /**
   * Reset rate limit for a client
   */
  reset(clientId) {
    this.requests.delete(clientId);
    logger.info('Rate limit reset', { clientId });
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      activeClients: this.requests.size,
      totalRequests: Array.from(this.requests.values())
        .reduce((sum, history) => sum + history.length, 0)
    };
  }

  /**
   * Destroy rate limiter
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

// Export singleton instance
const rateLimiter = new RateLimiter();

module.exports = rateLimiter;
module.exports.RateLimiter = RateLimiter;
