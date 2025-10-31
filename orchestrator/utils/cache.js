/**
 * Sistema de Cache Simple
 * Mejora performance almacenando respuestas frecuentes
 */

class SimpleCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 300000; // 5 minutos por defecto
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Obtener valor del cache
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    // Verificar si expiró
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value;
  }

  /**
   * Guardar valor en cache
   */
  set(key, value, customTTL = null) {
    // Si el cache está lleno, eliminar el más antiguo
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const ttl = customTTL || this.ttl;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    });
  }

  /**
   * Eliminar clave del cache
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Limpiar cache
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Limpiar entradas expiradas
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total * 100).toFixed(2) + '%' : '0%'
    };
  }

  /**
   * Wrapper para funciones async con cache
   */
  async cached(key, fn, ttl = null) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    this.set(key, result, ttl);
    return result;
  }
}

// Cache global para respuestas de IA
const aiResponseCache = new SimpleCache({
  maxSize: 50,
  ttl: 600000 // 10 minutos para respuestas de IA
});

// Cache para prompts del sistema
const systemPromptCache = new SimpleCache({
  maxSize: 20,
  ttl: 3600000 // 1 hora para prompts del sistema
});

module.exports = { SimpleCache, aiResponseCache, systemPromptCache };

