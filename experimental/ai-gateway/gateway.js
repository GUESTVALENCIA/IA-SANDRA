'use strict';

const https = require('https');
const http = require('http');

/**
 * AI Gateway - Llamadas directas a OpenAI y Anthropic
 * SIN tocar roles, sin subagentes, sin complicaciones
 */
class AIGateway {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.anthropicKey = process.env.ANTHROPIC_API_KEY;
  }

  /**
   * Lista modelos disponibles
   */
  listModels() {
    return {
      openai: [
        { alias: 'gpt-4.0', apiModel: 'gpt-4o', description: 'GPT-4o general purpose' },
        { alias: 'gpt-5-mini', apiModel: 'gpt-4o-mini', description: 'GPT-5 Mini (rápido, económico)' },
        { alias: 'gpt-5.1-thinking', apiModel: 'gpt-4o', description: 'GPT-5.1 Thinking (razonamiento)' },
        { alias: 'gpt-5', apiModel: 'gpt-4o', description: 'GPT-5 (alias para 4o)' },
        { alias: 'o3', apiModel: 'o3', description: 'O3' },
        { alias: 'o3-pro', apiModel: 'o3-pro', description: 'O3 Pro' }
      ],
      anthropic: [
        { alias: 'claude-sonnet-3.7', apiModel: 'claude-3-5-sonnet-20240620', description: 'Claude 3.5 Sonnet' },
        { alias: 'claude-haiku-thinking', apiModel: 'claude-3-haiku-20240307', description: 'Claude 3 Haiku (rápido, económico)' },
        { alias: 'claude-opus-4.1', apiModel: 'claude-3-opus-20240229', description: 'Claude 3 Opus (razonamiento avanzado)' },
        { alias: 'claude-sonnet-4.5', apiModel: 'claude-3-5-sonnet-20240620', description: 'Claude 3.5 Sonnet (alias)' }
      ]
    };
  }

  /**
   * Llama a OpenAI
   */
  async callOpenAI(model, messages) {
    if (!this.openaiKey) {
      throw new Error('OPENAI_API_KEY no configurada en .env.pro');
    }

    const body = JSON.stringify({
      model,
      messages: messages.map(m => ({
        role: m.role || 'user',
        content: m.content
      }))
    });

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          method: 'POST',
          hostname: 'api.openai.com',
          path: '/v1/chat/completions',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openaiKey}`
          }
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                const text = parsed?.choices?.[0]?.message?.content || '';
                resolve({ success: true, text, raw: parsed });
              } else {
                reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}`));
              }
            } catch (e) {
              reject(new Error(`Parse error: ${e.message}`));
            }
          });
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  /**
   * Llama a Anthropic
   */
  async callAnthropic(model, messages) {
    if (!this.anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY no configurada en .env.pro');
    }

    const body = JSON.stringify({
      model,
      max_tokens: 4096,
      messages: messages.map(m => ({
        role: m.role || 'user',
        content: typeof m.content === 'string' 
          ? [{ type: 'text', text: m.content }]
          : m.content
      }))
    });

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          method: 'POST',
          hostname: 'api.anthropic.com',
          path: '/v1/messages',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.anthropicKey,
            'anthropic-version': '2023-06-01'
          }
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                const text = parsed?.content?.[0]?.text || '';
                resolve({ success: true, text, raw: parsed });
              } else {
                reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}`));
              }
            } catch (e) {
              reject(new Error(`Parse error: ${e.message}`));
            }
          });
        }
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  /**
   * Llama a un modelo (unifica OpenAI y Anthropic)
   */
  async chat({ provider, model, messages }) {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('messages debe ser un array no vacío');
    }

    // Resolver modelo real
    const models = this.listModels();
    const providerModels = models[provider];
    if (!providerModels) {
      throw new Error(`Provider desconocido: ${provider}`);
    }

    const modelDef = providerModels.find(m => m.alias === model);
    if (!modelDef) {
      throw new Error(`Modelo ${model} no encontrado en ${provider}`);
    }

    const apiModel = modelDef.apiModel;

    if (provider === 'openai') {
      return await this.callOpenAI(apiModel, messages);
    } else if (provider === 'anthropic') {
      return await this.callAnthropic(apiModel, messages);
    } else {
      throw new Error(`Provider no soportado: ${provider}`);
    }
  }
}

module.exports = new AIGateway();

