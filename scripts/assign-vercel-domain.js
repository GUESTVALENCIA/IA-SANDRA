/**
 * Script para asignar el dominio guestsvalencia.es al deployment actual de Vercel
 */

const axios = require('axios');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.pro') });

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || 'rTbbeIXzN70ZvXbG6L9Avj5d';
// Proyecto correcto: guestsvalencia-site
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_HNCaiegvbQcqBHrV8kZwttlKrDPe';
const DOMAIN = 'guestsvalencia.es';

const API_BASE = 'https://api.vercel.com';

async function getLatestDeployment() {
  try {
    const response = await axios.get(`${API_BASE}/v6/deployments`, {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
      params: {
        projectId: VERCEL_PROJECT_ID,
        limit: 1,
        state: 'READY'
      }
    });
    
    if (response.data.deployments && response.data.deployments.length > 0) {
      return response.data.deployments[0];
    }
    return null;
  } catch (e) {
    console.error('Error obteniendo deployment:', e.response?.data || e.message);
    return null;
  }
}

async function assignDomainToDeployment(deploymentId, domain) {
  try {
    // Primero verificar que el dominio existe en el proyecto
    const domainsResponse = await axios.get(
      `${API_BASE}/v9/projects/${VERCEL_PROJECT_ID}/domains`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );
    
    const domainExists = domainsResponse.data.domains?.some(d => d.name === domain);
    
    if (!domainExists) {
      console.log(`⚠️  El dominio ${domain} no está configurado en el proyecto`);
      console.log(`   Añádelo primero en: https://vercel.com/dashboard`);
      return false;
    }
    
    // Asignar dominio al deployment
    const response = await axios.patch(
      `${API_BASE}/v13/deployments/${deploymentId}`,
      {
        alias: [domain]
      },
      {
        headers: { 
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { success: true, data: response.data };
  } catch (e) {
    if (e.response?.status === 400) {
      // El dominio ya está asignado o hay un problema
      return { success: false, error: e.response.data };
    }
    return { success: false, error: e.response?.data || e.message };
  }
}

async function main() {
  console.log('🔗 Asignando dominio a deployment de Vercel\n');
  console.log(`📦 Proyecto: ${VERCEL_PROJECT_ID}`);
  console.log(`🌐 Dominio: ${DOMAIN}\n`);
  
  // Obtener último deployment
  console.log('🔍 Buscando último deployment...');
  const deployment = await getLatestDeployment();
  
  if (!deployment) {
    console.error('❌ No se encontró ningún deployment READY');
    return;
  }
  
  console.log(`✅ Deployment encontrado:`);
  console.log(`   ID: ${deployment.uid}`);
  console.log(`   URL: ${deployment.url}`);
  console.log(`   Estado: ${deployment.readyState}`);
  console.log(`   Alias actual: ${deployment.alias?.join(', ') || '(ninguno)'}\n`);
  
  // Verificar si ya está asignado
  if (deployment.alias && deployment.alias.includes(DOMAIN)) {
    console.log(`✅ El dominio ${DOMAIN} ya está asignado a este deployment`);
    return;
  }
  
  // Asignar dominio
  console.log(`🔗 Asignando ${DOMAIN} al deployment...`);
  const result = await assignDomainToDeployment(deployment.uid, DOMAIN);
  
  if (result.success) {
    console.log(`\n✅ Dominio asignado correctamente`);
    console.log(`\n🌐 El sitio debería estar disponible en:`);
    console.log(`   https://${DOMAIN}`);
    console.log(`\n⏳ Espera 1-2 minutos para que propague\n`);
  } else {
    console.log(`\n❌ Error asignando dominio:`);
    console.log(`   ${JSON.stringify(result.error, null, 2)}`);
    console.log(`\n💡 Asigna manualmente en:`);
    console.log(`   https://vercel.com/dashboard`);
    console.log(`   → Proyecto → Deployments → ${deployment.uid}`);
    console.log(`   → Settings → Domains → Assign Domain\n`);
  }
}

main().catch(console.error);

