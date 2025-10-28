const fetch = global.fetch;
async function elevenlabsTTS(text){
  const key = process.env.ELEVENLABS_API_KEY;
  const voice = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice) throw new Error('ElevenLabs no configurado');
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;
  const resp = await fetch(url, {
    method:'POST',
    headers:{ 'xi-api-key': key, 'accept':'audio/mpeg', 'Content-Type':'application/json' },
    body: JSON.stringify({ text, model_id:'eleven_multilingual_v2', optimize_streaming_latency:2 })
  });
  if (!resp.ok) throw new Error('ElevenLabs error '+resp.status);
  const buf = Buffer.from(await resp.arrayBuffer());
  return { mime:'audio/mpeg', buf };
}
async function cartesiaTTS(text){
  const key = process.env.CARTESIA_API_KEY;
  const voice = process.env.CARTESIA_VOICE_ID;
  if (!key || !voice) throw new Error('Cartesia no configurado');
  const resp = await fetch('https://api.cartesia.ai/tts/stream', {
    method:'POST',
    headers:{ 'x-api-key': key, 'Content-Type':'application/json', 'accept':'audio/mpeg' },
    body: JSON.stringify({ voice, text })
  });
  if (!resp.ok) throw new Error('Cartesia error '+resp.status);
  const buf = Buffer.from(await resp.arrayBuffer());
  return { mime: resp.headers.get('content-type') || 'audio/mpeg', buf };
}
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode:405, body:'Method Not Allowed' };
    const { text } = JSON.parse(event.body || '{}');
    if (!text) return { statusCode:400, body:'faltan parámetros' };
    let out;
    try { out = await elevenlabsTTS(text); }
    catch (e) { out = await cartesiaTTS(text); }
    const b64 = out.buf.toString('base64');
    return { statusCode:200, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ mime: out.mime, audioBase64: b64 }) };
  } catch (e) {
    return { statusCode:500, body: JSON.stringify({ error: e.message }) };
  }
};
