/**
 * Script para hacer deploy manual a Vercel
 * Útil cuando el workflow de GitHub Actions no se ha ejecutado aún
 */

const { execSync } = require('child_process');
const path = require('path');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

if (!VERCEL_TOKEN || !VERCEL_ORG_ID || !VERCEL_PROJECT_ID) {
  console.error('❌ Variables de entorno requeridas:');
  console.error('   VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID');
  process.exit(1);
}

console.log('🚀 Iniciando deploy manual a Vercel...\n');

try {
  const pwaDir = path.join(__dirname, '..', 'guests-pwa');
  
  console.log('📦 Construyendo PWA...');
  execSync('npm run build', { 
    cwd: pwaDir, 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('\n📤 Desplegando a Vercel...');
  execSync(
    `npx vercel --prod --token ${VERCEL_TOKEN} --confirm --yes ` +
    `--project-id ${VERCEL_PROJECT_ID}`,
    {
      cwd: pwaDir,
      stdio: 'inherit',
      env: { ...process.env, VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID }
    }
  );
  
  console.log('\n✅ Deploy completado');
  console.log(`\n📱 Verifica en: https://vercel.com/guests-valencias-projects/guests-pwa/deployments\n`);
  
} catch (e) {
  console.error('\n❌ Error en deploy:', e.message);
  process.exit(1);
}

