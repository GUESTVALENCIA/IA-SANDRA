/**
 * Simple In-Memory Cache para Netlify Functions
 * Para producción usar Redis, pero esto funciona para empezar
 */

class SimpleCache {
  constructor(maxSize = 100, ttl = 300000) { // 5 minutos default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = ttl;
  }

  _isExpired(entry) {
    return Date.now() > entry.expiresAt;
  }

  _cleanup() {
    // Limpiar entradas expiradas
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }

    // Si aún hay demasiadas entradas, eliminar las más viejas
    if (this.cache.size > this.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].createdAt - b[1].createdAt);
      
      const toDelete = this.cache.size - this.maxSize;
      for (let i = 0; i < toDelete; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (this._isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key, value, ttl = null) {
    this._cleanup();

    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    this.cache.set(key, {
      value,
      createdAt: now,
      expiresAt,
    });

    return true;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  // Helper para cachear resultados de funciones async
  async getOrSet(key, fn, ttl = null) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fn();
    this.set(key, value, ttl);
    return value;
  }
}

// Singleton instance
const cacheInstance = new SimpleCache(100, 300000); // 100 entries, 5 min TTL

module.exports = cacheInstance;
module.exports.SimpleCache = SimpleCache;

