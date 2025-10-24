// ═══════════════════════════════════════════════════════
// SANDRA AI AGENT - Razonamiento Avanzado
// Especializado en Anthropic Claude, OpenAI GPT, Groq
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const Groq = require('groq-sdk');

class SandraAIAgent {
  constructor() {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    this.server = new Server(
      { name: 'sandra-ai-agent', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'deep_reasoning',
          description: 'Razonamiento profundo con Claude Sonnet 4.5',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              context: { type: 'array' }
            }
          }
        },
        {
          name: 'quick_response',
          description: 'Respuesta rápida con GPT-4o',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              temperature: { type: 'number', default: 0.7 }
            }
          }
        },
        {
          name: 'fast_inference',
          description: 'Inferencia acelerada con Groq',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              model: { type: 'string', default: 'llama3-70b-8192' }
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
          case 'deep_reasoning':
            result = await this.deepReasoning(args);
            break;
          case 'quick_response':
            result = await this.quickResponse(args);
            break;
          case 'fast_inference':
            result = await this.fastInference(args);
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

  async deepReasoning(args) {
    console.error('[AI-AGENT] Razonamiento profundo con Claude');
    const response = await this.anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{ role: 'user', content: args.query }]
    });
    return { provider: 'anthropic', response: response.content[0].text };
  }

  async quickResponse(args) {
    console.error('[AI-AGENT] Respuesta rápida con GPT-4o');
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: args.query }],
      temperature: args.temperature || 0.7
    });
    return { provider: 'openai', response: response.choices[0].message.content };
  }

  async fastInference(args) {
    console.error('[AI-AGENT] Inferencia rápida con Groq');
    const response = await this.groq.chat.completions.create({
      model: args.model || 'llama3-70b-8192',
      messages: [{ role: 'user', content: args.query }]
    });
    return { provider: 'groq', response: response.choices[0].message.content };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sandra AI Agent running');
  }
}

new SandraAIAgent().run().catch(console.error);
