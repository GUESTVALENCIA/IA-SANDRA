const { parseJsonSafe, repairJsonString } = require('./json-utils');
const logger = require('../backend/logger');
const metrics = require('../backend/metrics');

/**
 * Safe LLM wrapper with timeout, validation, repair and retry
 * Handles unparseable LLM responses by attempting to repair and retry
 */
async function safeLLM(prompt, options = {}) {
  const {
    timeout = 30000,
    retries = 1,
    systemMessage = "You are an assistant that outputs only JSON."
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      let messages;
      if (attempt === 0) {
        // First attempt with strict JSON instruction
        messages = [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ];
      } else {
        // Retry with fallback prompt strategy
        messages = [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt },
          { role: 'assistant', content: lastError.invalidResponse || 'Invalid JSON response' },
          { role: 'user', content: 'The previous response was invalid JSON. Please output a correct JSON only.' }
        ];

        // Increment retry counter
        metrics.incrementRetries();
      }

      // Make the LLM API call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messages,
          temperature: 0.1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in LLM response');
      }

      // Try to parse as JSON
      let parsed = parseJsonSafe(content);

      if (parsed === null) {
        // Try to repair the JSON
        const repairedJson = repairJsonString(content);
        parsed = parseJsonSafe(repairedJson);
      }

      if (parsed !== null) {
        // Success
        metrics.incrementLLMSuccess();
        logger.debug({ attempt, contentLength: content.length }, 'safeLLM successful');
        return parsed;
      } else {
        // Failed to parse even after repair
        lastError = new Error('Failed to parse LLM response as JSON');
        lastError.invalidResponse = content;
        throw lastError;
      }

    } catch (error) {
      lastError = error;
      logger.warn({ attempt, error: error.message }, 'safeLLM attempt failed');

      if (attempt === retries) {
        // Final attempt failed
        metrics.incrementLLMFailure();
        logger.error({ error: error.message, stack: error.stack }, 'safeLLM failed after all retries');
        throw error;
      }
    }
  }
}

module.exports = { safeLLM };