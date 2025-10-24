// ═══════════════════════════════════════════════════════
// SANDRA VOICE AGENT - Avatar y Voz
// Especializado en HeyGen, ElevenLabs, Cartesia, Deepgram
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const axios = require('axios');

class SandraVoiceAgent {
  constructor() {
    this.heygen = axios.create({
      baseURL: 'https://api.heygen.com/v2',
      headers: { 'X-Api-Key': process.env.HEYGEN_API_KEY }
    });

    this.elevenlabs = axios.create({
      baseURL: 'https://api.elevenlabs.io/v1',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }
    });

    this.cartesia = axios.create({
      baseURL: 'https://api.cartesia.ai/tts',
      headers: { 'X-API-Key': process.env.CARTESIA_API_KEY }
    });

    this.deepgram = axios.create({
      baseURL: 'https://api.deepgram.com/v1',
      headers: { 'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}` }
    });

    this.server = new Server(
      { name: 'sandra-voice-agent', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'generate_avatar_video',
          description: 'Genera video con avatar HeyGen',
          inputSchema: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              avatarId: { type: 'string', default: process.env.HEYGEN_AVATAR_ID }
            },
            required: ['text']
          }
        },
        {
          name: 'text_to_speech',
          description: 'Convierte texto a voz (ElevenLabs)',
          inputSchema: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              voiceId: { type: 'string', default: process.env.ELEVENLABS_VOICE_ID }
            },
            required: ['text']
          }
        },
        {
          name: 'conversational_voice',
          description: 'Voz conversacional en tiempo real (Cartesia)',
          inputSchema: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              speed: { type: 'number', default: 1.0 }
            }
          }
        },
        {
          name: 'speech_to_text',
          description: 'Transcripción de audio (Deepgram)',
          inputSchema: {
            type: 'object',
            properties: {
              audioUrl: { type: 'string' },
              language: { type: 'string', default: 'es' }
            }
          }
        }
      ]
    }));

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        let result;
        switch (name) {
          case 'generate_avatar_video':
            result = await this.generateAvatarVideo(args);
            break;
          case 'text_to_speech':
            result = await this.textToSpeech(args);
            break;
          case 'conversational_voice':
            result = await this.conversationalVoice(args);
            break;
          case 'speech_to_text':
            result = await this.speechToText(args);
            break;
          default:
            throw new Error(`Tool not found: ${name}`);
        }
        
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: error.message }, null, 2) }],
          isError: true
        };
      }
    });
  }

  async generateAvatarVideo(args) {
    console.error('[VOICE-AGENT] Generando video HeyGen');
    return { 
      status: 'processing', 
      provider: 'heygen',
      avatarId: args.avatarId || process.env.HEYGEN_AVATAR_ID 
    };
  }

  async textToSpeech(args) {
    console.error('[VOICE-AGENT] Generando voz ElevenLabs');
    return { 
      status: 'generated', 
      provider: 'elevenlabs',
      voiceId: args.voiceId || process.env.ELEVENLABS_VOICE_ID
    };
  }

  async conversationalVoice(args) {
    console.error('[VOICE-AGENT] Voz conversacional Cartesia');
    return { status: 'streaming', provider: 'cartesia' };
  }

  async speechToText(args) {
    console.error('[VOICE-AGENT] Transcribiendo con Deepgram');
    return { status: 'transcribed', provider: 'deepgram', language: args.language };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sandra Voice Agent running');
  }
}

new SandraVoiceAgent().run().catch(console.error);
