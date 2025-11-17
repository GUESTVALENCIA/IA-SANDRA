// tools/cleanup-vercel-deployments.js
// Script para limpiar todos los deployments bloqueados y fallidos de Vercel

const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || 'rTbbeIXzN70ZvXbG6L9Avj5d';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_j0oMCNvOgiMauVLQrYIkaHFymn8o';

const VERCEL_API_BASE = 'https://api.vercel.com';

async function cleanupVercelDeployments() {
  console.log('🧹 Iniciando limpieza de deployments de Vercel...\n');
  
  let totalCleaned = 0;
  let totalCancelled = 0;
  let totalDeleted = 0;

  try {
    // Método 1: Usar CLI de Vercel (más confiable)
    console.log('📋 Método 1: Usando CLI de Vercel...');
    try {
      // Listar todos los deployments
      const { stdout } = await execAsync(
        `vercel ls --token ${VERCEL_TOKEN} --json`,
        { timeout: 30000, maxBuffer: 10 * 1024 * 1024 }
      );
      
      const deployments = JSON.parse(stdout);
      console.log(`   Encontrados ${deployments.length} deployments\n`);
      
      // Cancelar deployments en BUILDING o QUEUED
      for (const deployment of deployments) {
        if (deployment.state === 'BUILDING' || deployment.state === 'QUEUED') {
          try {
            await execAsync(
              `vercel cancel ${deployment.uid} --token ${VERCEL_TOKEN}`,
              { timeout: 10000 }
            );
            console.log(`   🛑 Cancelado: ${deployment.uid} (${deployment.state})`);
            totalCancelled++;
          } catch (e) {
            console.warn(`   ⚠️  No se pudo cancelar ${deployment.uid}: ${e.message}`);
          }
        } else if (deployment.state === 'ERROR' || deployment.state === 'CANCELED') {
          try {
            await execAsync(
              `vercel rm ${deployment.uid} --token ${VERCEL_TOKEN} --yes`,
              { timeout: 10000 }
            );
            console.log(`   🗑️  Eliminado: ${deployment.uid} (${deployment.state})`);
            totalDeleted++;
          } catch (e) {
            // Ignorar errores al eliminar (puede que ya no exista)
          }
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Error usando CLI: ${error.message}`);
      console.log('   Intentando con API directa...\n');
    }

    // Método 2: Usar API directa de Vercel
    console.log('📋 Método 2: Usando API directa de Vercel...');
    try {
      // Obtener deployments del proyecto
      const response = await axios.get(
        `${VERCEL_API_BASE}/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`
          },
          timeout: 30000
        }
      );

      const deployments = response.data.deployments || [];
      console.log(`   Encontrados ${deployments.length} deployments en el proyecto\n`);

      // Cancelar deployments activos
      for (const deployment of deployments) {
        const state = deployment.readyState || deployment.state;
        
        if (state === 'BUILDING' || state === 'QUEUED' || state === 'INITIALIZING') {
          try {
            await axios.patch(
              `${VERCEL_API_BASE}/v13/deployments/${deployment.uid}/cancel`,
              {},
              {
                headers: {
                  'Authorization': `Bearer ${VERCEL_TOKEN}`
                },
                timeout: 10000
              }
            );
            console.log(`   🛑 Cancelado (API): ${deployment.uid} (${state})`);
            totalCancelled++;
          } catch (e) {
            if (e.response?.status !== 404) {
              console.warn(`   ⚠️  No se pudo cancelar ${deployment.uid}: ${e.message}`);
            }
          }
        } else if (state === 'ERROR' || state === 'CANCELED' || state === 'FAILED') {
          try {
            await axios.delete(
              `${VERCEL_API_BASE}/v13/deployments/${deployment.uid}`,
              {
                headers: {
                  'Authorization': `Bearer ${VERCEL_TOKEN}`
                },
                timeout: 10000
              }
            );
            console.log(`   🗑️  Eliminado (API): ${deployment.uid} (${state})`);
            totalDeleted++;
          } catch (e) {
            if (e.response?.status !== 404) {
              // Ignorar 404 (ya no existe)
            }
          }
        }
      }
    } catch (error) {
      console.error(`   ❌ Error usando API: ${error.message}`);
      if (error.response) {
        console.error(`   Detalles: ${JSON.stringify(error.response.data)}`);
      }
    }

    // Método 3: Limpiar deployments antiguos (más de 7 días)
    console.log('\n📋 Método 3: Limpiando deployments antiguos (>7 días)...');
    try {
      const response = await axios.get(
        `${VERCEL_API_BASE}/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=200`,
        {
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`
          },
          timeout: 30000
        }
      );

      const deployments = response.data.deployments || [];
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      for (const deployment of deployments) {
        const createdAt = new Date(deployment.createdAt || deployment.created).getTime();
        
        if (createdAt < sevenDaysAgo) {
          try {
            await axios.delete(
              `${VERCEL_API_BASE}/v13/deployments/${deployment.uid}`,
              {
                headers: {
                  'Authorization': `Bearer ${VERCEL_TOKEN}`
                },
                timeout: 10000
              }
            );
            console.log(`   🗑️  Eliminado (antiguo): ${deployment.uid}`);
            totalDeleted++;
          } catch (e) {
            // Ignorar errores
          }
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Error limpiando antiguos: ${error.message}`);
    }

    totalCleaned = totalCancelled + totalDeleted;

    console.log('\n' + '='.repeat(50));
    console.log('✅ LIMPIEZA COMPLETADA');
    console.log('='.repeat(50));
    console.log(`   🛑 Deployments cancelados: ${totalCancelled}`);
    console.log(`   🗑️  Deployments eliminados: ${totalDeleted}`);
    console.log(`   📊 Total limpiados: ${totalCleaned}`);
    console.log('='.repeat(50) + '\n');

    return {
      success: true,
      cancelled: totalCancelled,
      deleted: totalDeleted,
      total: totalCleaned
    };

  } catch (error) {
    console.error('\n❌ Error general en limpieza:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar limpieza
if (require.main === module) {
  cleanupVercelDeployments()
    .then(result => {
      if (result.success) {
        console.log('✅ Proceso completado exitosamente');
        process.exit(0);
      } else {
        console.error('❌ Proceso completado con errores');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { cleanupVercelDeployments };

