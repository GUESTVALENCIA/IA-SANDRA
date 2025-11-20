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

  /**
   * Calcular oferta de negociación basada en reglas de negocio
   * @param {Object} params - Parámetros de la negociación
   * @param {string} params.propertyId - ID de la propiedad
   * @param {number} params.basePrice - Precio base
   * @param {string} params.channel - Canal (booking, airbnb, direct)
   * @param {string} params.date - Fecha de check-in
   * @param {number} params.guests - Número de huéspedes
   * @returns {Promise<Object>} Resultado con minNegotiable, suggestedOffer y reason
   */
  async computeOffer({ propertyId, basePrice, channel, date, guests }) {
    if (!basePrice || basePrice <= 0) {
      return {
        minNegotiable: basePrice,
        suggestedOffer: basePrice,
        reason: 'Precio base inválido'
      };
    }

    // Calcular factor de temporada
    let seasonFactor = 1.0;
    if (date) {
      const checkInDate = new Date(date);
      const month = checkInDate.getMonth() + 1; // 1-12
      
      // Temporada alta: julio, agosto (7, 8)
      if (month === 7 || month === 8) {
        seasonFactor = 1.15; // +15% en temporada alta
      }
      // Temporada media: junio, septiembre (6, 9)
      else if (month === 6 || month === 9) {
        seasonFactor = 1.05; // +5% en temporada media
      }
      // Temporada baja: resto del año
      else {
        seasonFactor = 0.95; // -5% en temporada baja
      }
    }

    // Calcular comisión según canal
    let commissionFactor = 1.0;
    switch (channel?.toLowerCase()) {
      case 'booking':
        commissionFactor = 0.85; // 15% comisión
        break;
      case 'airbnb':
        commissionFactor = 0.87; // 13% comisión
        break;
      case 'direct':
        commissionFactor = 1.0; // Sin comisión
        break;
      default:
        commissionFactor = 0.90; // 10% comisión por defecto
    }

    // Calcular precio mínimo negociable (70% del precio base ajustado)
    const adjustedPrice = basePrice * seasonFactor * commissionFactor;
    const minNegotiable = Math.round(adjustedPrice * 0.70);

    // Calcular oferta sugerida (85% del precio base ajustado)
    const suggestedOffer = Math.round(adjustedPrice * 0.85);

    // Generar razón
    const reasons = [];
    if (seasonFactor > 1.0) {
      reasons.push('temporada alta');
    } else if (seasonFactor < 1.0) {
      reasons.push('temporada baja');
    }
    if (commissionFactor < 1.0) {
      reasons.push(`comisión ${channel} (${Math.round((1 - commissionFactor) * 100)}%)`);
    }
    if (guests && guests > 4) {
      reasons.push('grupo grande');
    }

    const reason = reasons.length > 0 
      ? `Ajuste por: ${reasons.join(', ')}`
      : 'Precio estándar sin ajustes';

    return {
      minNegotiable,
      suggestedOffer,
      reason,
      basePrice,
      adjustedPrice: Math.round(adjustedPrice),
      seasonFactor,
      commissionFactor
    };
  }
}

module.exports = NegotiationService;
