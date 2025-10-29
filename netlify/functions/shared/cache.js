// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - INTELLIGENT CACHE
// In-memory cache with semantic similarity matching
// ═══════════════════════════════════════════════════════════════════

const config = require('./config');
const logger = require('./logger');

class IntelligentCache {
  constructor() {
    this.cache = new Map(); // Map<key, {value, timestamp, hits}>
    this.enabled = config.cache.enabled;
    this.ttl = config.cache.ttl;
    this.maxSize = config.cache.maxSize;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };

    // Cleanup expired entries periodically
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Generate cache key from input
   */
  generateKey(input) {
    if (typeof input === 'string') {
      return this.hashString(input);
    }
    return this.hashString(JSON.stringify(input));
  }

  /**
   * Simple string hash function
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Calculate similarity between two strings (Levenshtein distance based)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance algorithm
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Get value from cache
   */
  get(input) {
    if (!this.enabled) return null;

    const key = this.generateKey(input);
    const entry = this.cache.get(key);

    // Check exact match first
    if (entry && Date.now() - entry.timestamp < this.ttl) {
      entry.hits++;
      this.stats.hits++;
      logger.debug('Cache hit (exact)', { key, hits: entry.hits });
      return entry.value;
    }

    // Try semantic similarity matching for chat messages
    if (typeof input === 'string' && input.length > 10) {
      const similarEntry = this.findSimilar(input);
      if (similarEntry) {
        similarEntry.hits++;
        this.stats.hits++;
        logger.debug('Cache hit (similar)', {
          key,
          hits: similarEntry.hits,
          similarity: similarEntry.similarity
        });
        return similarEntry.value;
      }
    }

    this.stats.misses++;
    logger.debug('Cache miss', { key });
    return null;
  }

  /**
   * Find similar cached entry
   */
  findSimilar(input) {
    const threshold = config.cache.similarityThreshold;
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (Date.now() - entry.timestamp >= this.ttl) continue;

      const similarity = this.calculateSimilarity(
        input.toLowerCase(),
        entry.originalInput?.toLowerCase() || ''
      );

      if (similarity > threshold && similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = { ...entry, similarity };
      }
    }

    return bestMatch;
  }

  /**
   * Set value in cache
   */
  set(input, value) {
    if (!this.enabled) return;

    // Check size limit
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const key = this.generateKey(input);
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
      originalInput: typeof input === 'string' ? input : null
    });

    logger.debug('Cache set', { key, size: this.cache.size });
  }

  /**
   * Evict least recently used entry
   */
  evictLRU() {
    let lruKey = null;
    let lruTime = Infinity;
    let lruHits = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Prioritize entries with fewer hits and older timestamps
      const score = entry.hits * 1000 + entry.timestamp;
      if (score < lruHits * 1000 + lruTime) {
        lruKey = key;
        lruTime = entry.timestamp;
        lruHits = entry.hits;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.stats.evictions++;
      logger.debug('Cache eviction (LRU)', { key: lruKey });
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Cache cleanup completed', {
        cleaned,
        remaining: this.cache.size
      });
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      maxSize: this.maxSize,
      enabled: this.enabled
    };
  }

  /**
   * Destroy cache
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Export singleton instance
const cache = new IntelligentCache();

module.exports = cache;
module.exports.IntelligentCache = IntelligentCache;
