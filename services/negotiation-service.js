/**
 * Negotiation Service - Modo Offline
 * Servicio de negociación automática
 */

class NegotiationService {
  constructor() {
    console.log('✅ Negotiation Service inicializado (Modo offline)');
    this.negotiations = {};
  }

  async initiateNegotiation(accommodationData, userInfo) {
    const negotiationId = `NEG_${Date.now()}`;

    this.negotiations[negotiationId] = {
      id: negotiationId,
      accommodation: accommodationData,
      user: userInfo,
      initialPrice: accommodationData.price,
      currentOffer: accommodationData.price * 0.85,
      status: 'active',
      createdAt: new Date()
    };

    return {
      success: true,
      negotiationId,
      initialPrice: accommodationData.price,
      suggestedOffer: accommodationData.price * 0.85,
      message: 'Negociación iniciada'
    };
  }

  async generateNegotiationStrategy(accommodationData) {
    return {
      strategy: 'price-reduction',
      discount: 0.15,
      message: `Estrategia: Reducir precio en 15% (de ${accommodationData.price} a ${accommodationData.price * 0.85})`
    };
  }

  async handleCounterOffer(negotiationId, counterOffer) {
    if (!this.negotiations[negotiationId]) {
      return { success: false, error: 'Negociación no encontrada' };
    }

    const negotiation = this.negotiations[negotiationId];
    const diff = negotiation.currentOffer - counterOffer;

    return {
      success: true,
      negotiationId,
      previousOffer: negotiation.currentOffer,
      newOffer: counterOffer,
      difference: diff,
      status: 'updated',
      message: 'Contrapropuesta registrada'
    };
  }

  async finalizeNegotiation(negotiationId, finalPrice) {
    if (!this.negotiations[negotiationId]) {
      return { success: false, error: 'Negociación no encontrada' };
    }

    const negotiation = this.negotiations[negotiationId];
    const savings = negotiation.initialPrice - finalPrice;
    const percentage = ((savings / negotiation.initialPrice) * 100).toFixed(2);

    this.negotiations[negotiationId].status = 'completed';
    this.negotiations[negotiationId].finalPrice = finalPrice;

    return {
      success: true,
      negotiationId,
      initialPrice: negotiation.initialPrice,
      finalPrice,
      savings,
      savingsPercentage: percentage,
      message: 'Negociación completada exitosamente'
    };
  }
}

module.exports = NegotiationService;
