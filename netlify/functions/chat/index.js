// SANDRA IA - MULTI-MODEL ARCHITECTURE
// Tier 1: GROQ Mixtral (Gratis)
// Tier 2: Claude Haiku (Gratis - Backup)
// Tier 3: GPT-4o (Pagado - Fallback final)

async function callGROQ(msgs) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
      messages: msgs,
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`GROQ error ${resp.status}: ${errorText}`);
  }

  const data = await resp.json();
  return { text: data.choices?.[0]?.message?.content?.trim() || 'No response', provider: 'GROQ' };
}

async function callClaudeHaiku(msgs) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

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
      system: 'Eres Sandra, asistente IA de GuestsValencia. Hablas con calidez, precisión y foco en ayudar. Responde en español, breve y clara. Sé empática y profesional.',
      messages: msgs.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
    })
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Claude error ${resp.status}: ${errorText}`);
  }

  const data = await resp.json();
  return { text: data.content?.[0]?.text?.trim() || 'No response', provider: 'Claude Haiku' };
}

async function callOpenAI(msgs) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: msgs,
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`OpenAI error ${resp.status}: ${errorText}`);
  }

  const data = await resp.json();
  return { text: data.choices?.[0]?.message?.content?.trim() || 'No response', provider: 'GPT-4o' };
}

exports.handler = async (event) => {
  try {
    // CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
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

    const { messages = [], locale = process.env.DEFAULT_LOCALE || 'es-ES', mode = process.env.DEFAULT_MODE || 'dev' } = body;

    if (!messages || messages.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No messages provided' }) };
    }

    const sys = { role: 'system', content: [
      'Eres Sandra, asistente IA de GuestsValencia.',
      'Hablas con calidez, precisión y foco en ayudar.',
      'Responde en español, breve y clara.',
      'Sé empática y profesional.'
    ].join(' ') };

    const msgs = [sys, ...messages].slice(-20);
    let result;

    // MULTI-MODEL FALLBACK CHAIN
    try {
      console.log('🤖 Intentando GROQ Tier 1...');
      result = await callGROQ(msgs);
      console.log('✅ GROQ respondió exitosamente');
    } catch (groqError) {
      console.warn('⚠️ GROQ falló:', groqError.message);
      try {
        console.log('🤖 Intentando Claude Haiku Tier 2...');
        result = await callClaudeHaiku(msgs);
        console.log('✅ Claude Haiku respondió exitosamente');
      } catch (claudeError) {
        console.warn('⚠️ Claude Haiku falló:', claudeError.message);
        try {
          console.log('🤖 Intentando GPT-4o Tier 3...');
          result = await callOpenAI(msgs);
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
      body: JSON.stringify({ text: result.text, provider: result.provider, locale })
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
