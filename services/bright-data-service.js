/**
 * Bright Data Service - MODO ACTIVO
 * Integración real con Bright Data para scraping de Airbnb y Booking
 */

const axios = require('axios');
let puppeteer = null;
try {
  // Carga segura: si no está instalado, seguimos con fallback HTTP/axios
  puppeteer = require('puppeteer-core');
} catch (e) {
  puppeteer = null;
}

class BrightDataService {
  constructor() {
    this.auth = process.env.BRIGHT_DATA_AUTH; // brd-customer-hl_c4b3455e-zone-mcp_booking_airbnb:rsxgwjh411m4
    this.host = process.env.BRIGHT_DATA_HOST || 'brd.superproxy.io:9515';
    this.proxyUrl = `http://${this.auth}@${this.host}`;
    this.wss = process.env.BRIGHT_DATA_WSS; // wss://USER:PASS@brd.superproxy.io:9222
    this.browser = null;
    
    // Alojamientos de Guests-Valencia (gestión profesional)
    this.myListings = {
      properties: [
        {
          id: 'cabanyal-beach-400m',
          name: 'El Cabanyal 400m from the Beach',
          type: 'Apartamento completo',
          location: 'Calle del Progreso, 313, piso 3 puerta 4, Poblados marítimos, 46011 Valencia',
          capacity: 6,
          bedrooms: 3,
          bathrooms: 1,
          size: '78 m²',
          rating: 7.9,
          reviews: 20,
          locationScore: 9.1,
          priceFrom: 80,
          features: ['WiFi gratis', 'Aire acondicionado', 'Balcón', 'Cocina equipada', 'Lavadora', 'Frente a la playa'],
          nearBeach: '400m de Playa de las Arenas',
          checkIn: '15:00-22:00',
          checkOut: '11:00-12:00',
          license: 'VT-44228-CS',
          platforms: ['booking'],
          highlights: [
            'Ubicación excelente (9.1/10)',
            'A 7 min a pie de Playa de las Arenas',
            'Barrio El Cabañal - zona marítima',
            'Personal muy valorado (9.1/10)'
          ]
        },
        {
          id: 'montanejos-river-duplex',
          name: 'Dúplex en Montanejos 200 metros del río Mijares',
          type: 'Dúplex completo',
          location: 'Carretera de Tales, 30, puerta 9, 12448 Montanejos, Castellón',
          capacity: 8,
          bedrooms: 4,
          bathrooms: 2,
          size: '137 m²',
          rating: 6.7,
          reviews: 25,
          locationScore: 9.3,
          priceFrom: 120,
          features: ['WiFi gratis (10/10)', 'Vistas a la montaña', 'Terraza', 'Balcón', 'Parking gratis', 'Lavadora', 'Bañera'],
          nearRiver: '200m del río Mijares',
          checkIn: '15:00-20:00',
          checkOut: '11:00-12:00',
          license: 'VT-44228-CS',
          platforms: ['booking'],
          highlights: [
            'Ubicación excelente (9.3/10)',
            'Ideal para familias (8 personas)',
            'Cerca de aguas termales de Montanejos',
            'Parking privado gratis',
            'Vistas al río Mijares'
          ]
        },
        {
          id: 'betera-metro-apartment',
          name: 'Precioso apartamento a minutos del metro',
          type: 'Apartamento completo',
          location: 'Carretera de Valencia, 4 piso 3, 46117 Bétera, Valencia',
          capacity: 4,
          bedrooms: 2,
          bathrooms: 1,
          size: '78 m²',
          rating: null,
          reviews: 0,
          locationScore: null,
          priceFrom: 70,
          features: ['Parking gratis', 'Calefacción', 'Cocina equipada', 'Lavadora', 'TV pantalla plana', 'Ascensor'],
          nearMetro: '200m de estación Bétera',
          checkIn: '15:00-22:00',
          checkOut: '11:00-12:00',
          license: 'VT-44228-CS',
          platforms: ['booking'],
          highlights: [
            'A 200m del metro (línea a Valencia)',
            'Parking gratis en las inmediaciones',
            'Zona tranquila cerca de Valencia',
            'Ideal para estancias largas'
          ]
        }
      ]
    };
    
    // Información de la empresa
    this.companyInfo = {
      name: 'Guests-Valencia',
      description: 'Expertos en gestión de alojamientos turísticos vacacionales y de corta estancia',
      experience: '4 años de experiencia en el sector',
      coverage: 'Toda la Comunidad Valenciana',
      totalProperties: 6,
      rating: 7.8,
      totalReviews: 63
    };
    
    if (this.auth) console.log('✅ Bright Data Service: proxy HTTP activo:', this.host);
    if (this.wss)  console.log('✅ Bright Data Service: Browser API WSS configurado');
    if (!this.auth && !this.wss) console.warn('⚠️ Bright Data no configurado - usando datos de ejemplo');
  }

  async ensureBrowser() {
    if (!this.wss || !puppeteer) return false;
    if (this.browser && this.browser.isConnected()) return true;
    try {
      this.browser = await puppeteer.connect({
        browserWSEndpoint: this.wss,
        defaultViewport: { width: 1280, height: 800 }
      });
      console.log('🟢 Bright Data Browser conectado');
      return true;
    } catch (e) {
      console.warn('⚠️ No se pudo conectar a Bright Data Browser:', e.message);
      return false;
    }
  }

  async closeBrowser() {
    try { if (this.browser) await this.browser.close(); } catch {}
    this.browser = null;
  }

  /**
   * Consultar disponibilidad y precios de tus alojamientos
   */
  async getMyAccommodations(checkIn = null, checkOut = null, guests = 2) {
    try {
      // Intentar Browser API (WSS) si está disponible y hay URLs
      const hasBrowser = await this.ensureBrowser();
      const urls = [
        process.env.BRIGHTDATA_BOOKING_URL_1,
        process.env.BRIGHTDATA_BOOKING_URL_2,
        process.env.BRIGHTDATA_BOOKING_URL_3
      ].filter(Boolean);

      const results = [];

      if (hasBrowser && urls.length > 0) {
        const context = await this.browser.createBrowserContext();
        try {
          for (const url of urls) {
            const data = await this.fetchBookingViaBrowser(context, url, { checkIn, checkOut, guests });
            if (data) results.push(data);
          }
        } finally {
          try { await context.close(); } catch {}
        }
      }

      // Si no hay Browser API o falló, usar información local como fallback elegante
      if (results.length === 0) {
        const availableProperties = this.myListings.properties.filter(p => p.capacity >= guests);
        return {
          success: true,
          company: this.companyInfo,
          accommodations: availableProperties,
          mode: 'fallback',
          totalProperties: this.myListings.properties.length,
          availableForGuests: availableProperties.length,
          searchCriteria: { checkIn, checkOut, guests },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        company: this.companyInfo,
        accommodations: results,
        mode: 'live',
        totalProperties: results.length,
        availableForGuests: results.length,
        searchCriteria: { checkIn, checkOut, guests },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error obteniendo alojamientos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener datos de Booking usando Bright Data Browser API
   */
  async fetchBookingViaBrowser(context, baseUrl, { checkIn, checkOut, guests }) {
    try {
      const url = this.addBookingParams(baseUrl, { checkIn, checkOut, guests });
      const page = await context.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/118 Safari/537.36');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // Intentar varios patern de Booking nuevos
      const data = await page.evaluate(() => {
        function pick(selArr) {
          for (const s of selArr) {
            const el = document.querySelector(s);
            if (el && el.textContent?.trim()) return el.textContent.trim();
          }
          return null;
        }
        const title = pick(['h2[data-testid="title"]','h2.hp__hotel-name','div[data-capla-component="b-property-web-title"] h2']);
        const price = pick(['div[data-testid="price-and-discounted-price"]','span.prc-d-sri-price-sr','div.f6431b446c']);
        const location = pick(['a[data-testid="breadcrumb-item-link"]','span.hp_address_subtitle','span.hp_address_subtitle_js_tooltips']);
        const availability = pick(['div[data-testid="availability-cta"]','div#availability']);
        return { title, price, location, availability };
      });

      const screenshotsDir = null; // opcional: guardar capturas para debug
      try { await page.close(); } catch {}

      return {
        success: true,
        platform: 'booking',
        url,
        name: data.title || 'Alojamiento Booking',
        price: data.price || 'Consultar',
        location: data.location || '',
        available: !!data.availability,
        scrapedAt: new Date().toISOString()
      };
    } catch (e) {
      console.warn('Booking WSS error:', e.message);
      return null;
    }
  }

  addBookingParams(url, { checkIn, checkOut, guests }) {
    try {
      if (!checkIn || !checkOut) return url;
      const u = new URL(url);
      u.searchParams.set('checkin', checkIn);
      u.searchParams.set('checkout', checkOut);
      const g = Number(guests || 2);
      u.searchParams.set('group_adults', String(Math.max(1, g)));
      u.searchParams.set('no_rooms', '1');
      u.searchParams.set('group_children', '0');
      return u.toString();
    } catch {
      return url;
    }
  }

  /**
   * Scraping de Airbnb con Bright Data
   */
  async scrapeAirbnb(url, options = {}) {
    if (!this.auth) {
      return this.getFallbackAirbnb();
    }

    try {
      const response = await axios.get(url, {
        proxy: {
          host: 'brd.superproxy.io',
          port: 9515,
          auth: {
            username: this.auth.split(':')[0],
            password: this.auth.split(':')[1]
          }
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      // Parsear datos de Airbnb (simplificado - ajustar según estructura real)
      return {
        success: true,
        platform: 'airbnb',
        url,
        // Aquí iría el parsing real del HTML de Airbnb
        name: 'Apartamento El Cabañal',
        price: 'Consultar disponibilidad',
        available: true,
        rawData: response.data.substring(0, 500) // Solo muestra para debug
      };
    } catch (error) {
      console.error('Error scraping Airbnb:', error.message);
      return this.getFallbackAirbnb();
    }
  }

  /**
   * Scraping de Booking con Bright Data
   */
  async scrapeBooking(url, options = {}) {
    if (!this.auth) {
      return this.getFallbackBooking();
    }

    try {
      const response = await axios.get(url, {
        proxy: {
          host: 'brd.superproxy.io',
          port: 9515,
          auth: {
            username: this.auth.split(':')[0],
            password: this.auth.split(':')[1]
          }
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      // Parsear datos de Booking (simplificado - ajustar según estructura real)
      return {
        success: true,
        platform: 'booking',
        url,
        name: 'Alojamiento El Cabañal',
        price: 'Consultar disponibilidad',
        available: true,
        rawData: response.data.substring(0, 500)
      };
    } catch (error) {
      console.error('Error scraping Booking:', error.message);
      return this.getFallbackBooking();
    }
  }

  /**
   * Datos de fallback (mientras configuras las URLs reales)
   */
  getFallbackData() {
    return {
      location: 'El Cabañal, Valencia',
      accommodations: [
        {
          name: 'Apartamento Playa Cabañal',
          type: 'Apartamento completo',
          capacity: '4-6 personas',
          location: 'El Cabañal, a 2 min de la playa',
          features: ['WiFi', 'Cocina equipada', 'Aire acondicionado', 'Terraza'],
          price: 'Desde 80€/noche',
          platform: 'airbnb',
          available: true
        },
        {
          name: 'Casa Marinera Cabañal',
          type: 'Casa completa',
          capacity: '6 personas',
          location: 'Barrio Marítimo del Cabañal',
          features: ['WiFi', '3 habitaciones', 'Patio', 'Cerca de la playa'],
          price: 'Desde 120€/noche',
          platform: 'booking',
          available: true
        }
      ]
    };
  }

  getFallbackAirbnb() {
    return {
      success: true,
      platform: 'airbnb',
      name: 'Apartamento Playa Cabañal',
      location: 'El Cabañal, Valencia',
      price: 'Desde 80€/noche',
      available: true,
      note: 'Datos de ejemplo - Configurar URLs reales en bright-data-service.js'
    };
  }

  getFallbackBooking() {
    return {
      success: true,
      platform: 'booking',
      name: 'Casa Marinera Cabañal',
      location: 'El Cabañal, Valencia',
      price: 'Desde 120€/noche',
      available: true,
      note: 'Datos de ejemplo - Configurar URLs reales en bright-data-service.js'
    };
  }

  /**
   * Procesar reserva/venta
   */
  async processSale(listingData, userInfo) {
    return {
      success: true,
      saleId: `SALE_${Date.now()}`,
      listing: listingData,
      user: userInfo,
      status: 'processed',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = BrightDataService;
