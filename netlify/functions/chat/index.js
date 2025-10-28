exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const { messages = [], locale = process.env.DEFAULT_LOCALE || 'es-ES', mode = process.env.DEFAULT_MODE || 'dev' } = JSON.parse(event.body || '{}');

    const sys = { role: 'system', content: [
      'Eres Sandra, COO digital de GuestsValencia.',
      'Hablas con calidez, precisión y foco operativo.',
      'Responde en el idioma del usuario.',
      'Sé breve para TTS, más extensa si el usuario lo pide.'
    ].join(' ') };

    const msgs = [sys, ...messages].slice(-20);
    const provider = (mode || process.env.DEFAULT_MODE || 'dev').toLowerCase();

    let text = '...';
    if (provider === 'dev') {
      const apiKey = process.env.GROQ_API_KEY;
      const model = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
      if (!apiKey) throw new Error('Falta GROQ_API_KEY');
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method:'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ model, messages: msgs, temperature: 0.4 })
      });
      if (!resp.ok) throw new Error('GROQ error '+resp.status);
      const data = await resp.json();
      text = data.choices?.[0]?.message?.content?.trim() || '...';
    } else {
      const apiKey = process.env.OPENAI_API_KEY;
      const model = process.env.OPENAI_MODEL || 'gpt-4o';
      if (!apiKey) throw new Error('Falta OPENAI_API_KEY');
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method:'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ model, messages: msgs, temperature: 0.4 })
      });
      if (!resp.ok) throw new Error('OpenAI error '+resp.status);
      const data = await resp.json();
      text = data.choices?.[0]?.message?.content?.trim() || '...';
    }

    return { statusCode: 200, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
