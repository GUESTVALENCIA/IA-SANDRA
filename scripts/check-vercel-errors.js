/**
 * Script para verificar errores de deployment en Vercel
 */

const axios = require('axios');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.pro') });

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || 'rTbbeIXzN70ZvXbG6L9Avj5d';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_HNCaiegvbQcqBHrV8kZwttlKrDPe'; // guestsvalencia-site

const API_BASE = 'https://api.vercel.com';

async function getLatestDeployment() {
  try {
    // Primero buscar todos los deployments recientes
    const response = await axios.get(`${API_BASE}/v6/deployments`, {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
      params: {
        limit: 10
      }
    });
    
    // Buscar deployments de guestsvalencia-site
    const deployments = response.data.deployments || [];
    const siteDeployment = deployments.find(d => 
      d.name === 'guestsvalencia-site' || 
      d.url?.includes('guestsvalencia') ||
      d.projectId === VERCEL_PROJECT_ID
    ) || deployments[0];
    
    if (siteDeployment) {
      return siteDeployment;
    }
    return null;
  } catch (e) {
    console.error('Error obteniendo deployments:', e.response?.data || e.message);
    return null;
  }
}

async function getDeploymentEvents(deploymentId) {
  try {
    const response = await axios.get(`${API_BASE}/v2/deployments/${deploymentId}/events`, {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
    });
    return response.data.events || [];
  } catch (e) {
    console.error('Error obteniendo eventos:', e.response?.data || e.message);
    return [];
  }
}

async function getDeploymentLogs(deploymentId) {
  try {
    const response = await axios.get(`${API_BASE}/v2/deployments/${deploymentId}/build-logs`, {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
    });
    return response.data.logs || [];
  } catch (e) {
    console.error('Error obteniendo logs:', e.response?.data || e.message);
    return [];
  }
}

async function main() {
  console.log('🔍 Verificando errores de Vercel...\n');
  
  const deployment = await getLatestDeployment();
  
  if (!deployment) {
    console.log('❌ No se encontró ningún deployment');
    return;
  }
  
  console.log(`📦 Deployment: ${deployment.url || deployment.name}`);
  console.log(`   Estado: ${deployment.readyState}`);
  console.log(`   ID: ${deployment.uid}\n`);
  
  if (deployment.readyState === 'ERROR' || deployment.readyState === 'BUILDING') {
    console.log('🔴 Deployment con errores o en construcción\n');
    
    const events = await getDeploymentEvents(deployment.uid);
    const logs = await getDeploymentLogs(deployment.uid);
    
    console.log('📋 Eventos del deployment:');
    events.forEach(event => {
      if (event.type === 'command' || event.type === 'stdout' || event.type === 'stderr') {
        const text = event.payload?.text || event.payload?.command || '';
        if (text.includes('error') || text.includes('Error') || text.includes('ERROR') || 
            text.includes('failed') || text.includes('Failed') || text.includes('FAILED')) {
          console.log(`   ❌ ${text}`);
        }
      }
    });
    
    console.log('\n📋 Logs del build:');
    logs.forEach(log => {
      if (log.type === 'stderr' || (log.type === 'stdout' && 
          (log.data.includes('error') || log.data.includes('Error') || log.data.includes('ERROR') ||
           log.data.includes('failed') || log.data.includes('Failed') || log.data.includes('FAILED')))) {
        console.log(`   ❌ ${log.data}`);
      }
    });
  } else {
    console.log('✅ Deployment exitoso');
  }
}

main().catch(console.error);

