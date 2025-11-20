/**
 * Script directo para asignar guestsvalencia.es al deployment actual de Vercel
 * Usa la API de Vercel directamente
 */

const axios = require('axios');

const VERCEL_TOKEN = 'rTbbeIXzN70ZvXbG6L9Avj5d';
const VERCEL_PROJECT_ID = 'prj_HNCaiegvbQcqBHrV8kZwttlKrDPe';
const DOMAIN = 'guestsvalencia.es';
const API_BASE = 'https://api.vercel.com';

async function main() {
  console.log('🔗 Asignando dominio a Vercel automáticamente...\n');
  
  try {
    // 1. Obtener último deployment READY
    console.log('📦 Buscando último deployment...');
    const deploymentsRes = await axios.get(`${API_BASE}/v6/deployments`, {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
      params: {
        projectId: VERCEL_PROJECT_ID,
        limit: 1,
        state: 'READY'
      }
    });
    
    if (!deploymentsRes.data.deployments || deploymentsRes.data.deployments.length === 0) {
      console.error('❌ No se encontró ningún deployment READY');
      return;
    }
    
    const deployment = deploymentsRes.data.deployments[0];
    console.log(`✅ Deployment encontrado: ${deployment.uid}`);
    console.log(`   URL: ${deployment.url}`);
    console.log(`   Estado: ${deployment.readyState}\n`);
    
    // 2. Verificar que el dominio existe en el proyecto
    console.log('🌐 Verificando dominio en proyecto...');
    const domainsRes = await axios.get(
      `${API_BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );
    
    const domainExists = domainsRes.data.domains?.some(d => d.name === DOMAIN);
    
    if (!domainExists) {
      console.log(`⚠️  El dominio ${DOMAIN} no está en el proyecto. Añadiéndolo...`);
      
      // Añadir dominio al proyecto
      await axios.post(
        `${API_BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains`,
        { name: DOMAIN },
        {
          headers: { 
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ Dominio ${DOMAIN} añadido al proyecto\n`);
    } else {
      console.log(`✅ Dominio ${DOMAIN} ya existe en el proyecto\n`);
    }
    
    // 3. Asignar dominio al deployment usando alias
    console.log(`🔗 Asignando ${DOMAIN} al deployment ${deployment.uid}...`);
    
    try {
      // Método 1: Actualizar deployment con alias
      await axios.patch(
        `${API_BASE}/v13/deployments/${deployment.uid}`,
        {
          alias: [DOMAIN]
        },
        {
          headers: { 
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`\n✅ ¡Dominio asignado correctamente!`);
      console.log(`\n🌐 El sitio debería estar disponible en:`);
      console.log(`   https://${DOMAIN}`);
      console.log(`\n⏳ Espera 1-2 minutos para que propague el DNS\n`);
      
    } catch (aliasError) {
      // Si falla el método de alias, intentar crear alias directamente
      console.log(`⚠️  Método de alias falló, intentando método alternativo...`);
      
      try {
        await axios.post(
          `${API_BASE}/v2/deployments/${deployment.uid}/aliases`,
          { alias: DOMAIN },
          {
            headers: { 
              'Authorization': `Bearer ${VERCEL_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`\n✅ ¡Dominio asignado correctamente!`);
        console.log(`\n🌐 El sitio debería estar disponible en:`);
        console.log(`   https://${DOMAIN}\n`);
        
      } catch (alias2Error) {
        console.error(`\n❌ Error asignando dominio:`);
        console.error(`   ${JSON.stringify(alias2Error.response?.data || alias2Error.message, null, 2)}`);
        console.error(`\n💡 El dominio puede estar ya asignado o necesitar configuración manual`);
      }
    }
    
    // 4. Verificar estado final
    console.log('\n🔍 Verificando estado final...');
    const finalDeployment = await axios.get(
      `${API_BASE}/v13/deployments/${deployment.uid}`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );
    
    const aliases = finalDeployment.data.alias || [];
    if (aliases.includes(DOMAIN)) {
      console.log(`✅ Confirmado: ${DOMAIN} está asignado al deployment\n`);
    } else {
      console.log(`⚠️  El dominio puede necesitar unos minutos para aparecer\n`);
    }
    
  } catch (error) {
    console.error('\n❌ Error general:');
    console.error(`   ${error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message}`);
    
    if (error.response?.status === 403) {
      console.error('\n💡 Verifica que el token tenga permisos suficientes');
    }
  }
}

main().catch(console.error);

