let openaiClientPromise = null;

async function getOpenAIClient() {
  if (!openaiClientPromise) {
    openaiClientPromise = import('openai').then(({ default: OpenAI }) => {
      return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    });
  }
  return openaiClientPromise;
}

function handleCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}

export default async function handler(req, res) {
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { messages = [] } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    const client = await getOpenAIClient();
    const model = process.env.OPENAI_MODEL_DEFAULT || 'gpt-4o';
    const response = await client.responses.create({ model, input: messages });
    const reply = (response?.output_text || '').trim();

    if (!reply) {
      throw new Error('Empty response from OpenAI');
    }

    return res.status(200).json({ reply, model });
  } catch (error) {
    console.error('[sandra/chat] error', error);
    return res.status(500).json({ error: error?.message || 'Unexpected error' });
  }
}
