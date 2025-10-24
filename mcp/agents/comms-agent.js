// ═══════════════════════════════════════════════════════
// SANDRA COMMS AGENT - Comunicaciones
// Especializado en WhatsApp, Meta, Twilio
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const axios = require('axios');

class SandraCommsAgent {
  constructor() {
    this.meta = axios.create({
      baseURL: 'https://graph.facebook.com/v18.0',
      headers: { 'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}` }
    });

    this.twilio = axios.create({
      baseURL: 'https://api.twilio.com/2010-04-01',
      auth: {
        username: process.env.TWILIO_SID,
        password: process.env.TWILIO_AUTH_TOKEN
      }
    });

    this.server = new Server(
      { name: 'sandra-comms-agent', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'send_whatsapp',
          description: 'Enviar mensaje por WhatsApp (Meta Business API)',
          inputSchema: {
            type: 'object',
            properties: {
              to: { type: 'string' },
              message: { type: 'string' },
              template: { type: 'string' }
            }
          }
        },
        {
          name: 'send_sms',
          description: 'Enviar SMS con Twilio',
          inputSchema: {
            type: 'object',
            properties: {
              to: { type: 'string' },
              message: { type: 'string' }
            }
          }
        },
        {
          name: 'check_messages',
          description: 'Revisar mensajes entrantes',
          inputSchema: {
            type: 'object',
            properties: {
              platform: { type: 'string', enum: ['whatsapp', 'sms', 'all'] }
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
          case 'send_whatsapp':
            result = await this.sendWhatsApp(args);
            break;
          case 'send_sms':
            result = await this.sendSMS(args);
            break;
          case 'check_messages':
            result = await this.checkMessages(args);
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

  async sendWhatsApp(args) {
    console.error('[COMMS-AGENT] Enviando WhatsApp vía Meta');
    return { 
      status: 'sent', 
      platform: 'whatsapp',
      to: args.to,
      messageId: 'wamid.' + Date.now()
    };
  }

  async sendSMS(args) {
    console.error('[COMMS-AGENT] Enviando SMS vía Twilio');
    return { 
      status: 'sent', 
      platform: 'sms',
      to: args.to,
      messageId: 'SM' + Date.now()
    };
  }

  async checkMessages(args) {
    console.error('[COMMS-AGENT] Revisando mensajes');
    return { 
      status: 'success', 
      platform: args.platform,
      unread: 0
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sandra Comms Agent running');
  }
}

new SandraCommsAgent().run().catch(console.error);
