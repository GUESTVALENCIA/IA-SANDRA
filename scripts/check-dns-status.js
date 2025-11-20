/**
 * Script para verificar el estado de los DNS y dominios en Vercel
 */

const axios = require('axios');
const { execSync } = require('child_process');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

async function checkVercelDomains() {
  console.log('🔍 Verificando dominios en Vercel...\n');
  
  try {
    const response = await axios.get(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_ORG_ID}`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );
    
    console.log('📋 Dominios agregados al proyecto:');
    response.data.domains.forEach(domain => {
      const status = domain.verified ? '✅' : '⏳';
      console.log(`   ${status} ${domain.name}`);
    });
    
    return response.data.domains;
  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
    return [];
  }
}

async function checkDNSRecords(domain) {
  console.log(`\n🔍 Verificando registros DNS para ${domain}...\n`);
  
  try {
    // Verificar con dig si está disponible
    try {
      const digOutput = execSync(`dig +short ${domain}`, { encoding: 'utf8' }).trim();
      console.log(`   DNS Resolución: ${digOutput || 'No encontrado'}`);
    } catch (e) {
      console.log('   DNS Resolución: (dig no disponible)');
    }
    
    // Verificar en Vercel
    const response = await axios.get(
      `https://api.vercel.com/v4/domains/${domain}?teamId=${VERCEL_ORG_ID}`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );
    
    const domainInfo = response.data;
    console.log(`   Verificado: ${domainInfo.verified ? '✅' : '❌'}`);
    console.log(`   Configurado: ${domainInfo.configVerifiedAt ? '✅' : '❌'}`);
    
    if (domainInfo.certs?.length > 0) {
      console.log(`   Certificados SSL: ${domainInfo.certs.length} ✅`);
    }
    
    return domainInfo;
  } catch (e) {
    console.error(`   Error verificando ${domain}:`, e.response?.data?.error?.message || e.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Verificación de Estado DNS y Vercel\n');
  console.log('=' .repeat(50) + '\n');
  
  if (!VERCEL_TOKEN || !VERCEL_ORG_ID || !VERCEL_PROJECT_ID) {
    console.error('❌ Variables de entorno requeridas');
    console.error('   VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID');
    process.exit(1);
  }
  
  const domains = await checkVercelDomains();
  
  for (const domain of domains) {
    await checkDNSRecords(domain.name);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Verificación completada\n');
  console.log('📱 Dashboard:');
  console.log(`   https://vercel.com/guests-valencias-projects/guests-pwa/settings/domains\n`);
}

main().catch(console.error);

