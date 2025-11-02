const CRON_PROMPT =
  'Genera 3 ideas para captar propietarios y 3 para captar clientes de alquiler vacacional en Valencia, tono cercano.';

let openaiClientPromise = null;

async function getOpenAIClient() {
  if (!openaiClientPromise) {
    openaiClientPromise = import('openai').then(({ default: OpenAI }) => {
      return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    });
  }
  return openaiClientPromise;
}

function validateMethod(method) {
  return ['GET', 'POST', 'HEAD'].includes(method);
}

export default async function handler(req, res) {
  const method = req.method || 'GET';
  if (!validateMethod(method)) {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (method === 'HEAD') {
    return res.status(200).end();
  }

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const client = await getOpenAIClient();
    const model = process.env.OPENAI_MODEL_DEFAULT || 'gpt-4o';
    const response = await client.responses.create({ model, input: CRON_PROMPT });
    const ideas = (response?.output_text || '').trim();

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ ok: true, model, ideas });
  } catch (error) {
    console.error('[campaigns-daily] cron failed', error);
    const message = error?.message || 'Unexpected error while generating campaign ideas';
    return res.status(500).json({ ok: false, error: message });
  }
}
