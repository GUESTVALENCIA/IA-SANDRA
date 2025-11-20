/**
 * Script para configurar secrets de Vercel en GitHub
 * Usa los tokens disponibles para configurar todo automáticamente
 */

const axios = require('axios');
const { execSync } = require('child_process');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const REPO = 'GUESTVALENCIA/IA-SANDRA';

// GitHub API para crear secrets (requiere GitHub CLI o API con permisos especiales)
// Nota: GitHub Secrets API requiere permisos de admin del repo
// Usaremos GitHub CLI si está disponible, o mostraremos instrucciones

async function getVercelInfo() {
  try {
    // Obtener info del usuario
    const userRes = await axios.get('https://api.vercel.com/v2/user', {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
    });
    
    // Obtener teams/orgs
    const teamsRes = await axios.get('https://api.vercel.com/v2/teams', {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
    });
    
    const orgId = teamsRes.data.teams?.[0]?.id || userRes.data.user.id;
    
    // Listar proyectos
    const projectsRes = await axios.get(`https://api.vercel.com/v9/projects?teamId=${orgId}`, {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
    });
    
    // Buscar o crear proyecto guests-pwa
    let project = projectsRes.data.projects?.find(p => p.name === 'guests-pwa');
    
    if (!project) {
      // Crear proyecto
      console.log('📦 Creando proyecto guests-pwa en Vercel...');
      const createRes = await axios.post(
        `https://api.vercel.com/v9/projects?teamId=${orgId}`,
        {
          name: 'guests-pwa',
          framework: 'vite'
        },
        {
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      project = createRes.data;
      console.log('✅ Proyecto creado:', project.id);
    }
    
    return {
      orgId,
      projectId: project.id,
      projectName: project.name
    };
  } catch (e) {
    console.error('Error obteniendo info de Vercel:', e.response?.data || e.message);
    throw e;
  }
}

async function configureGitHubSecrets(vercelInfo) {
  console.log('\n📝 Configurando secrets en GitHub...');
  console.log('⚠️  Nota: GitHub Secrets API requiere permisos de admin.');
  console.log('   Los secrets deben configurarse manualmente o con GitHub CLI.\n');
  
  console.log('Secrets necesarios:');
  console.log(`  VERCEL_TOKEN=${VERCEL_TOKEN}`);
  console.log(`  VERCEL_ORG_ID=${vercelInfo.orgId}`);
  console.log(`  VERCEL_PROJECT_ID=${vercelInfo.projectId}\n`);
  
  // Intentar con GitHub CLI si está disponible
  try {
    execSync('gh --version', { stdio: 'ignore' });
    console.log('✅ GitHub CLI detectado. Configurando secrets...\n');
    
    execSync(`gh secret set VERCEL_TOKEN --body "${VERCEL_TOKEN}" --repo ${REPO}`, { stdio: 'inherit' });
    execSync(`gh secret set VERCEL_ORG_ID --body "${vercelInfo.orgId}" --repo ${REPO}`, { stdio: 'inherit' });
    execSync(`gh secret set VERCEL_PROJECT_ID --body "${vercelInfo.projectId}" --repo ${REPO}`, { stdio: 'inherit' });
    
    console.log('\n✅ Secrets configurados en GitHub');
  } catch (e) {
    console.log('⚠️  GitHub CLI no disponible. Configura manualmente:');
    console.log(`   https://github.com/${REPO}/settings/secrets/actions\n`);
  }
}

async function configureDNS(vercelInfo) {
  console.log('\n🌐 Configurando DNS...');
  console.log('   Para configurar DNS, necesitas:');
  console.log('   1. Tu dominio (ej: piensasolution.com)');
  console.log('   2. Agregar el dominio en Vercel Dashboard');
  console.log('   3. Configurar los registros DNS según Vercel indique\n');
  
  // Intentar listar dominios existentes
  try {
    const domainsRes = await axios.get(
      `https://api.vercel.com/v5/domains?teamId=${vercelInfo.orgId}`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );
    
    if (domainsRes.data.domains?.length > 0) {
      console.log('Dominios configurados:');
      domainsRes.data.domains.forEach(d => {
        console.log(`  - ${d.name}`);
      });
    }
  } catch (e) {
    // Ignorar si no hay permisos
  }
}

async function main() {
  console.log('🚀 Configurando Vercel para Guests-PWA\n');
  
  if (!GITHUB_TOKEN || !VERCEL_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN y VERCEL_TOKEN deben estar configurados');
    console.error('   Usa: GITHUB_TOKEN=xxx VERCEL_TOKEN=xxx node scripts/setup-vercel-secrets.js');
    process.exit(1);
  }
  
  try {
    const vercelInfo = await getVercelInfo();
    console.log('\n✅ Información de Vercel:');
    console.log(`   Org ID: ${vercelInfo.orgId}`);
    console.log(`   Project ID: ${vercelInfo.projectId}`);
    console.log(`   Project Name: ${vercelInfo.projectName}\n`);
    
    await configureGitHubSecrets(vercelInfo);
    await configureDNS(vercelInfo);
    
    console.log('\n✅ Configuración completada');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Verifica que los secrets estén en GitHub');
    console.log('   2. Haz push a main para activar el deploy');
    console.log('   3. Configura DNS cuando estés listo\n');
    
  } catch (e) {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  }
}

main();

