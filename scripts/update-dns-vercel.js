/**
 * Script para actualizar registros DNS según lo que Vercel necesita
 * Basado en la configuración DNS actual del usuario
 */

const axios = require('axios');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const DOMAIN = 'guestsvalencia.es';

async function getVercelDNSRequirements() {
  try {
    console.log('📋 Obteniendo requisitos DNS de Vercel...\n');
    
    const response = await axios.get(
      `https://api.vercel.com/v4/domains/${DOMAIN}?teamId=${VERCEL_ORG_ID}`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );
    
    const domain = response.data;
    
    console.log('✅ Dominio en Vercel:');
    console.log(`   Nombre: ${domain.name}`);
    console.log(`   Verificado: ${domain.verified ? '✅' : '❌'}`);
    console.log(`   Apex Name: ${domain.apexName}\n`);
    
    // Obtener registros DNS actuales en Vercel
    const recordsRes = await axios.get(
      `https://api.vercel.com/v4/domains/${DOMAIN}/records?teamId=${VERCEL_ORG_ID}`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );
    
    if (recordsRes.data.records?.length > 0) {
      console.log('📝 Registros DNS que Vercel espera:');
      recordsRes.data.records.forEach(record => {
        console.log(`   ${record.type} ${record.name || '@'} → ${record.value}`);
      });
    }
    
    return { domain, records: recordsRes.data.records || [] };
  } catch (e) {
    console.error('Error obteniendo info de Vercel:', e.response?.data || e.message);
    throw e;
  }
}

function generateDNSInstructions(vercelRecords) {
  console.log('\n🔧 INSTRUCCIONES PARA ACTUALIZAR DNS:\n');
  
  console.log('⚠️  PROBLEMA DETECTADO:');
  console.log('   El registro A para guestsvalencia.es apunta a 76.76.21.21');
  console.log('   Vercel necesita ALIAS o CNAME para el dominio raíz\n');
  
  console.log('✅ REGISTROS CORRECTOS PARA VERCEL:\n');
  
  // Buscar el registro ALIAS que Vercel necesita
  const aliasRecord = vercelRecords.find(r => r.type === 'ALIAS' && !r.name);
  const cnameRecord = vercelRecords.find(r => r.type === 'CNAME' && !r.name);
  
  if (aliasRecord) {
    console.log('1. Dominio raíz (guestsvalencia.es):');
    console.log(`   Tipo: ALIAS`);
    console.log(`   Valor: ${aliasRecord.value}`);
    console.log(`   ⚠️  ACTUALMENTE: A → 76.76.21.21 (DEBE CAMBIARSE)\n`);
  } else if (cnameRecord) {
    console.log('1. Dominio raíz (guestsvalencia.es):');
    console.log(`   Tipo: CNAME`);
    console.log(`   Valor: ${cnameRecord.value}`);
    console.log(`   ⚠️  ACTUALMENTE: A → 76.76.21.21 (DEBE CAMBIARSE)\n`);
  }
  
  // Verificar www
  const wwwRecord = vercelRecords.find(r => r.name === 'www');
  if (wwwRecord) {
    console.log('2. Subdominio www (www.guestsvalencia.es):');
    console.log(`   Tipo: ${wwwRecord.type}`);
    console.log(`   Valor: ${wwwRecord.value}`);
    console.log(`   ✅ ACTUALMENTE: CNAME → ${wwwRecord.value.includes('vercel') ? 'CORRECTO' : 'VERIFICAR'}\n`);
  }
  
  console.log('📋 ACCIONES REQUERIDAS:\n');
  console.log('1. ELIMINAR o MODIFICAR el registro A de guestsvalencia.es');
  console.log('2. AGREGAR registro ALIAS para guestsvalencia.es → cname.vercel-dns-017.com.');
  console.log('   (Si tu proveedor DNS no soporta ALIAS, usa CNAME)');
  console.log('3. VERIFICAR que www.guestsvalencia.es apunta a Vercel\n');
  
  console.log('💡 OPCIONES:\n');
  console.log('Opción A: Usar solo www (más fácil)');
  console.log('   - Mantener A para guestsvalencia.es (redirige a www)');
  console.log('   - Usar www.guestsvalencia.es para la PWA');
  console.log('   - Agregar www.guestsvalencia.es al proyecto Vercel\n');
  
  console.log('Opción B: Usar dominio raíz (requiere ALIAS)');
  console.log('   - Eliminar registro A de guestsvalencia.es');
  console.log('   - Agregar ALIAS guestsvalencia.es → cname.vercel-dns-017.com.');
  console.log('   - Verificar que tu proveedor DNS soporta ALIAS\n');
  
  console.log('🌐 REGISTROS ACTUALES QUE DEBEN MANTENERSE:\n');
  console.log('   ✅ _twilio.guestsvalencia.es TXT (verificación Twilio)');
  console.log('   ✅ api.guestsvalencia.es CNAME (si lo usas)');
  console.log('   ✅ sandra.guestsvalencia.es CNAME (si lo usas)');
  console.log('   ✅ MX, SPF (correo electrónico)');
  console.log('   ✅ Otros CNAMEs (autoconfig, autodiscover, etc.)\n');
}

async function addSubdomainToVercel(subdomain) {
  try {
    console.log(`\n📦 Agregando ${subdomain} al proyecto Vercel...`);
    
    const response = await axios.post(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_ORG_ID}`,
      { name: subdomain },
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ ${subdomain} agregado al proyecto`);
    return response.data;
  } catch (e) {
    if (e.response?.status === 409) {
      console.log(`ℹ️  ${subdomain} ya está agregado`);
    } else {
      console.error(`Error agregando ${subdomain}:`, e.response?.data || e.message);
    }
    return null;
  }
}

async function main() {
  console.log('🚀 Analizando configuración DNS para Vercel\n');
  
  if (!VERCEL_TOKEN || !VERCEL_ORG_ID || !VERCEL_PROJECT_ID) {
    console.error('❌ Error: Variables de entorno requeridas');
    console.error('   VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID');
    process.exit(1);
  }
  
  try {
    const { domain, records } = await getVercelDNSRequirements();
    
    generateDNSInstructions(records);
    
    // Agregar www si no está
    await addSubdomainToVercel('www.guestsvalencia.es');
    
    console.log('✅ Análisis completado\n');
    console.log('📱 Dashboard Vercel:');
    console.log(`   https://vercel.com/guests-valencias-projects/guests-pwa/settings/domains\n`);
    
  } catch (e) {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  }
}

main();

