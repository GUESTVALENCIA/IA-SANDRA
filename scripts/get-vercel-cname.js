/**
 * Script para obtener el valor CNAME de Vercel para www.guestsvalencia.es
 */

const axios = require('axios');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.pro') });

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || 'rTbbeIXzN70ZvXbG6L9Avj5d';
const VERCEL_PROJECT_ID = 'prj_HNCaiegvbQcqBHrV8kZwttlKrDPe';

const API_BASE = 'https://api.vercel.com/v9';

async function getDomains() {
  try {
    const response = await axios.get(
      `${API_BASE}/projects/${VERCEL_PROJECT_ID}/domains`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );
    return response.data.domains || [];
  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
    return [];
  }
}

async function getDeploymentInfo() {
  try {
    const response = await axios.get(
      'https://api.vercel.com/v6/deployments',
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
        params: {
          projectId: VERCEL_PROJECT_ID,
          limit: 1
        }
      }
    );
    
    if (response.data.deployments && response.data.deployments.length > 0) {
      return response.data.deployments[0];
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log('🔍 Obteniendo información de CNAME de Vercel\n');
  
  // Obtener dominios
  const domains = await getDomains();
  console.log('📋 Dominios configurados:');
  domains.forEach(d => {
    console.log(`   - ${d.name}`);
    if (d.verification) {
      console.log(`     Estado: ${d.verification.status}`);
    }
  });
  
  // Obtener información del deployment
  const deployment = await getDeploymentInfo();
  if (deployment) {
    console.log('\n📦 Último deployment:');
    console.log(`   URL: ${deployment.url}`);
    
    // Extraer el hash del dominio de Vercel
    const vercelDomain = deployment.url;
    const match = vercelDomain.match(/guestsvalencia-site-([a-z0-9]+)/);
    if (match) {
      console.log(`\n✅ Valor CNAME para www.guestsvalencia.es:`);
      console.log(`   ${match[1]}.vercel-dns.com`);
      console.log(`\n   O usa el formato completo:`);
      console.log(`   cname.vercel-dns.com`);
    }
  }
  
  console.log('\n💡 Si el dominio www.guestsvalencia.es está configurado en Vercel,');
  console.log('   el valor CNAME aparecerá en: https://vercel.com/dashboard');
  console.log('   Settings → Domains → www.guestsvalencia.es\n');
}

main().catch(console.error);

