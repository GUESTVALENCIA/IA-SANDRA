/**
 * Mock de Negotiation Service para tests
 * Evita cálculos complejos y devuelve valores predecibles
 */

module.exports = class NegotiationServiceMock {
  constructor() {
    this.negotiations = {};
  }

  async computeOffer(params) {
    const { basePrice = 100 } = params;
    return {
      minNegotiable: Math.round(basePrice * 0.7),
      suggestedOffer: Math.round(basePrice * 0.85),
      reason: 'mock',
      basePrice,
      adjustedPrice: basePrice,
      seasonFactor: 1.0,
      commissionFactor: 1.0
    };
  }

  async initiateNegotiation(accommodationData, userInfo) {
    return {
      success: true,
      negotiationId: 'mock-neg-123',
      initialPrice: accommodationData.price || 100,
      suggestedOffer: (accommodationData.price || 100) * 0.85,
      message: 'Negociación mock iniciada'
    };
  }

  async generateNegotiationStrategy(accommodationData) {
    return {
      strategy: 'price-reduction',
      discount: 0.15,
      message: 'Estrategia mock'
    };
  }

  async handleCounterOffer(negotiationId, counterOffer) {
    return {
      success: true,
      negotiationId,
      previousOffer: 100,
      newOffer: counterOffer,
      difference: 100 - counterOffer,
      status: 'updated',
      message: 'Contrapropuesta mock registrada'
    };
  }

  async finalizeNegotiation(negotiationId, finalPrice) {
    return {
      success: true,
      negotiationId,
      initialPrice: 100,
      finalPrice,
      savings: 100 - finalPrice,
      savingsPercentage: ((100 - finalPrice) / 100 * 100).toFixed(2),
      message: 'Negociación mock completada'
    };
  }
};

