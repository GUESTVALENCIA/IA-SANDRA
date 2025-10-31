/**
 * Resilient AI Client
 * SOLUCIÓN COMPLETA a CASCADE #2 y CASCADE #5
 * Implementa Multi-Layer Fallback, Circuit Breakers, Retry Logic
 */

class ResilientAIClient {
  constructor() {
    this.providers = {
      primary: {
        name: 'netlify-functions',
        endpoint: '/.netlify/functions/chat',
        circuitBreaker: new CircuitBreaker({ threshold: 5, timeout: 60000 })
      },
      fallback1: {
        name: 'netlify-functions-resilient',
        endpoint: '/.netlify/functions/chat-resilient',
        circuitBreaker: new CircuitBreaker({ threshold: 3, timeout: 30000 })
      },
      fallback2: {
        name: 'cached-responses',
        cache: new Map(),
        maxCacheSize: 100,
        circuitBreaker: new CircuitBreaker({ threshold: 1, timeout: 5000 })
      },
      fallback3: {
        name: 'offline-mode',
        responses: [
          "Lo siento, estoy experimentando dificultades técnicas. Por favor intenta de nuevo en unos momentos.",
          "No puedo conectarme a los servicios AI en este momento. ¿Puedes reformular tu pregunta?",
          "Disculpa, hay un problema temporal con los servicios. Intenta nuevamente en breve."
        ]
      }
    };

    this.metrics = {
      requests: 0,
      successes: 0,
      failures: 0,
      fallbacks: 0,
      recoveries: 0,
      cacheHits: 0
    };

    // Rate Limiting
    this.rateLimiter = {
      requests: [],
      maxRequests: 20,
      windowMs: 60000 // 1 minuto
    };
  }

  /**
   * Chat method con multi-layer fallback
   */
  async chat(message, options = {}) {
    // Rate Limiting Check
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
    }

    this.metrics.requests++;

    // LAYER 1: Try Netlify Function (PRIMARY)
    try {
      if (this.providers.primary.circuitBreaker.isOpen()) {
        console.warn('[Circuit Breaker] Primary is OPEN, skipping to fallback');
        throw new Error('Circuit breaker open');
      }

      const response = await this.retryWithBackoff(
        () => fetch(this.providers.primary.endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ message, ...options }),
          signal: AbortSignal.timeout(10000)  // 10s timeout
        }),
        3  // 3 retries
      );

      if (!response.ok) {
        this.providers.primary.circuitBreaker.recordFailure();
        throw new Error(`API error: ${response.status}`);
      }

      this.providers.primary.circuitBreaker.recordSuccess();
      this.metrics.successes++;

      const data = await response.json();

      // Cache successful response
      this.cacheResponse(message, data.text || data.response);

      return {
        text: data.text || data.response || data.message,
        success: true,
        source: 'primary-netlify-function',
        latency: data.latency || 'unknown',
        model: data.model || 'gpt-4o'
      };

    } catch (primaryError) {
      console.error('[Primary Failed]:', primaryError);
      this.metrics.fallbacks++;

      // LAYER 2: Try Resilient Function (FALLBACK)
      try {
        if (this.providers.fallback1.circuitBreaker.isOpen()) {
          throw new Error('Fallback1 circuit breaker open');
        }

        const response = await this.retryWithBackoff(
          () => fetch(this.providers.fallback1.endpoint, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ message, ...options }),
            signal: AbortSignal.timeout(8000)
          }),
          2  // 2 retries
        );

        if (!response.ok) {
          this.providers.fallback1.circuitBreaker.recordFailure();
          throw new Error(`API error: ${response.status}`);
        }

        this.providers.fallback1.circuitBreaker.recordSuccess();
        this.metrics.recoveries++;

        const data = await response.json();

        // Cache successful response
        this.cacheResponse(message, data.text || data.response);

        return {
          text: data.text || data.response,
          success: true,
          source: 'fallback1-resilient-function',
          latency: data.latency || 'unknown',
          cached: false
        };

      } catch (fallback1Error) {
        console.error('[Fallback1 Failed]:', fallback1Error);
        this.providers.fallback1.circuitBreaker.recordFailure();

        // LAYER 3: Try Cache
        try {
          const cachedResponse = this.getCachedResponse(message);
          if (cachedResponse) {
            console.info('[Cache Hit] Serving cached response');
            this.metrics.cacheHits++;
            this.metrics.recoveries++;
            return {
              text: cachedResponse,
              success: true,
              source: 'fallback2-cache',
              cached: true
            };
          }

          // Check for similar cached queries
          const similarQuery = this.findSimilarCachedQuery(message);
          if (similarQuery) {
            console.info('[Similar Cache Hit] Serving similar cached response');
            this.metrics.cacheHits++;
            this.metrics.recoveries++;
            return {
              text: this.providers.fallback2.cache.get(similarQuery),
              success: true,
              source: 'fallback2-cache-similar',
              cached: true,
              note: 'Respuesta basada en consulta similar'
            };
          }

          throw new Error('No cache available');

        } catch (fallback2Error) {
          console.error('[Fallback2 Failed]:', fallback2Error);

          // LAYER 4: Offline Mode (GUARANTEED SUCCESS)
          console.info('[Offline Mode] Serving static response');
          this.metrics.failures++;

          return {
            text: this.providers.fallback3.responses[
              Math.floor(Math.random() * this.providers.fallback3.responses.length)
            ],
            success: false,
            source: 'fallback3-offline',
            offline: true
          };
        }
      }
    }
  }

  /**
   * Retry con exponential backoff
   */
  async retryWithBackoff(fn, maxRetries, initialDelay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;

        const delay = Math.min(initialDelay * Math.pow(2, i), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Cache management
   */
  cacheResponse(query, response) {
    if (this.providers.fallback2.cache.size >= this.providers.fallback2.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.providers.fallback2.cache.keys().next().value;
      this.providers.fallback2.cache.delete(firstKey);
    }
    this.providers.fallback2.cache.set(query.toLowerCase().trim(), response);
  }

  getCachedResponse(query) {
    return this.providers.fallback2.cache.get(query.toLowerCase().trim());
  }

  findSimilarCachedQuery(query) {
    const queries = Array.from(this.providers.fallback2.cache.keys());
    const queryLower = query.toLowerCase();
    const queryWords = new Set(queryLower.split(' '));

    for (const cachedQuery of queries) {
      const similarity = this.calculateSimilarity(queryWords, cachedQuery.split(' '));
      if (similarity > 0.6) { // 60% similarity threshold
        return cachedQuery;
      }
    }
    return null;
  }

  calculateSimilarity(words1, words2) {
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  /**
   * Rate limiting check
   */
  checkRateLimit() {
    const now = Date.now();
    // Remove old requests
    this.rateLimiter.requests = this.rateLimiter.requests.filter(
      time => now - time < this.rateLimiter.windowMs
    );

    if (this.rateLimiter.requests.length >= this.rateLimiter.maxRequests) {
      return false;
    }

    this.rateLimiter.requests.push(now);
    return true;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    const totalRequests = this.metrics.requests || 1;
    return {
      ...this.metrics,
      successRate: ((this.metrics.successes / totalRequests) * 100).toFixed(2) + '%',
      recoveryRate: this.metrics.fallbacks > 0 
        ? ((this.metrics.recoveries / this.metrics.fallbacks) * 100).toFixed(2) + '%'
        : '0%',
      cacheHitRate: totalRequests > 0
        ? ((this.metrics.cacheHits / totalRequests) * 100).toFixed(2) + '%'
        : '0%',
      circuitBreakerStates: {
        primary: this.providers.primary.circuitBreaker.getState(),
        fallback1: this.providers.fallback1.circuitBreaker.getState()
      }
    };
  }
}

/**
 * Circuit Breaker Implementation
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.threshold = options.threshold || 5;
    this.timeout = options.timeout || 60000;  // 1 minute
    this.state = 'CLOSED';  // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
  }

  recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      console.warn(`[Circuit Breaker] ${this.constructor.name} OPENED after ${this.failures} failures`);

      // Auto-recovery: try half-open after timeout
      setTimeout(() => {
        this.state = 'HALF_OPEN';
        console.info(`[Circuit Breaker] ${this.constructor.name} entering HALF_OPEN state`);
      }, this.timeout);
    }
  }

  recordSuccess() {
    this.successes++;

    if (this.state === 'HALF_OPEN') {
      // Success in half-open → close circuit
      this.state = 'CLOSED';
      this.failures = 0;
      console.info(`[Circuit Breaker] ${this.constructor.name} CLOSED after successful recovery`);
    }
  }

  isOpen() {
    return this.state === 'OPEN';
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.resilientAI = new ResilientAIClient();
  console.log('[Resilient AI Client] Initialized with multi-layer fallback');
}

