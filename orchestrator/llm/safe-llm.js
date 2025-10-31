/**
 * Safe LLM Module - Wrapper Seguro para LLMs
 * Proporciona validación y seguridad para llamadas a modelos de lenguaje
 */

const { guardianProtocol } = require('../guardian-protocol');

class SafeLLM {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.model = config.model || 'gpt-4o';
    this.maxTokens = config.maxTokens || 4000;
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
    
    // Validar API key
    if (!this.apiKey || this.apiKey.trim() === '') {
      console.warn('[SafeLLM] OPENAI_API_KEY not configured');
    }
  }

  /**
   * Llamada segura a la API de OpenAI con validación
   * @param {Array} messages - Mensajes para el modelo
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Respuesta del modelo
   */
  async call(messages, options = {}) {
    // Validar entrada
    const validation = this.validateInput(messages, options);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.error}`);
    }

    // Validar con Guardian Protocol
    const guardianValidation = guardianProtocol.validate(
      'safe-llm',
      'llm_call',
      { messages, model: this.model, maxTokens: this.maxTokens }
    );

    if (!guardianValidation.valid) {
      throw new Error(`Guardian validation failed: ${guardianValidation.error}`);
    }

    // Realizar llamada con retry logic
    let lastError;
    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const response = await this.executeCall(messages, options);
        return response;
      } catch (error) {
        lastError = error;
        if (attempt < this.retries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`LLM call failed after ${this.retries} attempts: ${lastError.message}`);
  }

  /**
   * Ejecutar llamada a la API
   */
  async executeCall(messages, options) {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const axios = require('axios');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.model,
        messages: messages,
        max_tokens: Math.min(options.maxTokens || this.maxTokens, 4000),
        temperature: options.temperature || 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      }
    );

    return {
      content: response.data.choices[0].message.content,
      model: response.data.model,
      usage: response.data.usage,
      finishReason: response.data.choices[0].finish_reason
    };
  }

  /**
   * Validar entrada antes de llamar al modelo
   */
  validateInput(messages, options) {
    // Verificar que messages sea un array
    if (!Array.isArray(messages) || messages.length === 0) {
      return { valid: false, error: 'Messages must be a non-empty array' };
    }

    // Verificar estructura de mensajes
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return { valid: false, error: 'Each message must have role and content' };
      }
      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        return { valid: false, error: `Invalid role: ${msg.role}` };
      }
      if (typeof msg.content !== 'string') {
        return { valid: false, error: 'Message content must be a string' };
      }
    }

    // Verificar tamaño total
    const totalLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    if (totalLength > 200000) { // ~200KB
      return { valid: false, error: 'Total message length exceeds limit' };
    }

    return { valid: true };
  }

  /**
   * Llamada simple con prompt de usuario
   */
  async prompt(userPrompt, systemPrompt = null) {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userPrompt });
    
    return await this.call(messages);
  }

  /**
   * Streaming (placeholder para futuro)
   */
  async stream(messages, options = {}) {
    throw new Error('Streaming not yet implemented');
  }
}

// Crear instancia por defecto
const safeLLM = new SafeLLM();

// Registrar con Guardian Protocol
guardianProtocol.registerAgent('safe-llm', {
  role: 'llm-wrapper',
  permissions: ['llm_call', 'read', 'write']
});

// Exportar
module.exports = { SafeLLM, safeLLM };

