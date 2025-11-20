/**
 * Tests para Bright Data Cache
 * Verifica que el cache funciona correctamente con TTL de 30s
 */

const BrightDataService = require('../services/bright-data-service');

describe('Bright Data Cache', () => {
  let brightDataService;

  beforeEach(() => {
    // Mock de BRIGHTDATA_API_KEY si no existe
    if (!process.env.BRIGHT_DATA_AUTH) {
      process.env.BRIGHT_DATA_AUTH = 'test-auth';
    }
    brightDataService = new BrightDataService();
    // Limpiar cache antes de cada test
    brightDataService.accommodationsCache.clear();
    brightDataService.eventsCache.clear();
  });

  test('getMyAccommodationsCached devuelve datos del cache en segunda llamada (<10ms)', async () => {
    const zoneKey = 'valencia';
    const date = '2025-02-15';
    const guests = 2;

    // Primera llamada (debe hacer request real o fallback)
    const start1 = Date.now();
    const result1 = await brightDataService.getMyAccommodationsCached(zoneKey, date, guests);
    const time1 = Date.now() - start1;

    expect(result1).toBeDefined();
    expect(result1.success).toBe(true);

    // Segunda llamada (debe venir del cache, <10ms)
    const start2 = Date.now();
    const result2 = await brightDataService.getMyAccommodationsCached(zoneKey, date, guests);
    const time2 = Date.now() - start2;

    expect(result2).toBeDefined();
    expect(result2.success).toBe(true);
    expect(time2).toBeLessThan(10); // Debe ser muy rápido (<10ms)
    
    // Verificar que el cache tiene la entrada
    const cacheKey = `${zoneKey}_${date}_${guests}`;
    expect(brightDataService.accommodationsCache.has(cacheKey)).toBe(true);
  });

  test('getMyAccommodationsCached expira después de 30s', async () => {
    const zoneKey = 'valencia';
    const date = '2025-02-15';
    const guests = 2;

    // Primera llamada
    await brightDataService.getMyAccommodationsCached(zoneKey, date, guests);

    // Simular que pasaron 31 segundos
    const cacheKey = `${zoneKey}_${date}_${guests}`;
    const cached = brightDataService.accommodationsCache.get(cacheKey);
    cached.timestamp = Date.now() - 31000; // 31 segundos atrás

    // Nueva llamada debería hacer request fresco
    const result = await brightDataService.getMyAccommodationsCached(zoneKey, date, guests);
    
    expect(result).toBeDefined();
    // El cache debería haberse actualizado con nuevo timestamp
    const newCached = brightDataService.accommodationsCache.get(cacheKey);
    expect(newCached.timestamp).toBeGreaterThan(cached.timestamp);
  });

  test('getLocalEventsCached devuelve datos del cache en segunda llamada', async () => {
    const zoneKey = 'valencia';
    const date = '2025-02-15';

    // Primera llamada
    const result1 = await brightDataService.getLocalEventsCached(zoneKey, date);
    expect(result1).toBeDefined();
    expect(Array.isArray(result1)).toBe(true);

    // Segunda llamada (debe venir del cache)
    const start = Date.now();
    const result2 = await brightDataService.getLocalEventsCached(zoneKey, date);
    const time = Date.now() - start;

    expect(result2).toBeDefined();
    expect(Array.isArray(result2)).toBe(true);
    expect(time).toBeLessThan(10); // Debe ser muy rápido
    expect(result2).toEqual(result1); // Mismos datos
  });

  test('getMyAccommodationsCached funciona sin BRIGHT_DATA_AUTH (modo fallback)', async () => {
    delete process.env.BRIGHT_DATA_AUTH;
    const service = new BrightDataService();
    service.accommodationsCache.clear();

    const result = await service.getMyAccommodationsCached('valencia', '2025-02-15', 2);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.accommodations).toBeDefined();
  });
});

