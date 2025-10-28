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
    const provider = (mode || process.env.DEFAULT_MODE || 'dev').toLowerCase();

    let text = '...';
    try {
      if (provider === 'dev' || provider === null || provider === '') {
        // GROQ Dev
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error('GROQ_API_KEY not configured');

        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
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
        text = data.choices?.[0]?.message?.content?.trim() || 'No response from GROQ';
      } else {
        // OpenAI Prod
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
        text = data.choices?.[0]?.message?.content?.trim() || 'No response from OpenAI';
      }
    } catch (apiError) {
      console.error('API Error:', apiError.message);
      throw apiError;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text, provider, locale })
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
