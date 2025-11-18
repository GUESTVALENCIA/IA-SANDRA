'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

function loadModelRegistry() {
  const p = path.resolve(__dirname, '..', 'config', 'model-registry.json');
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`model_registry_load_error: ${e.message}`);
  }
}

function httpRequest({ method, url, headers, body }) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        method,
        hostname: u.hostname,
        path: u.pathname + (u.search || ''),
        headers
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
            }
          } catch (e) {
            if (res.statusCode >= 200 && res.statusCode < 300) return resolve({ raw: data });
            reject(new Error(`http_parse_error: ${e.message}`));
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

class AIGateway {
  constructor() {
    this.registry = loadModelRegistry();
  }

  listModels() {
    return Object.entries(this.registry.models).map(([key, def]) => ({
      key,
      displayName: def.displayName,
      provider: def.provider,
      apiModel: def.apiModel,
      capabilities: def.capabilities || []
    }));
  }

  resolveModel(modelKeyOrId) {
    const entry = this.registry.models[modelKeyOrId] || null;
    if (entry) return { key: modelKeyOrId, ...entry };
    // fallback: if they pass a raw id that matches apiModel
    const found = Object.entries(this.registry.models).find(([, v]) => v.apiModel === modelKeyOrId);
    if (found) return { key: found[0], ...found[1] };
    throw new Error(`unknown_model: ${modelKeyOrId}`);
  }

  ensureProvider(provider) {
    const p = this.registry.providers[provider];
    if (!p) throw new Error(`unknown_provider: ${provider}`);
    const envKey = p.envKey;
    const apiKey = process.env[envKey];
    if (!apiKey) throw new Error(`missing_api_key: set ${envKey} in environment`);
    return { ...p, apiKey };
  }

  getMCPTools() {
    // Herramientas MCP disponibles para los modelos
    return [
      {
        type: 'function',
        function: {
          name: 'filesystem_read',
          description: 'Lee el contenido de un archivo del sistema',
          parameters: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Ruta del archivo a leer (relativa o absoluta)' }
            },
            required: ['path']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'filesystem_write',
          description: 'Escribe contenido en un archivo del sistema',
          parameters: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Ruta del archivo' },
              content: { type: 'string', description: 'Contenido a escribir' }
            },
            required: ['path', 'content']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'filesystem_list',
          description: 'Lista archivos y carpetas en un directorio',
          parameters: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Ruta del directorio' }
            },
            required: ['path']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'git_status',
          description: 'Obtiene el estado actual del repositorio Git',
          parameters: { type: 'object', properties: {} }
        }
      },
      {
        type: 'function',
        function: {
          name: 'git_commit',
          description: 'Hace un commit de los cambios actuales',
          parameters: {
            type: 'object',
            properties: {
              message: { type: 'string', description: 'Mensaje del commit' }
            },
            required: ['message']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'http_fetch',
          description: 'Hace una petición HTTP GET o POST',
          parameters: {
            type: 'object',
            properties: {
              url: { type: 'string', description: 'URL completa' },
              method: { type: 'string', enum: ['GET', 'POST'], description: 'Método HTTP' },
              body: { type: 'object', description: 'Body para POST (opcional)' }
            },
            required: ['url']
          }
        }
      }
    ];
  }

  async invokeMCPTool(toolName, args) {
    // Llamar al MCP local en http://localhost:3000/api/tools/invoke
    try {
      const url = 'http://localhost:3000/api/tools/invoke';
      const body = { tool: toolName, arguments: args };
      const headers = { 'Content-Type': 'application/json' };
      
      // Usar http en lugar de https para localhost
      const http = require('http');
      return new Promise((resolve, reject) => {
        const req = http.request(
          {
            method: 'POST',
            hostname: 'localhost',
            port: 3000,
            path: '/api/tools/invoke',
            headers
          },
          (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => {
              try {
                const parsed = data ? JSON.parse(data) : {};
                resolve(parsed);
              } catch (e) {
                resolve({ result: data });
              }
            });
          }
        );
        req.on('error', reject);
        req.write(JSON.stringify(body));
        req.end();
      });
    } catch (e) {
      console.error(`[MCP Tool] Error invoking ${toolName}:`, e);
      return { error: e.message };
    }
  }

  async runModel({ provider, model, messages, tools }) {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('messages_required');
    }
    const modelDef = this.resolveModel(model);
    const prov = this.ensureProvider(provider || modelDef.provider);

    // Incluir herramientas MCP si el modelo las soporta
    const supportsTools = modelDef.capabilities?.includes('tools');
    const mcpTools = supportsTools ? this.getMCPTools() : [];

    if (prov && modelDef.provider === 'openai') {
      const url = `${prov.baseUrl}/chat/completions`;
      const body = {
        model: modelDef.apiModel,
        messages: messages.map((m) => ({
          role: m.role || 'user',
          content: m.content
        }))
      };
      
      // Añadir tools si están disponibles
      if (mcpTools.length > 0) {
        body.tools = mcpTools;
        body.tool_choice = 'auto';
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${prov.apiKey}`
      };
      
      const res = await httpRequest({ method: 'POST', url, headers, body });
      
      // Si el modelo quiere usar herramientas, ejecutarlas
      const choice = res?.choices?.[0];
      if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
        const toolResults = [];
        for (const toolCall of choice.message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments || '{}');
          const result = await this.invokeMCPTool(toolName, toolArgs);
          toolResults.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: toolName,
            content: JSON.stringify(result)
          });
        }
        
        // Segunda llamada con los resultados de las herramientas
        const followUpMessages = [
          ...messages,
          choice.message,
          ...toolResults
        ];
        const followUpBody = {
          model: modelDef.apiModel,
          messages: followUpMessages
        };
        const followUpRes = await httpRequest({ method: 'POST', url, headers, body: followUpBody });
        const text =
          followUpRes?.choices?.[0]?.message?.content ??
          followUpRes?.choices?.[0]?.message?.text ??
          followUpRes?.choices?.[0]?.text ??
          '';
        return { provider: 'openai', model: modelDef.apiModel, text, raw: followUpRes };
      }
      
      const text =
        choice?.message?.content ??
        choice?.message?.text ??
        choice?.text ??
        '';
      return { provider: 'openai', model: modelDef.apiModel, text, raw: res };
    }

    if (prov && modelDef.provider === 'anthropic') {
      const url = `${prov.baseUrl}/messages`;
      const body = {
        model: modelDef.apiModel,
        max_tokens: 4096,
        messages: messages.map((m) => ({
          role: m.role || 'user',
          content: typeof m.content === 'string' 
            ? [{ type: 'text', text: m.content }]
            : m.content
        }))
      };
      
      // Añadir tools si están disponibles (formato Anthropic)
      if (mcpTools.length > 0) {
        body.tools = mcpTools.map(t => ({
          name: t.function.name,
          description: t.function.description,
          input_schema: t.function.parameters
        }));
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': prov.apiKey,
        'anthropic-version': '2023-06-01'
      };
      
      const res = await httpRequest({ method: 'POST', url, headers, body });
      
      // Si el modelo quiere usar herramientas
      if (res?.content && res.content.some(c => c.type === 'tool_use')) {
        const toolResults = [];
        for (const block of res.content) {
          if (block.type === 'tool_use') {
            const result = await this.invokeMCPTool(block.name, block.input);
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify(result)
            });
          }
        }
        
        // Segunda llamada con resultados
        const followUpMessages = [
          ...messages,
          { role: 'assistant', content: res.content },
          { role: 'user', content: toolResults }
        ];
        const followUpBody = {
          model: modelDef.apiModel,
          max_tokens: 4096,
          messages: followUpMessages
        };
        if (mcpTools.length > 0) {
          followUpBody.tools = body.tools;
        }
        const followUpRes = await httpRequest({ method: 'POST', url, headers, body: followUpBody });
        const text =
          followUpRes?.content?.[0]?.text ??
          followUpRes?.content?.[0]?.content?.[0]?.text ??
          '';
        return { provider: 'anthropic', model: modelDef.apiModel, text, raw: followUpRes };
      }
      
      const text =
        res?.content?.[0]?.text ??
        res?.content?.[0]?.content?.[0]?.text ??
        '';
      return { provider: 'anthropic', model: modelDef.apiModel, text, raw: res };
    }

    throw new Error(`unsupported_provider: ${provider || modelDef.provider}`);
  }
}

module.exports = new AIGateway();


