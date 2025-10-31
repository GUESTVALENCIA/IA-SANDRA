/**
 * Tests para sistema de cache
 */

const { SimpleCache } = require('../../orchestrator/utils/cache');

describe('SimpleCache', () => {
  let cache;

  beforeEach(() => {
    cache = new SimpleCache({ maxSize: 10, ttl: 1000 });
  });

  test('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  test('should return null for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  test('should expire entries after TTL', (done) => {
    cache.set('key1', 'value1', 100); // 100ms TTL
    
    setTimeout(() => {
      expect(cache.get('key1')).toBeNull();
      done();
    }, 150);
  });

  test('should respect max size', () => {
    for (let i = 0; i < 15; i++) {
      cache.set(`key${i}`, `value${i}`);
    }
    
    expect(cache.cache.size).toBeLessThanOrEqual(10);
  });

  test('should track hits and misses', () => {
    cache.set('key1', 'value1');
    cache.get('key1');
    cache.get('key2');
    
    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
  });

  test('should clear cache', () => {
    cache.set('key1', 'value1');
    cache.clear();
    expect(cache.get('key1')).toBeNull();
    expect(cache.getStats().size).toBe(0);
  });
});

