// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - CHAT ENDPOINT (FREE/LOCAL ONLY MODE)
// Orden: Ollama Qwen2.5:7b → Ollama Mistral:7b → Ollama Llama3.1:8b
// SIN GROQ / SIN Claude / SIN OpenAI en esta fase de pruebas
// ═══════════════════════════════════════════════════════════════════

const config = require('../shared/config');

// Ollama local
async function callOllama(model, msgs, role = 'guests-valencia') {
  const baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const systemPrompt = config.sandraPrompt.getRolePrompt(role);

  // Convertimos mensajes al formato de ollama/chat
  const ollamaMsgs = [
    { role: 'system', content: systemPrompt },
    ...msgs.filter(m => m.role !== 'system')
  ];

  const resp = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: ollamaMsgs,
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Ollama(${model}) ${resp.status}: ${txt}`);
  }

  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content?.trim() || 'No response';
  return { text, provider: `ollama:${model}`, role };
}

/**
 * Main handler
 */
exports.handler = async (event) => {
  try {
    // CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Sandra-Role'
    };

    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { 
      messages = [], 
      locale = process.env.DEFAULT_LOCALE || 'es-ES', 
      mode = process.env.DEFAULT_MODE || 'dev',
      role = 'guests-valencia',
      llm_mode = 'cloud'
    } = body;

    // Validar rol
    if (!config.sandraPrompt.isValidRole(role)) {
      console.warn('Invalid role provided, using default:', role);
      body.role = 'guests-valencia';
    }

    if (!messages || messages.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No messages provided' }) };
    }

    const msgs = messages.slice(-20);
    let result;

    // HYBRID: cloud (GROQ via gateway) | local (Ollama) | auto
    const modeSel = (llm_mode || '').toLowerCase();
    const tryLocal = async () => {
      try {
        console.log(`🤖 Ollama qwen2.5:7b`);
        return await callOllama('qwen2.5:7b', msgs, body.role);
      } catch (e1) {
        console.warn('⚠️ qwen2.5:7b falló:', e1.message);
        try {
          console.log(`🤖 Ollama mistral:7b`);
          return await callOllama('mistral:7b', msgs, body.role);
        } catch (e2) {
          console.warn('⚠️ mistral:7b falló:', e2.message);
          console.log(`🤖 Ollama llama3.1:8b`);
          return await callOllama('llama3.1:8b', msgs, body.role);
        }
      }
    };

    if (modeSel === 'local') {
      result = await tryLocal();
    } else if (modeSel === 'cloud') {
      // Cloud primario: GROQ via gateway (si en el futuro se habilita)
      throw new Error('Cloud mode disabled in current FREE/LOCAL build');
    } else { // auto
      try {
        result = await tryLocal();
      } catch {
        throw new Error('Auto: no local LLM available');
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        text: result.text, 
        provider: result.provider, 
        locale,
        role: result.role 
      })
    };
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message || 'Internal server error',
        text: 'Error en la API. Disculpa, reinténtalo en unos segundos.'
      })
    };
  }
};
