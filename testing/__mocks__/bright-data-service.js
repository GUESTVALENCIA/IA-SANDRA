/**
 * Mock de Bright Data Service para tests
 * Evita llamadas reales a APIs externas
 */

module.exports = class BrightDataServiceMock {
  constructor() {
    this.accommodationsCache = new Map();
    this.eventsCache = new Map();
    this.CACHE_TTL = 30000;
  }

  async getMyAccommodationsCached(zoneKey, date, guests) {
    return {
      success: true,
      company: {
        name: 'Guests-Valencia',
        description: 'Expertos en gestión de alojamientos'
      },
      accommodations: [
        {
          id: 'mock',
          name: 'Mock Accommodation',
          price: 100,
          location: zoneKey || 'valencia',
          available: true
        }
      ],
      mode: 'mock',
      totalProperties: 1,
      availableForGuests: 1,
      searchCriteria: { checkIn: date, checkOut: null, guests },
      timestamp: new Date().toISOString()
    };
  }

  async getLocalEventsCached(zoneKey, date) {
    return [
      {
        id: 'mock-event-1',
        name: 'Fiesta',
        date: date || '2025-01-01',
        location: zoneKey || 'valencia',
        type: 'cultural',
        description: 'Evento mock para tests'
      }
    ];
  }

  async getMyAccommodations(checkIn, checkOut, guests) {
    return this.getMyAccommodationsCached('valencia', checkIn, guests);
  }
};

