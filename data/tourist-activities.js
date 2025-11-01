/**
 * Base de datos de actividades turísticas en Valencia
 * Para el chatbot de Sandra IA
 */

module.exports = {
  activities: [
    {
      id: 'city-arts-sciences',
      name: 'Ciudad de las Artes y las Ciencias',
      category: 'cultura',
      description: 'Complejo arquitectónico moderno con museo de ciencias, oceanográfico y palacio de las artes.',
      location: 'Valencia',
      price: 'Desde 8€',
      duration: '3-4 horas',
      languages: ['es', 'en', 'fr']
    },
    {
      id: 'oceanografic',
      name: 'Oceanográfico',
      category: 'naturaleza',
      description: 'El acuario más grande de Europa con más de 45,000 animales marinos.',
      location: 'Ciudad de las Artes y las Ciencias',
      price: '31.30€',
      duration: '2-3 horas',
      languages: ['es', 'en', 'fr', 'de']
    },
    {
      id: 'bioparc',
      name: 'Bioparc Valencia',
      category: 'naturaleza',
      description: 'Zoológico de inmersión donde los animales viven en hábitats naturales recreados.',
      location: 'Av. Pío Baroja, 3',
      price: '23.80€',
      duration: '2-3 horas',
      languages: ['es', 'en']
    },
    {
      id: 'albufera',
      name: 'Albufera de Valencia',
      category: 'naturaleza',
      description: 'Parque natural con lago, paseos en barca y puesta de sol espectacular.',
      location: 'A 10km de Valencia',
      price: 'Paseo en barca: 4€',
      duration: '2-4 horas',
      languages: ['es', 'en']
    },
    {
      id: 'fallas',
      name: 'Museo de las Fallas',
      category: 'cultura',
      description: 'Museo dedicado a las Fallas, fiesta tradicional valenciana declarada Patrimonio de la Humanidad.',
      location: 'Plaza Monteolivete, 4',
      price: '2€',
      duration: '1 hora',
      languages: ['es', 'en']
    },
    {
      id: 'cathedral',
      name: 'Catedral de Valencia y Miguelete',
      category: 'religioso',
      description: 'Catedral gótica con el Santo Cáliz y torre del Miguelete con vistas panorámicas.',
      location: 'Plaza de la Reina',
      price: '8€ (incluye torre)',
      duration: '1 hora',
      languages: ['es', 'en', 'fr']
    },
    {
      id: 'central-market',
      name: 'Mercado Central',
      category: 'gastronomia',
      description: 'Mercado modernista con productos frescos, pescado, frutas y embutidos típicos.',
      location: 'Plaza del Mercado',
      price: 'Gratis',
      duration: '30-60 min',
      languages: ['es']
    },
    {
      id: 'turia-garden',
      name: 'Jardín del Turia',
      category: 'naturaleza',
      description: 'Parque lineal de 9km que atraviesa la ciudad, ideal para caminar, correr o ir en bici.',
      location: 'A lo largo del antiguo cauce del río',
      price: 'Gratis',
      duration: '1-3 horas',
      languages: ['es']
    },
    {
      id: 'silk-exchange',
      name: 'Lonja de la Seda',
      category: 'cultura',
      description: 'Edificio gótico declarado Patrimonio de la Humanidad, antigua lonja de comerciantes.',
      location: 'Plaza del Mercado',
      price: '2€',
      duration: '30 min',
      languages: ['es', 'en']
    },
    {
      id: 'beaches',
      name: 'Playas de Valencia',
      category: 'naturaleza',
      description: 'Las playas de la Malvarrosa, Patacona y El Saler, ideales para disfrutar del Mediterráneo.',
      location: 'A 15-20 min del centro',
      price: 'Gratis',
      duration: 'Variable',
      languages: ['es']
    }
  ],

  // Funciones de búsqueda
  findByCategory(category) {
    return this.activities.filter(a => a.category === category);
  },

  findByName(name) {
    const searchTerm = name.toLowerCase();
    return this.activities.filter(a => 
      a.name.toLowerCase().includes(searchTerm) ||
      a.description.toLowerCase().includes(searchTerm)
    );
  },

  findById(id) {
    return this.activities.find(a => a.id === id);
  },

  getCategories() {
    return [...new Set(this.activities.map(a => a.category))];
  }
};

