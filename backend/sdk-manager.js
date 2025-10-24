// ═══════════════════════════════════════════════════════
// SANDRA SDK MANAGER - Gestor Profesional de SDKs
// Inicialización y gestión centralizada de todos los SDKs
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const axios = require('axios');

class SDKManager {
  constructor() {
    this.sdks = {};
    this.initialized = false;
    this.initializeAllSDKs();
  }

  /**
   * Inicializa todos los SDKs disponibles
   */
  initializeAllSDKs() {
    console.log('🔧 Inicializando SDKs profesionales...\n');

    try {
      // SDK 1: Anthropic (Claude)
      this.sdks.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
      console.log('✅ Anthropic SDK inicializado');

      // SDK 2: OpenAI (GPT-4o)
      this.sdks.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      console.log('✅ OpenAI SDK inicializado');

      // SDK 3: HeyGen (Avatar)
      this.sdks.heygen = {
        apiKey: process.env.HEYGEN_API_KEY,
        avatarId: process.env.HEYGEN_AVATAR_ID,
        baseURL: 'https://api.heygen.com/v1'
      };
      console.log('✅ HeyGen SDK configurado');

      // SDK 4: ElevenLabs (Voz)
      this.sdks.elevenlabs = {
        apiKey: process.env.ELEVENLABS_API_KEY,
        voiceId: process.env.ELEVENLABS_VOICE_ID,
        baseURL: 'https://api.elevenlabs.io/v1'
      };
      console.log('✅ ElevenLabs SDK configurado');

      // SDK 5: Deepgram (Speech-to-Text)
      this.sdks.deepgram = {
        apiKey: process.env.DEEPGRAM_API_KEY,
        baseURL: 'https://api.deepgram.com/v1'
      };
      console.log('✅ Deepgram SDK configurado');

      // SDK 6: Groq (Inferencia GPU)
      this.sdks.groq = {
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL,
        baseURL: 'https://api.groq.com/openai/v1'
      };
      console.log('✅ Groq SDK configurado');

      // SDK 7: Cartesia (Voz en tiempo real)
      this.sdks.cartesia = {
        apiKey: process.env.CARTESIA_API_KEY,
        baseURL: 'https://api.cartesia.ai'
      };
      console.log('✅ Cartesia SDK configurado');

      // SDK 8: GitHub (Repositorios)
      this.sdks.github = {
        token: process.env.GITHUB_TOKEN,
        pat: process.env.GITHUB_PAT,
        baseURL: 'https://api.github.com'
      };
      console.log('✅ GitHub SDK configurado');

      // SDK 9: Netlify (Deploy)
      this.sdks.netlify = {
        token: process.env.NETLIFY_AUTH_TOKEN,
        siteSlug: process.env.NETLIFY_SITE_SLUG,
        baseURL: 'https://api.netlify.com/api/v1'
      };
      console.log('✅ Netlify SDK configurado');

      // SDK 10: PayPal (Pagos)
      this.sdks.paypal = {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        mode: process.env.PAYPAL_MODE,
        baseURL: process.env.PAYPAL_MODE === 'sandbox' 
          ? 'https://api-m.sandbox.paypal.com'
          : 'https://api-m.paypal.com'
      };
      console.log('✅ PayPal SDK configurado');

      // SDK 11: Supabase (Base de datos)
      this.sdks.supabase = {
        token: process.env.SUPABASE_TOKEN
      };
      console.log('✅ Supabase SDK configurado');

      // SDK 12: Airtable (CRM)
      this.sdks.airtable = {
        token: process.env.AIRTABLE_TOKEN,
        baseURL: 'https://api.airtable.com/v0'
      };
      console.log('✅ Airtable SDK configurado');

      // SDK 13: Twilio (SMS)
      this.sdks.twilio = {
        sid: process.env.TWILIO_SID,
        number: process.env.TWILIO_NUMBER
      };
      console.log('✅ Twilio SDK configurado');

      // SDK 14: Meta (WhatsApp Business)
      this.sdks.meta = {
        accessToken: process.env.META_ACCESS_TOKEN,
        phoneNumberId: process.env.META_PHONE_NUMBER_ID,
        baseURL: 'https://graph.facebook.com/v18.0'
      };
      console.log('✅ Meta SDK configurado');

      this.initialized = true;
      console.log('\n🎯 Todos los SDKs listos para uso profesional\n');

    } catch (error) {
      console.error('❌ Error inicializando SDKs:', error.message);
      throw error;
    }
  }

  /**
   * ANTHROPIC - Claude Sonnet 4.5 (Razonamiento profundo)
   */
  async claude(messages, options = {}) {
    const response = await this.sdks.anthropic.messages.create({
      model: options.model || 'claude-sonnet-4-5-20250929',
      max_tokens: options.maxTokens || 8192,
      system: options.system || 'Eres Sandra, IA profesional de GuestsValencia',
      messages
    });
    return response.content[0].text;
  }

  /**
   * OPENAI - GPT-4o (Conversación multimodal)
   */
  async gpt4o(messages, options = {}) {
    const response = await this.sdks.openai.chat.completions.create({
      model: options.model || 'gpt-4o',
      messages,
      temperature: options.temperature || 0.7
    });
    return response.choices[0].message.content;
  }

  /**
   * HEYGEN - Generar video con avatar
   */
  async generateAvatar(text, options = {}) {
    const response = await axios.post(
      `${this.sdks.heygen.baseURL}/video.generate`,
      {
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: this.sdks.heygen.avatarId
          },
          voice: {
            type: 'text',
            input_text: text,
            voice_id: options.voiceId
          }
        }]
      },
      {
        headers: {
          'X-Api-Key': this.sdks.heygen.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }

  /**
   * ELEVENLABS - Text to Speech
   */
  async textToSpeech(text, options = {}) {
    const response = await axios.post(
      `${this.sdks.elevenlabs.baseURL}/text-to-speech/${this.sdks.elevenlabs.voiceId}`,
      {
        text,
        model_id: options.model || 'eleven_multilingual_v2',
        voice_settings: options.voiceSettings || {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': this.sdks.elevenlabs.apiKey,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );
    return response.data;
  }

  /**
   * DEEPGRAM - Speech to Text
   */
  async speechToText(audioBuffer, options = {}) {
    const response = await axios.post(
      `${this.sdks.deepgram.baseURL}/listen`,
      audioBuffer,
      {
        headers: {
          'Authorization': `Token ${this.sdks.deepgram.apiKey}`,
          'Content-Type': 'audio/wav'
        },
        params: {
          language: options.language || 'es',
          model: options.model || 'nova-2'
        }
      }
    );
    return response.data.results.channels[0].alternatives[0].transcript;
  }

  /**
   * GROQ - Inferencia rápida GPU
   */
  async groqInference(prompt, options = {}) {
    const response = await axios.post(
      `${this.sdks.groq.baseURL}/chat/completions`,
      {
        model: this.sdks.groq.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${this.sdks.groq.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  }

  /**
   * GITHUB - Operaciones con repositorios
   */
  async githubRequest(endpoint, method = 'GET', data = null) {
    const response = await axios({
      method,
      url: `${this.sdks.github.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.sdks.github.token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      data
    });
    return response.data;
  }

  /**
   * NETLIFY - Deploy y gestión de sitios
   */
  async netlifyDeploy(siteData) {
    const response = await axios.post(
      `${this.sdks.netlify.baseURL}/sites`,
      siteData,
      {
        headers: {
          'Authorization': `Bearer ${this.sdks.netlify.token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }

  /**
   * PAYPAL - Crear orden de pago
   */
  async createPayPalOrder(orderData) {
    // Primero obtener access token
    const authResponse = await axios.post(
      `${this.sdks.paypal.baseURL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        auth: {
          username: this.sdks.paypal.clientId,
          password: this.sdks.paypal.clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = authResponse.data.access_token;

    // Crear orden
    const orderResponse = await axios.post(
      `${this.sdks.paypal.baseURL}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return orderResponse.data;
  }

  /**
   * META - Enviar mensaje WhatsApp
   */
  async sendWhatsAppMessage(to, message) {
    const response = await axios.post(
      `${this.sdks.meta.baseURL}/${this.sdks.meta.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.sdks.meta.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }

  /**
   * AIRTABLE - Query de base de datos
   */
  async airtableQuery(baseId, tableName, params = {}) {
    const response = await axios.get(
      `${this.sdks.airtable.baseURL}/${baseId}/${tableName}`,
      {
        headers: {
          'Authorization': `Bearer ${this.sdks.airtable.token}`
        },
        params
      }
    );
    return response.data.records;
  }

  /**
   * Obtiene el estado de todos los SDKs
   */
  getSDKStatus() {
    return {
      initialized: this.initialized,
      available: Object.keys(this.sdks).length,
      sdks: Object.keys(this.sdks).map(name => ({
        name,
        status: this.sdks[name] ? 'ready' : 'not configured'
      }))
    };
  }
}

module.exports = SDKManager;
