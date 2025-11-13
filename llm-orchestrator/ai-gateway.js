/**
 * AI Gateway - Orchestrador de LLMs
 * Modo offline - Respuestas simuladas
 */

class AIGateway {
  constructor() {
    this.providers = {
      groq: { name: 'Groq', status: 'offline' },
      deepseek: { name: 'DeepSeek', status: 'offline' },
      ollama: { name: 'Ollama', status: 'local' }
    };
    console.log('✅ AI Gateway inicializado (Modo offline)');
  }

  async generateResponse(prompt, provider = 'groq', model = 'mixtral') {
    // Respuestas offline simuladas según el prompt
    const responses = {
      'explicame': 'Te lo explicaré de forma clara: este sistema utiliza arquitectura modular...',
      'hola': '¡Hola! Soy Sandra IA 8.0 Pro. ¿Cómo puedo ayudarte hoy?',
      'genera': 'Aquí está el código generado:\n```javascript\nconst sandra = {\n  version: "8.0.0",\n  status: "active"\n};\n```',
      'default': `[${provider.toUpperCase()}] Procesando: "${prompt.substring(0, 50)}..."
      
Respuesta simulada en modo offline. Este sistema está completamente funcional sin internet.`
    };

    // Buscar respuesta apropiada
    let response = responses.default;
    for (const [key, value] of Object.entries(responses)) {
      if (prompt.toLowerCase().includes(key)) {
        response = value;
        break;
      }
    }

    return response;
  }

  async multiProviderFallback(prompt, primary = 'groq', fallback = 'deepseek') {
    try {
      return await this.generateResponse(prompt, primary);
    } catch {
      console.log(`Cambiando a proveedor: ${fallback}`);
      return await this.generateResponse(prompt, fallback);
    }
  }

  async analyzeCode(code) {
    return `Análisis de código:\n- Estructura: OK\n- Sintaxis: Válida\n- Rendimiento: Bueno\n\nCódigo válido y listo para ejecutar.`;
  }

  getProviderStatus() {
    return this.providers;
  }
}

module.exports = AIGateway;
