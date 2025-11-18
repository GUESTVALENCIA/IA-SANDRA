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

  async runModel({ provider, model, messages }) {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('messages_required');
    }
    const modelDef = this.resolveModel(model);
    const prov = this.ensureProvider(provider || modelDef.provider);

    if (prov && modelDef.provider === 'openai') {
      const url = `${prov.baseUrl}/chat/completions`;
      const body = {
        model: modelDef.apiModel,
        messages: messages.map((m) => ({
          role: m.role || 'user',
          content: m.content
        }))
      };
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${prov.apiKey}`
      };
      const res = await httpRequest({ method: 'POST', url, headers, body });
      const text =
        res?.choices?.[0]?.message?.content ??
        res?.choices?.[0]?.message?.text ??
        res?.choices?.[0]?.text ??
        '';
      return { provider: 'openai', model: modelDef.apiModel, text, raw: res };
    }

    if (prov && modelDef.provider === 'anthropic') {
      const url = `${prov.baseUrl}/messages`;
      const body = {
        model: modelDef.apiModel,
        max_tokens: 1024,
        messages: messages.map((m) => ({
          role: m.role || 'user',
          content: [{ type: 'text', text: String(m.content || '') }]
        }))
      };
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': prov.apiKey,
        'anthropic-version': '2023-06-01'
      };
      const res = await httpRequest({ method: 'POST', url, headers, body });
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


