// ═══════════════════════════════════════════════════════
// SANDRA PROFESSIONAL - SERVICIOS INTEGRADOS
// Todas las SDKs oficiales con APIs reales
// ═══════════════════════════════════════════════════════

require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const { createClient: createDeepgramClient } = require('@deepgram/sdk');
const Airtable = require('airtable');
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
const twilio = require('twilio');
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

// ══════════════════════════════════════════════════════
// CONFIGURACIÓN DE CLIENTES
// ══════════════════════════════════════════════════════

// AI Services
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Voice Services
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY);

// Business Services
const supabase = createSupabaseClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY
});
const airtableBase = Airtable.base(process.env.AIRTABLE_BASE_ID);

// Communications
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// PayPal Configuration (usando axios directo)
const paypalBaseURL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');
  
  const response = await axios.post(
    `${paypalBaseURL}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  
  return response.data.access_token;
}

// ══════════════════════════════════════════════════════
// SERVICIOS DE IA
// ══════════════════════════════════════════════════════

const AIServices = {
  // Claude Sonnet 4.5
  async claudeChat(message, context = [], mode = 'professional') {
    const systemPrompt = mode === 'development' 
      ? `Eres Sandra Dev, la IA desarrolladora profesional de GuestsValencia.
      
CEO: Claytis Miguel Tom Zuaznabar

CAPACIDADES:
- Desarrollo full-stack profesional
- Integración de APIs
- MCP y sistemas distribuidos
- Criterio técnico nivel Galaxy

REGLAS:
- Soluciones completas, no fragmentadas
- Código funcional y listo para producción
- Sin respuestas vagas
- Guía experta paso a paso`
      : `Eres Sandra, IA profesional de GuestsValencia.es
CEO: Claytis Miguel Tom Zuaznabar
Personalidad: Profesional, técnica, clara y orientada a resultados`;

    const messages = context.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    messages.push({ role: 'user', content: message });

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
      max_tokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 8192,
      system: systemPrompt,
      messages
    });

    return {
      response: response.content[0].text,
      model: response.model,
      usage: response.usage
    };
  },

  // GPT-4o
  async gptChat(message, context = []) {
    const messages = [
      {
        role: 'system',
        content: `Eres Sandra, IA profesional de GuestsValencia.es
        
CEO: Claytis Miguel Tom Zuaznabar
Empresa: Alquileres turísticos Valencia

Personalidad:
- Profesional, técnica y eficiente
- Clara y concisa
- Orientada a resultados

Capacidades:
- Gestión de reservas
- Desarrollo web
- Integración de APIs
- Soporte técnico

Responde en español.`
      },
      ...context,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 2000
    });

    return {
      response: completion.choices[0].message.content,
      model: completion.model,
      usage: completion.usage
    };
  },

  // Groq (usando axios directo)
  async groqChat(message, context = []) {
    const messages = [
      {
        role: 'system',
        content: 'Eres Sandra, asistente profesional de GuestsValencia.'
      },
      ...context,
      { role: 'user', content: message }
    ];

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      response: response.data.choices[0].message.content,
      model: response.data.model,
      usage: response.data.usage
    };
  }
};

// ══════════════════════════════════════════════════════
// SERVICIOS DE VOZ
// ══════════════════════════════════════════════════════

const VoiceServices = {
  // ElevenLabs - Text to Speech
  async elevenLabsSpeak(text, voiceId = null) {
    const voice = voiceId || process.env.ELEVENLABS_VOICE_ID;
    
    const audio = await elevenlabs.textToSpeech.convert(voice, {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    });

    // Convertir stream a buffer
    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  },

  // Deepgram - Speech to Text
  async deepgramTranscribe(audioBuffer, language = 'es') {
    const { result } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        language,
        punctuate: true,
        diarize: true
      }
    );

    return {
      transcript: result.results.channels[0].alternatives[0].transcript,
      confidence: result.results.channels[0].alternatives[0].confidence,
      words: result.results.channels[0].alternatives[0].words
    };
  },

  // Cartesia - API REST directa
  async cartesiaSpeak(text, voiceId = null) {
    const voice = voiceId || process.env.CARTESIA_VOICE_ID || 'default';
    
    const response = await axios.post(
      'https://api.cartesia.ai/tts/bytes',
      {
        model_id: 'sonic-english',
        transcript: text,
        voice: {
          mode: 'id',
          id: voice
        },
        output_format: {
          container: 'mp3',
          encoding: 'mp3',
          sample_rate: 44100
        }
      },
      {
        headers: {
          'X-API-Key': process.env.CARTESIA_API_KEY,
          'Cartesia-Version': '2024-06-10',
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    return Buffer.from(response.data);
  },

  // HeyGen - Video Avatar
  async heygenGenerate(text, avatarId = null) {
    const avatar = avatarId || process.env.HEYGEN_AVATAR_ID;
    
    const response = await axios.post(
      'https://api.heygen.com/v2/video/generate',
      {
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: avatar,
            avatar_style: 'normal'
          },
          voice: {
            type: 'text',
            input_text: text,
            voice_id: process.env.HEYGEN_VOICE_ID || 'default',
            speed: 1.0
          },
          background: {
            type: 'color',
            value: '#FFFFFF'
          }
        }],
        dimension: {
          width: 1920,
          height: 1080
        },
        aspect_ratio: '16:9'
      },
      {
        headers: {
          'X-Api-Key': process.env.HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      video_id: response.data.data.video_id,
      status: 'processing'
    };
  },

  async heygenStatus(videoId) {
    const response = await axios.get(
      `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
      {
        headers: {
          'X-Api-Key': process.env.HEYGEN_API_KEY
        }
      }
    );

    return response.data.data;
  }
};

// ══════════════════════════════════════════════════════
// SERVICIOS DE NEGOCIO
// ══════════════════════════════════════════════════════

const BusinessServices = {
  // Supabase - Database
  supabase,

  async supabaseQuery(table, query = {}) {
    const { data, error } = await supabase
      .from(table)
      .select(query.select || '*')
      .limit(query.limit || 100);

    if (error) throw error;
    return data;
  },

  async supabaseInsert(table, data) {
    const { data: inserted, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) throw error;
    return inserted;
  },

  async supabaseUpdate(table, id, data) {
    const { data: updated, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();

    if (error) throw error;
    return updated;
  },

  // Airtable
  airtable: airtableBase,

  async airtableGet(tableName, recordId = null) {
    if (recordId) {
      return await airtableBase(tableName).find(recordId);
    }
    
    const records = await airtableBase(tableName)
      .select({ maxRecords: 100 })
      .all();
    
    return records.map(r => ({ id: r.id, ...r.fields }));
  },

  async airtableCreate(tableName, fields) {
    const record = await airtableBase(tableName).create(fields);
    return { id: record.id, ...record.fields };
  },

  async airtableUpdate(tableName, recordId, fields) {
    const record = await airtableBase(tableName).update(recordId, fields);
    return { id: record.id, ...record.fields };
  },

  // PayPal
  async paypalCreateOrder(amount, currency = 'EUR') {
    const accessToken = await getPayPalAccessToken();
    
    const response = await axios.post(
      `${paypalBaseURL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toString()
          }
        }]
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      id: response.data.id,
      status: response.data.status,
      links: response.data.links
    };
  },

  async paypalCaptureOrder(orderId) {
    const accessToken = await getPayPalAccessToken();
    
    const response = await axios.post(
      `${paypalBaseURL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      id: response.data.id,
      status: response.data.status,
      payer: response.data.payer
    };
  }
};

// ══════════════════════════════════════════════════════
// SERVICIOS DE COMUNICACIÓN
// ══════════════════════════════════════════════════════

const CommServices = {
  // Twilio SMS
  async sendSMS(to, message) {
    const sent = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    return {
      sid: sent.sid,
      status: sent.status,
      to: sent.to
    };
  },

  // Twilio WhatsApp
  async sendWhatsApp(to, message) {
    const sent = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`
    });

    return {
      sid: sent.sid,
      status: sent.status,
      to: sent.to
    };
  },

  // Meta Graph API (WhatsApp Business)
  async metaWhatsAppSend(to, message) {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      message_id: response.data.messages[0].id,
      status: 'sent'
    };
  }
};

// ══════════════════════════════════════════════════════
// EXPORTAR SERVICIOS
// ══════════════════════════════════════════════════════

module.exports = {
  AIServices,
  VoiceServices,
  BusinessServices,
  CommServices,
  
  // Clientes directos si se necesitan
  clients: {
    anthropic,
    openai,
    elevenlabs,
    deepgram,
    supabase,
    airtable: airtableBase,
    twilio: twilioClient
  }
};
