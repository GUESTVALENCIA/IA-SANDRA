/**
 * Voice Bridge Service
 * Integración entre servicios de Bright Data cache y Negotiation
 * para uso en llamadas de voz
 */

const BrightDataService = require('./bright-data-service');
const NegotiationService = require('./negotiation-service');

class VoiceBridgeService {
  constructor() {
    this.brightData = new BrightDataService();
    this.negotiation = new NegotiationService();
    console.log('✅ Voice Bridge Service inicializado');
  }

  /**
   * Obtener disponibilidad y eventos (usando cache)
   * @param {string} zoneKey - Clave de zona
   * @param {string} date - Fecha en formato ISO
   * @param {number} guests - Número de huéspedes
   * @returns {Promise<Object>} Datos de disponibilidad y eventos
   */
  async gv_getAvailabilityAndEvents(zoneKey, date, guests = 2) {
    try {
      // Obtener alojamientos desde cache
      const accommodations = await this.brightData.getMyAccommodationsCached(
        zoneKey,
        date,
        guests
      );

      // Obtener eventos desde cache
      const events = await this.brightData.getLocalEventsCached(zoneKey, date);

      return {
        success: true,
        accommodations,
        events,
        zoneKey,
        date,
        guests,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error en gv_getAvailabilityAndEvents:', error);
      return {
        success: false,
        error: error.message,
        accommodations: null,
        events: []
      };
    }
  }

  /**
   * Calcular oferta de negociación
   * @param {Object} params - Parámetros de negociación
   * @param {string} params.propertyId - ID de la propiedad
   * @param {number} params.basePrice - Precio base
   * @param {string} params.channel - Canal (booking, airbnb, direct)
   * @param {string} params.date - Fecha de check-in
   * @param {number} params.guests - Número de huéspedes
   * @returns {Promise<Object>} Resultado de la negociación
   */
  async gv_computeNegotiationOffer({ propertyId, basePrice, channel, date, guests }) {
    try {
      const result = await this.negotiation.computeOffer({
        propertyId,
        basePrice,
        channel,
        date,
        guests
      });

      return {
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error en gv_computeNegotiationOffer:', error);
      return {
        success: false,
        error: error.message,
        minNegotiable: basePrice,
        suggestedOffer: basePrice,
        reason: 'Error al calcular oferta'
      };
    }
  }
}

module.exports = VoiceBridgeService;

