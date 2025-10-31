/**
 * Verificar variables de entorno críticas (para Netlify)
 * Falla con exit code 1 si falta alguna
 */

const requiredVars = [
  'OPENAI_API_KEY',
  'CARTESIA_API_KEY',
  'DEEPGRAM_API_KEY',
  'NODE_ENV',
  'ALLOWED_ORIGIN'
];

let missing = [];

requiredVars.forEach((key) => {
  if (!process.env[key] || process.env[key].trim() === '') {
    missing.push(key);
  }
});

if (missing.length > 0) {
  console.error('❌ Faltan variables de entorno críticas:', missing.join(', '));
  console.error('   Configúralas en Netlify Dashboard → Site settings → Environment variables');
  process.exit(1);
}

console.log('✅ Variables de entorno críticas presentes');
