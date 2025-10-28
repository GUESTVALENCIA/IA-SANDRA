// SANDRA IA - LOCAL DEVELOPMENT ENDPOINT
// Usa Mistral 7B vía OLLAMA (localhost:11434)
// Solo para desarrollo local, NO para producción Netlify

async function callMistralLocal(msgs) {
  // OLLAMA debe estar corriendo: ollama serve
  const resp = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mistral:7b',
      messages: msgs.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
      stream: false
    })
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Mistral error ${resp.status}: ${errorText}`);
  }

  const data = await resp.json();
  return { text: data.message?.content?.trim() || 'No response', provider: 'Mistral 7B (Local)' };
}

exports.handler = async (event) => {
  try {
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

    const { messages = [], locale = 'es-ES' } = body;

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

    console.log('🎯 Local Mistral 7B endpoint called');
    const result = await callMistralLocal(msgs);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: result.text, provider: result.provider, locale, mode: 'LOCAL_DEV' })
    };
  } catch (error) {
    console.error('Local dev handler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message || 'Local endpoint error',
        text: 'Error local. Verifica que OLLAMA esté corriendo en localhost:11434'
      })
    };
  }
};
