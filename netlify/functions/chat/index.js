// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - MULTI-MODEL CHAT ENDPOINT (CLOUD TIER)
// Tier 1: GROQ Mixtral (Gratis)
// Tier 2: Claude Haiku (Gratis - Backup)
// Tier 3: GPT-4o (Pagado - Fallback final)
// ENHANCED: 18 ROLES SYSTEM + ADN BASE
// ═══════════════════════════════════════════════════════════════════

const config = require('../shared/config');

/**
 * Call GROQ API with role-specific prompt
 */
async function callGROQ(msgs, role = 'guests-valencia') {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  // Obtener prompt según rol
  const systemPrompt = config.sandraPrompt.getRolePrompt(role);

  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: systemPrompt },
        ...msgs.filter(m => m.role !== 'system')
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`GROQ error ${resp.status}: ${errorText}`);
  }

  const data = await resp.json();
  return { text: data.choices?.[0]?.message?.content?.trim() || 'No response', provider: 'GROQ', role };
}

/**
 * Call Claude Haiku with role-specific prompt
 */
async function callClaudeHaiku(msgs, role = 'guests-valencia') {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  // Obtener prompt según rol
  const systemPrompt = config.sandraPrompt.getRolePrompt(role);

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      system: systemPrompt,
      messages: msgs.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
    })
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Claude error ${resp.status}: ${errorText}`);
  }

  const data = await resp.json();
  return { text: data.content?.[0]?.text?.trim() || 'No response', provider: 'Claude Haiku', role };
}

/**
 * Call OpenAI GPT-4o with role-specific prompt
 */
async function callOpenAI(msgs, role = 'guests-valencia') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  // Obtener prompt según rol
  const systemPrompt = config.sandraPrompt.getRolePrompt(role);

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...msgs.filter(m => m.role !== 'system')
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`OpenAI error ${resp.status}: ${errorText}`);
  }

  const data = await resp.json();
  return { text: data.choices?.[0]?.message?.content?.trim() || 'No response', provider: 'GPT-4o', role };
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
      role = 'guests-valencia'
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

    // MULTI-MODEL FALLBACK CHAIN
    try {
      console.log(`🤖 Intentando GROQ Tier 1 with role: ${body.role}...`);
      result = await callGROQ(msgs, body.role);
      console.log('✅ GROQ respondió exitosamente');
    } catch (groqError) {
      console.warn('⚠️ GROQ falló:', groqError.message);
      try {
        console.log(`🤖 Intentando Claude Haiku Tier 2 with role: ${body.role}...`);
        result = await callClaudeHaiku(msgs, body.role);
        console.log('✅ Claude Haiku respondió exitosamente');
      } catch (claudeError) {
        console.warn('⚠️ Claude Haiku falló:', claudeError.message);
        try {
          console.log(`🤖 Intentando GPT-4o Tier 3 with role: ${body.role}...`);
          result = await callOpenAI(msgs, body.role);
          console.log('✅ GPT-4o respondió exitosamente');
        } catch (openaiError) {
          console.error('❌ Todos los modelos fallaron:', openaiError.message);
          throw new Error('All LLM providers failed');
        }
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
