const REQUIRED_ENV_VARS = ['OPENAI_API_KEY', 'OPENAI_MODEL_DEFAULT', 'VERCEL_PROJECT_ID'];

function findMissingEnvVars() {
  return REQUIRED_ENV_VARS.filter((key) => {
    const value = process.env[key];
    return typeof value !== 'string' || value.trim() === '';
  });
}

export default async function handler(req, res) {
  const method = req.method || 'GET';
  if (!['GET', 'HEAD'].includes(method)) {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const missing = findMissingEnvVars();
  const payload = {
    ok: missing.length === 0,
    missing,
    now: new Date().toISOString()
  };

  if (method === 'HEAD') {
    return res.status(200).end();
  }

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(payload);
}
