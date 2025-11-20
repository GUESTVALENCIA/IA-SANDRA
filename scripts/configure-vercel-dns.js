/**
 * Script para configurar DNS en Vercel
 * Agrega el dominio al proyecto y obtiene los registros DNS necesarios
 */

const axios = require('axios');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const DOMAIN = process.env.VERCEL_DOMAIN || 'guestsvalencia.es';

async function addDomainToProject() {
  try {
    console.log(`🌐 Agregando dominio ${DOMAIN} al proyecto...`);
    
    const response = await axios.post(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_ORG_ID}`,
      { name: DOMAIN },
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Dominio agregado:', response.data.name);
    return response.data;
  } catch (e) {
    if (e.response?.status === 409) {
      console.log('ℹ️  Dominio ya está agregado al proyecto');
    } else {
      console.error('Error agregando dominio:', e.response?.data || e.message);
    }
    return null;
  }
}

async function getDNSRecords() {
  try {
    console.log(`\n📋 Obteniendo registros DNS para ${DOMAIN}...`);
    
    const response = await axios.get(
      `https://api.vercel.com/v4/domains/${DOMAIN}/records?teamId=${VERCEL_ORG_ID}`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );
    
    if (response.data.records?.length > 0) {
      console.log('\nRegistros DNS necesarios:');
      response.data.records.forEach(record => {
        console.log(`  ${record.type} ${record.name} → ${record.value}`);
      });
    } else {
      // Obtener configuración del dominio
      const domainRes = await axios.get(
        `https://api.vercel.com/v4/domains/${DOMAIN}?teamId=${VERCEL_ORG_ID}`,
        {
          headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
        }
      );
      
      console.log('\n📝 Configura DNS en tu proveedor:');
      console.log(`   Dominio: ${DOMAIN}`);
      console.log(`   Verificado: ${domainRes.data.verified ? '✅' : '❌'}`);
      
      if (!domainRes.data.verified) {
        console.log('\n⚠️  El dominio necesita verificación.');
        console.log('   Agrega estos registros en tu proveedor DNS:');
        console.log('   (Vercel te mostrará los registros específicos en el dashboard)');
      }
    }
  } catch (e) {
    console.error('Error obteniendo registros DNS:', e.response?.data || e.message);
  }
}

async function main() {
  console.log('🚀 Configurando DNS en Vercel\n');
  
  if (!VERCEL_TOKEN || !VERCEL_ORG_ID || !VERCEL_PROJECT_ID) {
    console.error('❌ Error: VERCEL_TOKEN, VERCEL_ORG_ID y VERCEL_PROJECT_ID deben estar configurados');
    console.error('   Usa: VERCEL_TOKEN=xxx VERCEL_ORG_ID=xxx VERCEL_PROJECT_ID=xxx node scripts/configure-vercel-dns.js');
    process.exit(1);
  }
  
  const domain = await addDomainToProject();
  if (domain) {
    await getDNSRecords();
  }
  
  console.log('\n✅ Configuración DNS completada');
  console.log(`\n📱 Dashboard: https://vercel.com/guests-valencias-projects/guests-pwa`);
  console.log(`   Verifica el estado del dominio y los registros DNS necesarios\n`);
}

main().catch(console.error);

