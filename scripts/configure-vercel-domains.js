/**
 * Script para configurar dominios en Vercel
 * Añade guestsvalencia.es y www.guestsvalencia.es al proyecto
 */

const axios = require('axios');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.pro') });

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || 'rTbbeIXzN70ZvXbG6L9Avj5d';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_HNCaiegvbQcqBHrV8kZwttlKrDPe'; // guestsvalencia-site

const API_BASE = 'https://api.vercel.com/v9';

const DOMAINS_TO_ADD = [
  'guestsvalencia.es',
  'www.guestsvalencia.es'
];

async function getCurrentDomains() {
  try {
    const response = await axios.get(
      `${API_BASE}/projects/${VERCEL_PROJECT_ID}/domains`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );
    return response.data.domains || [];
  } catch (e) {
    console.error('Error obteniendo dominios:', e.response?.data || e.message);
    return [];
  }
}

async function addDomain(domain) {
  try {
    const response = await axios.post(
      `${API_BASE}/projects/${VERCEL_PROJECT_ID}/domains`,
      { name: domain },
      {
        headers: { 
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return { success: true, domain: response.data };
  } catch (e) {
    if (e.response?.status === 409) {
      return { success: false, error: 'Domain already exists', domain };
    }
    return { success: false, error: e.response?.data || e.message, domain };
  }
}

async function main() {
  console.log('🌐 Configurando dominios en Vercel\n');
  console.log(`📦 Proyecto: ${VERCEL_PROJECT_ID}\n`);
  
  // Obtener dominios actuales
  const currentDomains = await getCurrentDomains();
  console.log('📋 Dominios actuales:');
  if (currentDomains.length === 0) {
    console.log('   (ninguno)\n');
  } else {
    currentDomains.forEach(d => {
      console.log(`   - ${d.name} (${d.verification?.status || 'unknown'})`);
    });
    console.log('');
  }
  
  // Añadir nuevos dominios
  console.log('➕ Añadiendo dominios...\n');
  
  for (const domain of DOMAINS_TO_ADD) {
    // Verificar si ya existe
    const exists = currentDomains.some(d => d.name === domain);
    
    if (exists) {
      console.log(`   ✅ ${domain} - Ya existe`);
    } else {
      console.log(`   ➕ Añadiendo ${domain}...`);
      const result = await addDomain(domain);
      
      if (result.success) {
        console.log(`      ✅ Añadido correctamente`);
      } else {
        if (result.error === 'Domain already exists') {
          console.log(`      ⚠️  Ya existe (puede estar en otro proyecto)`);
        } else {
          console.log(`      ❌ Error: ${result.error}`);
        }
      }
    }
    
    // Pequeña pausa
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Mostrar dominios finales
  console.log('\n📋 Dominios configurados:');
  const finalDomains = await getCurrentDomains();
  finalDomains.forEach(d => {
    const status = d.verification?.status || 'unknown';
    const emoji = status === 'verified' ? '✅' : status === 'pending' ? '⏳' : '❌';
    console.log(`   ${emoji} ${d.name} - ${status}`);
  });
  
  console.log('\n✅ Configuración completada\n');
  console.log('💡 Nota: Los dominios pueden tardar unos minutos en propagarse.');
  console.log('   Verifica el estado en: https://vercel.com/dashboard\n');
}

main().catch(console.error);

