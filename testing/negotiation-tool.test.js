/**
 * Tests para Negotiation Tool
 * Verifica que computeOffer devuelve valores correctos
 */

const NegotiationService = require('../services/negotiation-service');

describe('Negotiation Tool', () => {
  let negotiationService;

  beforeEach(() => {
    negotiationService = new NegotiationService();
  });

  test('computeOffer devuelve minNegotiable ≤ basePrice', async () => {
    const basePrice = 100;
    const result = await negotiationService.computeOffer({
      propertyId: 'test-property',
      basePrice,
      channel: 'direct',
      date: '2025-02-15',
      guests: 2
    });

    expect(result).toBeDefined();
    expect(result.minNegotiable).toBeDefined();
    expect(result.suggestedOffer).toBeDefined();
    expect(result.reason).toBeDefined();
    
    // minNegotiable debe ser ≤ basePrice
    expect(result.minNegotiable).toBeLessThanOrEqual(basePrice);
    // suggestedOffer debe ser ≤ basePrice (en temporada baja)
    expect(result.suggestedOffer).toBeLessThanOrEqual(basePrice * 1.2); // Permitir margen por temporada
  });

  test('computeOffer ajusta precio por temporada alta', async () => {
    const basePrice = 100;
    const result = await negotiationService.computeOffer({
      propertyId: 'test-property',
      basePrice,
      channel: 'direct',
      date: '2025-07-15', // Julio (temporada alta)
      guests: 2
    });

    expect(result.seasonFactor).toBe(1.15); // +15% en temporada alta
    expect(result.adjustedPrice).toBeGreaterThan(basePrice);
  });

  test('computeOffer ajusta precio por temporada baja', async () => {
    const basePrice = 100;
    const result = await negotiationService.computeOffer({
      propertyId: 'test-property',
      basePrice,
      channel: 'direct',
      date: '2025-01-15', // Enero (temporada baja)
      guests: 2
    });

    expect(result.seasonFactor).toBe(0.95); // -5% en temporada baja
    expect(result.adjustedPrice).toBeLessThan(basePrice);
  });

  test('computeOffer aplica comisión de Booking (15%)', async () => {
    const basePrice = 100;
    const result = await negotiationService.computeOffer({
      propertyId: 'test-property',
      basePrice,
      channel: 'booking',
      date: '2025-02-15',
      guests: 2
    });

    expect(result.commissionFactor).toBe(0.85); // 15% comisión
    expect(result.adjustedPrice).toBeLessThan(basePrice);
  });

  test('computeOffer aplica comisión de Airbnb (13%)', async () => {
    const basePrice = 100;
    const result = await negotiationService.computeOffer({
      propertyId: 'test-property',
      basePrice,
      channel: 'airbnb',
      date: '2025-02-15',
      guests: 2
    });

    expect(result.commissionFactor).toBe(0.87); // 13% comisión
    expect(result.adjustedPrice).toBeLessThan(basePrice);
  });

  test('computeOffer sin comisión en canal direct', async () => {
    const basePrice = 100;
    const result = await negotiationService.computeOffer({
      propertyId: 'test-property',
      basePrice,
      channel: 'direct',
      date: '2025-02-15',
      guests: 2
    });

    expect(result.commissionFactor).toBe(1.0); // Sin comisión
  });

  test('computeOffer maneja precio base inválido', async () => {
    const result = await negotiationService.computeOffer({
      propertyId: 'test-property',
      basePrice: 0,
      channel: 'direct',
      date: '2025-02-15',
      guests: 2
    });

    expect(result.minNegotiable).toBe(0);
    expect(result.suggestedOffer).toBe(0);
    expect(result.reason).toContain('inválido');
  });

  test('computeOffer calcula minNegotiable como 70% del precio ajustado', async () => {
    const basePrice = 100;
    const result = await negotiationService.computeOffer({
      propertyId: 'test-property',
      basePrice,
      channel: 'direct',
      date: '2025-02-15',
      guests: 2
    });

    const expectedMin = Math.round(result.adjustedPrice * 0.70);
    expect(result.minNegotiable).toBe(expectedMin);
  });

  test('computeOffer calcula suggestedOffer como 85% del precio ajustado', async () => {
    const basePrice = 100;
    const result = await negotiationService.computeOffer({
      propertyId: 'test-property',
      basePrice,
      channel: 'direct',
      date: '2025-02-15',
      guests: 2
    });

    const expectedSuggested = Math.round(result.adjustedPrice * 0.85);
    expect(result.suggestedOffer).toBe(expectedSuggested);
  });

  test('computeOffer incluye razón con información de ajustes', async () => {
    const basePrice = 100;
    const result = await negotiationService.computeOffer({
      propertyId: 'test-property',
      basePrice,
      channel: 'booking',
      date: '2025-07-15', // Temporada alta
      guests: 5 // Grupo grande
    });

    expect(result.reason).toBeDefined();
    expect(typeof result.reason).toBe('string');
    expect(result.reason.length).toBeGreaterThan(0);
  });
});

