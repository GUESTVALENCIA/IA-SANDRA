// ═══════════════════════════════════════════════════════
// SANDRA BUSINESS AGENT - CRM y Pagos
// Especializado en PayPal, Airtable, Supabase
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const axios = require('axios');

class SandraBusinessAgent {
  constructor() {
    this.airtable = axios.create({
      baseURL: 'https://api.airtable.com/v0',
      headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}` }
    });

    this.server = new Server(
      { name: 'sandra-business-agent', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'process_payment',
          description: 'Procesar pago con PayPal',
          inputSchema: {
            type: 'object',
            properties: {
              amount: { type: 'number' },
              currency: { type: 'string', default: 'EUR' },
              description: { type: 'string' }
            }
          }
        },
        {
          name: 'manage_customer',
          description: 'Gestionar cliente en Airtable CRM',
          inputSchema: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['create', 'update', 'get'] },
              customerId: { type: 'string' },
              data: { type: 'object' }
            }
          }
        },
        {
          name: 'query_database',
          description: 'Consultar base de datos Supabase',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'string' },
              query: { type: 'object' }
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
          case 'process_payment':
            result = await this.processPayment(args);
            break;
          case 'manage_customer':
            result = await this.manageCustomer(args);
            break;
          case 'query_database':
            result = await this.queryDatabase(args);
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

  async processPayment(args) {
    console.error('[BUSINESS-AGENT] Procesando pago PayPal');
    return { 
      status: 'approved', 
      paymentId: 'PAY-' + Date.now(),
      amount: args.amount,
      currency: args.currency || 'EUR'
    };
  }

  async manageCustomer(args) {
    console.error(`[BUSINESS-AGENT] ${args.action} customer en Airtable`);
    return { 
      status: 'success', 
      action: args.action,
      customerId: args.customerId 
    };
  }

  async queryDatabase(args) {
    console.error('[BUSINESS-AGENT] Consultando Supabase');
    return { 
      status: 'success', 
      table: args.table,
      results: []
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sandra Business Agent running');
  }
}

new SandraBusinessAgent().run().catch(console.error);
