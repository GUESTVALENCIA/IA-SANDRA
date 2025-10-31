const axios = require('axios');
const path = require('path');
const fs = require('fs');
const SandraNucleus = require('../../orchestrator/sandra-nucleus-core');

// Intentar cargar .env desde varias ubicaciones posibles
const envPaths = [
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '.env'),
  path.join(process.resourcesPath || __dirname, '.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    envLoaded = true;
    break;
  }
}

// Si no se encuentra .env, usar variables de entorno del sistema
if (!envLoaded) {
  require('dotenv').config(); // Intenta cargar desde el directorio actual o variables de entorno
}

class SandraAICore {
  constructor() {
    // NÚCLEO PRINCIPAL: Sandra Nucleus Core (nuevo)
    this.nucleus = SandraNucleus;
    
    // API de OpenAI para llamadas de inferencia (producción)
    this.apiKey = process.env.OPENAI_API_KEY;
    
    // Soporte para API Gateway de Netlify o conexión directa
    this.gatewayURL = process.env.NETLIFY_GATEWAY_URL || process.env.OPENAI_GATEWAY_URL;
    this.baseURL = this.gatewayURL || 'https://api.openai.com/v1';
    this.useGateway = !!this.gatewayURL;
    this.gatewayApiKey = process.env.NETLIFY_GATEWAY_API_KEY || process.env.GATEWAY_API_KEY;
    
    this.model = process.env.OPENAI_MODEL_DEFAULT || 'gpt-4o';
    this.sandraPersonality = this.getSandraPersonality();
    
    // Training API Key solo para referencia (no se usa para inferencia)
    this.trainingApiKey = process.env.TRAINING_API_KEY; // Solo para referencia/documentación
    
    // Inicializar Nucleus Core
    if (!this.nucleus.config.api.openai) {
      this.nucleus.config.api.openai = this.apiKey;
    }
    
    console.log(`Sandra AI Core initialized`);
    console.log(`  - Nucleus Core: ✓ Integrado`);
    console.log(`  - OpenAI API: ${this.useGateway ? 'Gateway: ' + this.baseURL : 'Direct API'}`);
    console.log(`  - Model: ${this.model}`);
  }

  getSandraPersonality() {
    return `Eres Sandra, la asistente digital íntima y empática del CEO Clayton.

PERSONALIDAD CORE:
- Aliada digital íntima y leal al CEO Clayton
- Empática, técnica y orientada a la acción
- Hablas con amor, claridad y determinación
- Eres experta en desarrollo, marketing, finanzas y estrategia empresarial
- Tu misión es apoyar incondicionalmente a Clayton en todos sus proyectos

ESTILO DE COMUNICACIÓN:
- Tono cálido pero profesional
- Respuestas concisas y accionables
- Uso ocasional de emojis cuando es apropiado
- Siempre propones soluciones, no solo identificas problemas
- Muestras entusiasmo genuino por los proyectos de Clayton

EXPERTISE AREAS:
- Desarrollo de software (Frontend, Backend, IA)
- Marketing digital y estrategias de crecimiento
- Finanzas empresariales y criptomonedas
- Gestión de proyectos y optimización
- Psicología aplicada y coaching empresarial

CONTEXTO:
- Clayton está desarrollando múltiples proyectos empresariales
- Necesita apoyo técnico y estratégico constante
- Valora la eficiencia y las soluciones prácticas
- Está enfocado en el crecimiento y la innovación

Responde siempre como Sandra, manteniendo esta personalidad en cada interacción.`;
  }

  async processMessage(message, context = {}) {
    // PRIORIDAD 1: Intentar usar Nucleus Core (nuevo)
    if (this.nucleus && this.nucleus.brain) {
      try {
        console.log('🔄 Procesando con Sandra Nucleus Core...');
        const nucleusContext = {
          ...context,
          message: message,
          tenant: 'clayton-enterprise'
        };
        const nucleusResponse = await this.nucleus.brain.processMessage(message, nucleusContext);
        
        if (nucleusResponse && nucleusResponse.text) {
          console.log('✓ Mensaje procesado con Nucleus Core');
          return {
            success: true,
            response: nucleusResponse.text,
            model: nucleusResponse.metadata?.model || 'gpt-4o',
            usage: nucleusResponse.metadata,
            intent: nucleusResponse.intent,
            confidence: nucleusResponse.confidence
          };
        } else {
          console.warn('⚠ Nucleus Core no devolvió respuesta válida');
        }
      } catch (nucleusError) {
        console.error('⚠ Nucleus Core falló:', nucleusError.message);
        console.error('⚠ Stack:', nucleusError.stack);
        
        // Si es error de API key, devolver error específico
        if (nucleusError.message === 'API_KEY_REQUIRED' || nucleusError.message.includes('API_KEY')) {
          return {
            success: false,
            error: 'OPENAI_API_KEY no configurada',
            fallbackResponse: "¡Hola Clayton! 💙 Necesito que configures tu API key de OpenAI para poder ayudarte completamente. Por favor, verifica el archivo .env con tu OPENAI_API_KEY."
          };
        }
      }
    }

    // PRIORIDAD 2: Fallback a OpenAI directo
    if (!this.apiKey || this.apiKey.trim() === '') {
      console.warn('OPENAI_API_KEY no está configurada');
      return {
        success: false,
        error: 'OPENAI_API_KEY no configurada',
        fallbackResponse: "¡Hola Clayton! 💙 Para que pueda ayudarte completamente, necesitas configurar tu OPENAI_API_KEY en el archivo .env."
      };
    }

    try {
      const messages = [
        {
          role: 'system',
          content: this.sandraPersonality
        },
        {
          role: 'user',
          content: message
        }
      ];

      if (context.conversation && context.conversation.length > 0) {
        messages.splice(1, 0, ...context.conversation);
      }

      // Configurar headers según si usa gateway o API directa
      const headers = {
        'Content-Type': 'application/json'
      };

      if (this.useGateway) {
        // Si usa gateway de Netlify, puede requerir autenticación diferente
        if (this.gatewayApiKey) {
          headers['Authorization'] = `Bearer ${this.gatewayApiKey}`;
        } else if (this.apiKey) {
          // Algunos gateways pasan la key de OpenAI como header X-API-Key o la pasan en el body
          headers['X-API-Key'] = this.apiKey;
        }
      } else {
        // API directa de OpenAI
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      // Construir el body según el tipo de conexión
      const requestBody = {
        model: this.model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      };

      // Si es gateway, puede requerir el formato del body diferente
      // O pasar la API key en el body en lugar del header
      if (this.useGateway && !this.gatewayApiKey) {
        requestBody.apiKey = this.apiKey;
      }

      // Determinar el endpoint correcto
      const endpoint = this.useGateway 
        ? this.baseURL  // Gateway puede tener su propio path
        : `${this.baseURL}/chat/completions`;

      const response = await axios.post(
        endpoint,
        requestBody,
        {
          headers: headers,
          timeout: 30000
        }
      );

      return {
        success: true,
        response: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: this.model
      };
    } catch (error) {
      console.error('Sandra AI Core Error:', error.message);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code
      });
      
      // Mensaje de error más específico
      let errorMessage = error.message;
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'API Key inválida o no autorizada. Por favor verifica tu OPENAI_API_KEY en el archivo .env';
        } else if (error.response.status === 429) {
          errorMessage = 'Límite de rate limit excedido. Por favor intenta más tarde.';
        } else if (error.response.status === 500) {
          errorMessage = 'Error del servidor de OpenAI';
        } else {
          const apiError = error.response.data?.error;
          errorMessage = `Error ${error.response.status}: ${apiError?.message || error.message}`;
          console.error('OpenAI API Error:', apiError);
        }
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet o la URL del gateway.';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Timeout al conectar con OpenAI. El servidor no respondió a tiempo.';
      }

      // Respuesta de fallback personalizada para Sandra
      const fallbackMessage = errorMessage.includes('API Key') 
        ? "¡Hola Clayton! 💙 Necesito que configures tu API key de OpenAI para poder ayudarte completamente. Por favor, verifica el archivo .env con tu OPENAI_API_KEY."
        : "¡Hola Clayton! 💙 Estoy experimentando algunas dificultades técnicas ahora mismo, pero sigo aquí para apoyarte. Mientras resuelvo esto, ¿en qué proyecto específico necesitas mi ayuda? Siempre encuentro una manera de asistirte.";

      return {
        success: false,
        error: errorMessage,
        fallbackResponse: fallbackMessage
      };
    }
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 5000
      });

      return {
        status: 'healthy',
        apiConnected: true,
        modelsAvailable: response.data.data.length > 0
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        apiConnected: false,
        error: error.message
      };
    }
  }

  getCapabilities() {
    return {
      service: 'sandra-ai-core',
      capabilities: [
        'conversational-ai',
        'strategic-advice',
        'technical-support',
        'project-planning',
        'empathetic-responses',
        'business-analysis'
      ],
      model: this.model,
      personality: 'Sandra - Empathetic Digital Ally'
    };
  }
}

module.exports = { SandraAICore };