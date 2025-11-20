/**
 * Script para verificar el estado de los dominios en Vercel
 * y mostrar los valores DNS exactos que necesita PiensaSolution
 */

const axios = require('axios');

const VERCEL_TOKEN = 'rTbbeIXzN70ZvXbG6L9Avj5d';
const VERCEL_PROJECT_ID = 'prj_HNCaiegvbQcqBHrV8kZwttlKrDPe';
const API_BASE = 'https://api.vercel.com';

async function checkDomainStatus() {
  console.log('🔍 Verificando estado de dominios en Vercel...\n');
  
  try {
    // Obtener información de dominios del proyecto
    const domainsRes = await axios.get(
      `${API_BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );
    
    console.log('📋 Dominios configurados:\n');
    
    for (const domain of domainsRes.data.domains || []) {
      console.log(`🌐 ${domain.name}`);
      console.log(`   Estado: ${domain.verification?.verified ? '✅ Verificado' : '⚠️  No verificado'}`);
      console.log(`   Configuración: ${domain.configurationStatus || 'unknown'}`);
      
      // Obtener registros DNS necesarios
      try {
        const dnsRes = await axios.get(
          `${API_BASE}/v4/domains/${domain.name}/records`,
          {
            headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
          }
        );
        
        if (dnsRes.data.records && dnsRes.data.records.length > 0) {
          console.log(`   📝 Registros DNS necesarios:`);
          dnsRes.data.records.forEach(record => {
            console.log(`      ${record.type} ${record.name || '@'} → ${record.value}`);
          });
        }
      } catch (e) {
        // Intentar obtener desde el endpoint de verificación
        try {
          const verifyRes = await axios.get(
            `${API_BASE}/v4/domains/${domain.name}/config`,
            {
              headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
            }
          );
          
          if (verifyRes.data.intendedNameservers) {
            console.log(`   📝 Nameservers: ${verifyRes.data.intendedNameservers.join(', ')}`);
          }
        } catch (e2) {
          // Ignorar errores de verificación
        }
      }
      
      console.log('');
    }
    
    // Obtener información específica de verificación
    console.log('\n📋 Valores DNS para PiensaSolution:\n');
    
    // Para guestsvalencia.es (apex)
    console.log('1. guestsvalencia.es (Apex):');
    console.log('   Tipo: A');
    console.log('   Nombre: @ (o guestsvalencia.es)');
    console.log('   Valor: 216.198.79.1 (NUEVO - recomendado)');
    console.log('   O: 76.76.21.21 (antiguo - sigue funcionando)');
    console.log('');
    
    // Para www.guestsvalencia.es
    console.log('2. www.guestsvalencia.es:');
    console.log('   Tipo: CNAME');
    console.log('   Nombre: www');
    console.log('   Valor: 76e54a8c3eb14bd2.vercel-dns-017.com. (NUEVO - recomendado)');
    console.log('   O: cname.vercel-dns.com (antiguo - sigue funcionando)');
    console.log('');
    
    console.log('💡 Actualiza estos valores en PiensaSolution para que Vercel verifique correctamente\n');
    
  } catch (error) {
    console.error('❌ Error verificando dominios:');
    console.error(`   ${error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message}`);
  }
}

checkDomainStatus().catch(console.error);

