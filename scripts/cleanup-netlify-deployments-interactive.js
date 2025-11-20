/**
 * Script interactivo para limpiar deployments pendientes/pausados en Netlify
 * Elimina todos los deployments innecesarios para liberar créditos
 * 
 * USO:
 *   node scripts/cleanup-netlify-deployments-interactive.js
 *   O con token: NETLIFY_TOKEN=tu_token node scripts/cleanup-netlify-deployments-interactive.js
 */

const axios = require('axios');
const path = require('path');
const readline = require('readline');

// Cargar variables de entorno desde .env.pro
require('dotenv').config({ path: path.join(__dirname, '..', '.env.pro') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const API_BASE = 'https://api.netlify.com/api/v1';

async function getSites(token) {
  try {
    console.log('📋 Obteniendo sitios de Netlify...\n');
    const response = await axios.get(`${API_BASE}/sites`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { per_page: 100 }
    });
    return response.data || [];
  } catch (e) {
    if (e.response?.status === 401) {
      console.error('❌ Error de autenticación: Token inválido o expirado');
      console.error('   Verifica tu token en: https://app.netlify.com/user/applications');
    } else {
      console.error('Error obteniendo sitios:', e.response?.data || e.message);
    }
    throw e;
  }
}

async function getDeployments(siteId, token) {
  try {
    let allDeployments = [];
    let page = 1;
    const perPage = 100;
    
    while (true) {
      const response = await axios.get(`${API_BASE}/sites/${siteId}/deploys`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: { 
          per_page: perPage,
          page: page
        }
      });
      
      const deployments = response.data || [];
      if (deployments.length === 0) break;
      
      allDeployments = allDeployments.concat(deployments);
      
      // Si hay menos de perPage, es la última página
      if (deployments.length < perPage) break;
      page++;
    }
    
    return allDeployments;
  } catch (e) {
    console.error(`Error obteniendo deployments para ${siteId}:`, e.response?.data || e.message);
    return [];
  }
}

async function cancelDeployment(siteId, deployId, token) {
  try {
    await axios.post(
      `${API_BASE}/sites/${siteId}/deploys/${deployId}/cancel`,
      {},
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return true;
  } catch (e) {
    // Si ya está cancelado o no se puede cancelar, intentar eliminar
    if (e.response?.status === 404 || e.response?.status === 422) {
      return await deleteDeployment(siteId, deployId, token);
    }
    return false;
  }
}

async function deleteDeployment(siteId, deployId, token) {
  try {
    await axios.delete(
      `${API_BASE}/sites/${siteId}/deploys/${deployId}`,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return true;
  } catch (e) {
    return false;
  }
}

function getDeploymentState(deploy) {
  // Estados que queremos limpiar
  if (deploy.state === 'error' || deploy.state === 'canceled' || deploy.state === 'failed') {
    return 'error/canceled';
  }
  if (deploy.state === 'building' || deploy.state === 'enqueued' || deploy.state === 'processing' || deploy.state === 'new') {
    return 'pending';
  }
  if (deploy.state === 'ready' && !deploy.published_at) {
    return 'ready-not-published';
  }
  // También limpiar deployments muy antiguos (más de 30 días) que no estén publicados
  if (deploy.created_at) {
    const daysOld = (Date.now() - new Date(deploy.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld > 30 && !deploy.published_at) {
      return 'old-unpublished';
    }
  }
  return 'published';
}

async function cleanupSite(site, token) {
  console.log(`\n🔍 Procesando sitio: ${site.name || site.id} (${site.id})`);
  
  const deployments = await getDeployments(site.id, token);
  
  if (deployments.length === 0) {
    console.log('   ✅ No hay deployments');
    return { canceled: 0, deleted: 0, total: 0 };
  }
  
  console.log(`   📊 Total deployments: ${deployments.length}`);
  
  // Filtrar deployments a limpiar (todos excepto los publicados recientemente)
  const toCleanup = deployments.filter(d => {
    const state = getDeploymentState(d);
    // Limpiar: pendientes, errores, cancelados, listos pero no publicados, y antiguos
    return state !== 'published';
  });
  
  console.log(`   🧹 Deployments a limpiar: ${toCleanup.length}`);
  
  if (toCleanup.length === 0) {
    console.log('   ✅ No hay deployments para limpiar');
    return { canceled: 0, deleted: 0, total: 0 };
  }
  
  let canceled = 0;
  let deleted = 0;
  
  for (const deploy of toCleanup) {
    const state = getDeploymentState(deploy);
    const deployId = deploy.id.substring(0, 12);
    const deployState = deploy.state || 'unknown';
    const deployDate = deploy.created_at ? new Date(deploy.created_at).toLocaleDateString() : 'N/A';
    
    process.stdout.write(`   ${state === 'pending' ? '⏸️' : '🗑️'} ${deployId}... (${deployState}) - ${deployDate} `);
    
    try {
      if (state === 'pending') {
        const canceledResult = await cancelDeployment(site.id, deploy.id, token);
        if (canceledResult) {
          canceled++;
          console.log('✅ Cancelado');
        } else {
          console.log('⚠️  No se pudo cancelar');
        }
      } else {
        const deletedResult = await deleteDeployment(site.id, deploy.id, token);
        if (deletedResult) {
          deleted++;
          console.log('✅ Eliminado');
        } else {
          console.log('⚠️  No se pudo eliminar');
        }
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
    }
    
    // Pequeña pausa para no sobrecargar la API
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return { canceled, deleted, total: toCleanup.length };
}

async function main() {
  console.log('🧹 Limpieza de Deployments en Netlify\n');
  console.log('='.repeat(50) + '\n');
  
  // Obtener token
  let token = process.env.NETLIFY_TOKEN || process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_API_TOKEN;
  
  if (!token) {
    console.log('📝 No se encontró NETLIFY_TOKEN en variables de entorno.\n');
    console.log('💡 Para obtener tu token:');
    console.log('   1. Ve a: https://app.netlify.com/user/applications');
    console.log('   2. Crea un nuevo "Personal access token"');
    console.log('   3. Copia el token generado\n');
    
    token = await question('🔑 Ingresa tu token de Netlify: ');
    
    if (!token || token.trim() === '') {
      console.error('\n❌ Token requerido. Saliendo...');
      rl.close();
      process.exit(1);
    }
    
    token = token.trim();
  }
  
  try {
    const sites = await getSites(token);
    
    if (sites.length === 0) {
      console.log('⚠️  No se encontraron sitios');
      rl.close();
      return;
    }
    
    console.log(`📦 Sitios encontrados: ${sites.length}\n`);
    
    // Mostrar sitios
    sites.forEach((site, idx) => {
      console.log(`   ${idx + 1}. ${site.name || site.id} (${site.id})`);
    });
    
    console.log('\n');
    const answer = await question(`¿Limpiar deployments de TODOS los sitios? (s/N): `);
    
    let sitesToProcess = [];
    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'si') {
      sitesToProcess = sites;
    } else {
      const siteNum = await question(`Ingresa el número del sitio (1-${sites.length}): `);
      const idx = parseInt(siteNum) - 1;
      if (idx >= 0 && idx < sites.length) {
        sitesToProcess = [sites[idx]];
      } else {
        console.error('❌ Número inválido');
        rl.close();
        return;
      }
    }
    
    let totalCanceled = 0;
    let totalDeleted = 0;
    let totalProcessed = 0;
    
    for (const site of sitesToProcess) {
      const result = await cleanupSite(site, token);
      totalCanceled += result.canceled;
      totalDeleted += result.deleted;
      totalProcessed += result.total;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Limpieza completada:\n');
    console.log(`   ⏸️  Cancelados: ${totalCanceled}`);
    console.log(`   🗑️  Eliminados: ${totalDeleted}`);
    console.log(`   📊 Total procesado: ${totalProcessed}\n`);
    
    rl.close();
    
  } catch (e) {
    console.error('\n❌ Error:', e.message);
    if (e.response?.data) {
      console.error('   Detalles:', JSON.stringify(e.response.data, null, 2));
    }
    rl.close();
    process.exit(1);
  }
}

main();

