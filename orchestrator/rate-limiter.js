/**
 * Rate Limiter para Protección contra Abuso
 * Implementa rate limiting por IP y por usuario
 */

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minuto por defecto
    this.maxRequests = options.maxRequests || 100; // 100 requests por ventana
    this.store = new Map(); // En producción usar Redis
    
    // Configuración por ruta - ESTRICTA para prevenir abuso
    this.limits = {
      '/api/chat': { windowMs: 60000, maxRequests: 10 }, // 10 requests/min (más estricto)
      '/api/tts': { windowMs: 60000, maxRequests: 20 }, // 20 requests/min
      '/api/stt': { windowMs: 60000, maxRequests: 20 }, // 20 requests/min
      '/api/voice-command': { windowMs: 60000, maxRequests: 10 }, // 10 requests/min
      '/api/ai-voice-command': { windowMs: 60000, maxRequests: 10 },
      '/api/voice-programming': { windowMs: 60000, maxRequests: 5 }, // 5 requests/min (muy costoso)
      '/health': { windowMs: 60000, maxRequests: 60 }, // 60 requests/min (menos restrictivo)
      '/metrics': { windowMs: 60000, maxRequests: 10 }, // 10 requests/min
      default: { windowMs: 60000, maxRequests: 30 } // 30 requests/min por defecto
    };
    
    // Limpiar entradas viejas cada 5 minutos
    setInterval(() => this.cleanup(), 300000);
  }

  /**
   * Obtener identificador del cliente
   */
  getClientId(req) {
    // Prioridad: API key > User ID > IP
    return req.headers['x-api-key'] 
      || req.user?.id 
      || req.ip 
      || req.connection?.remoteAddress 
      || 'unknown';
  }

  /**
   * Obtener límite para una ruta específica
   */
  getLimitForRoute(path) {
    return this.limits[path] || this.limits.default;
  }

  /**
   * Verificar si el request está dentro del límite
   */
  checkLimit(req) {
    const clientId = this.getClientId(req);
    const route = req.path || req.url;
    const limit = this.getLimitForRoute(route);
    
    const key = `${clientId}:${route}`;
    const now = Date.now();
    
    // Obtener o crear registro
    if (!this.store.has(key)) {
      this.store.set(key, {
        count: 0,
        resetTime: now + limit.windowMs,
        firstRequest: now
      });
    }
    
    const record = this.store.get(key);
    
    // Si la ventana expiró, resetear
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + limit.windowMs;
      record.firstRequest = now;
    }
    
    // Incrementar contador
    record.count++;
    
    // Verificar límite
    if (record.count > limit.maxRequests) {
      return {
        allowed: false,
        limit: limit.maxRequests,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      };
    }
    
    return {
      allowed: true,
      limit: limit.maxRequests,
      remaining: limit.maxRequests - record.count,
      resetTime: record.resetTime
    };
  }

  /**
   * Middleware para Express
   */
  middleware() {
    return (req, res, next) => {
      const result = this.checkLimit(req);
      
      // Agregar headers de rate limit
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      
      if (!result.allowed) {
        res.setHeader('Retry-After', result.retryAfter);
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Max ${result.limit} requests per ${Math.floor(this.windowMs / 1000)} seconds.`,
          retryAfter: result.retryAfter
        });
      }
      
      next();
    };
  }

  /**
   * Limpiar registros expirados
   */
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime + 300000) { // Limpiar después de 5 min de expiración
        this.store.delete(key);
      }
    }
  }

  /**
   * Resetear límite para un cliente (admin function)
   */
  reset(clientId, route = null) {
    if (route) {
      this.store.delete(`${clientId}:${route}`);
    } else {
      // Resetear todos los límites para este cliente
      for (const key of this.store.keys()) {
        if (key.startsWith(`${clientId}:`)) {
          this.store.delete(key);
        }
      }
    }
  }

  /**
   * Obtener estadísticas de rate limiting
   */
  getStats() {
    const stats = {
      totalClients: new Set(),
      activeLimits: this.store.size,
      topRoutes: {}
    };
    
    for (const [key] of this.store.entries()) {
      const [clientId, route] = key.split(':');
      stats.totalClients.add(clientId);
      
      if (!stats.topRoutes[route]) {
        stats.topRoutes[route] = 0;
      }
      stats.topRoutes[route]++;
    }
    
    stats.totalClients = stats.totalClients.size;
    
    return stats;
  }
}

// Exportar instancia singleton
const rateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minuto
  maxRequests: 100 // 100 requests por minuto por defecto
});

module.exports = { RateLimiter, rateLimiter };

