export default async function handler(req, res) {
  const method = req.method || 'GET';
  if (!['GET', 'POST', 'HEAD'].includes(method)) {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (method === 'HEAD') {
    return res.status(200).end();
  }

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({ ok: true, msg: 'Leads sync placeholder' });
}
