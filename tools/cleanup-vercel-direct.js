// Limpieza directa de deployments de Vercel usando solo API
const axios = require('axios');

const VERCEL_TOKEN = 'rTbbeIXzN70ZvXbG6L9Avj5d';
const VERCEL_PROJECT_ID = 'prj_j0oMCNvOgiMauVLQrYIkaHFymn8o';
const VERCEL_API = 'https://api.vercel.com';

async function cleanup() {
  console.log('🧹 LIMPIEZA DE DEPLOYMENTS VERCEL\n');
  console.log('='.repeat(50));
  
  let cancelled = 0;
  let deleted = 0;
  
  try {
    // Primero verificar proyectos disponibles
    console.log('📋 Verificando proyectos disponibles...');
    try {
      const projectsRes = await axios.get(
        `${VERCEL_API}/v9/projects`,
        {
          headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
          timeout: 30000
        }
      );
      const projects = projectsRes.data.projects || [];
      console.log(`   ✅ Encontrados ${projects.length} proyectos`);
      if (projects.length > 0) {
        console.log(`   📦 Proyectos: ${projects.map(p => p.name).join(', ')}\n`);
      }
    } catch (e) {
      console.log(`   ⚠️  No se pudieron listar proyectos: ${e.message}\n`);
    }
    
    // Obtener deployments (sin filtrar por proyecto para encontrar todos)
    console.log('📋 Obteniendo lista de deployments...');
    const res = await axios.get(
      `${VERCEL_API}/v6/deployments?limit=100`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
        timeout: 30000
      }
    );
    
    const deployments = res.data.deployments || [];
    console.log(`   ✅ Encontrados ${deployments.length} deployments\n`);
    
    // Procesar cada deployment
    for (const dep of deployments) {
      const state = dep.readyState || dep.state || 'UNKNOWN';
      const uid = dep.uid || dep.id;
      
      try {
        // Cancelar activos
        if (state === 'BUILDING' || state === 'QUEUED' || state === 'INITIALIZING') {
          await axios.patch(
            `${VERCEL_API}/v13/deployments/${uid}/cancel`,
            {},
            { headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }, timeout: 10000 }
          );
          console.log(`   🛑 CANCELADO: ${uid.substring(0, 12)}... (${state})`);
          cancelled++;
        }
        // Eliminar fallidos/antiguos
        else if (state === 'ERROR' || state === 'CANCELED' || state === 'FAILED') {
          await axios.delete(
            `${VERCEL_API}/v13/deployments/${uid}`,
            { headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }, timeout: 10000 }
          );
          console.log(`   🗑️  ELIMINADO: ${uid.substring(0, 12)}... (${state})`);
          deleted++;
        }
      } catch (e) {
        if (e.response?.status !== 404) {
          console.log(`   ⚠️  ${uid.substring(0, 12)}... - ${e.message}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ LIMPIEZA COMPLETADA');
    console.log('='.repeat(50));
    console.log(`   🛑 Cancelados: ${cancelled}`);
    console.log(`   🗑️  Eliminados: ${deleted}`);
    console.log(`   📊 Total: ${cancelled + deleted}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('   Detalles:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

cleanup();

