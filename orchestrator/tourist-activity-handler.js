/**
 * Handler especializado para actividades turísticas
 * Integrado con base de datos de actividades de Valencia
 */

const activitiesDB = require('../data/tourist-activities');

class TouristActivityHandler {
  constructor() {
    this.activities = activitiesDB.activities;
  }

  /**
   * Buscar actividad por término
   */
  searchActivity(query) {
    const lowerQuery = query.toLowerCase();
    
    // Búsqueda por nombre
    let results = activitiesDB.findByName(query);
    
    // Si no hay resultados, buscar por categoría
    if (results.length === 0) {
      const categories = activitiesDB.getCategories();
      const matchedCategory = categories.find(cat => 
        lowerQuery.includes(cat) || 
        this.translateCategory(cat).some(term => lowerQuery.includes(term))
      );
      
      if (matchedCategory) {
        results = activitiesDB.findByCategory(matchedCategory);
      }
    }
    
    return results;
  }

  /**
   * Traducir categorías al español
   */
  translateCategory(category) {
    const translations = {
      'cultura': ['cultura', 'cultural', 'museo', 'museos', 'arte', 'artes'],
      'naturaleza': ['naturaleza', 'parque', 'jardín', 'jardines', 'natura', 'verde'],
      'gastronomia': ['gastronomía', 'comida', 'restaurante', 'mercado', 'gastronomía'],
      'religioso': ['religioso', 'iglesia', 'catedral', 'sagrado'],
      'playa': ['playa', 'playas', 'mar', 'mediterráneo', 'costa']
    };
    
    return translations[category] || [category];
  }

  /**
   * Formatear actividad para respuesta
   */
  formatActivity(activity) {
    return `🏛️ *${activity.name}*\n\n` +
           `📝 ${activity.description}\n\n` +
           `📍 Ubicación: ${activity.location}\n` +
           `💰 Precio: ${activity.price}\n` +
           `⏱️ Duración: ${activity.duration}\n` +
           `🌐 Idiomas: ${activity.languages.join(', ').toUpperCase()}`;
  }

  /**
   * Generar recomendaciones
   */
  getRecommendations(userPreferences = {}) {
    let results = [...this.activities];
    
    // Filtrar por categoría si se especifica
    if (userPreferences.category) {
      results = activitiesDB.findByCategory(userPreferences.category);
    }
    
    // Limitar resultados
    return results.slice(0, userPreferences.limit || 5);
  }

  /**
   * Procesar consulta del usuario sobre actividades
   */
  async processQuery(query, context = {}) {
    const lowerQuery = query.toLowerCase();
    
    // Palabras clave para detectar intención
    const keywords = {
      buscar: ['buscar', 'busco', 'quiero ver', 'quiero visitar', 'recomiéndame'],
      precio: ['precio', 'cuesta', 'coste', 'barato', 'económico'],
      ubicacion: ['dónde', 'donde', 'ubicación', 'ubicado', 'sitio', 'lugar'],
      tiempo: ['cuánto tiempo', 'duración', 'cuanto dura', 'horas'],
      categorias: ['qué hay', 'actividades', 'cosas que hacer', 'lugares']
    };

    // Detectar intención
    let intent = 'search';
    for (const [key, terms] of Object.entries(keywords)) {
      if (terms.some(term => lowerQuery.includes(term))) {
        intent = key;
        break;
      }
    }

    // Procesar según intención
    switch (intent) {
      case 'buscar':
      case 'search':
        const activities = this.searchActivity(query);
        if (activities.length > 0) {
          return {
            type: 'activities_list',
            activities: activities.map(a => this.formatActivity(a)),
            count: activities.length
          };
        }
        break;

      case 'categorias':
        const categories = activitiesDB.getCategories();
        return {
          type: 'categories',
          categories: categories,
          message: `Tenemos actividades en estas categorías: ${categories.join(', ')}`
        };

      case 'precio':
        const freeActivities = this.activities.filter(a => 
          a.price.toLowerCase().includes('gratis') || a.price === 'Gratis'
        );
        return {
          type: 'free_activities',
          activities: freeActivities.map(a => this.formatActivity(a)),
          message: `Encontré ${freeActivities.length} actividades gratuitas`
        };

      default:
        // Búsqueda general
        const results = this.searchActivity(query);
        if (results.length > 0) {
          return {
            type: 'activities_list',
            activities: results.map(a => this.formatActivity(a)),
            count: results.length
          };
        }
    }

    // Si no se encontró nada
    return {
      type: 'not_found',
      message: 'No encontré actividades que coincidan con tu búsqueda. ¿Puedes ser más específico?',
      suggestions: ['¿Qué tipo de actividad te interesa?', '¿Prefieres algo cultural, naturaleza o gastronomía?']
    };
  }
}

module.exports = { TouristActivityHandler };

