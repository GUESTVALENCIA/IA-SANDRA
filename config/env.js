// config/env.js
const required = (name, def = undefined) => {
  const v = process.env[name] ?? def;
  if (v === undefined || v === '') {
    throw new Error(`[ENV] Falta la variable ${name}`);
  }
  return v;
};

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  // Claves de proveedores — pon las que uses realmente:
  OPENAI_API_KEY: required('OPENAI_API_KEY'),
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || null,
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY || null,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || null,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || null,
  NETLIFY_TOKEN: process.env.NETLIFY_TOKEN || null,
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || null,
  // DB si aplica:
  DATABASE_URL: process.env.DATABASE_URL || null,
};
