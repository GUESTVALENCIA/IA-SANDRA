/**
 * Script para configurar dominio en Netlify
 * Añade site.guestsvalencia.es al sitio corporativo
 */

const axios = require('axios');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.pro') });

const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN || 'nfp_xLTQK7QHpYQQAhtzp2maoghJeNLZ695pdab6';
const DOMAIN_TO_ADD = 'site.guestsvalencia.es';

const API_BASE = 'https://api.netlify.com/api/v1';

async function findGuestsSite() {
  try {
    const response = await axios.get(`${API_BASE}/sites`, {
      headers: { 
        'Authorization': `Bearer ${NETLIFY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: { per_page: 100 }
    });
    
    const sites = response.data || [];
    
    // Buscar sitio de guestsvalencia o crear uno nuevo
    let site = sites.find(s => 
      s.name.includes('guests') || 
      s.name.includes('valencia') ||
      s.custom_domain === 'site.guestsvalencia.es'
    );
    
    // Si no existe, usar el primero o crear uno nuevo
    if (!site && sites.length > 0) {
      site = sites[0];
      console.log(`⚠️  No se encontró sitio específico, usando: ${site.name}`);
    }
    
    return site;
  } catch (e) {
    console.error('Error obteniendo sitios:', e.response?.data || e.message);
    return null;
  }
}

async function getSiteDomains(siteId) {
  try {
    const response = await axios.get(`${API_BASE}/sites/${siteId}/dns`, {
      headers: { 
        'Authorization': `Bearer ${NETLIFY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data || [];
  } catch (e) {
    // Si no hay DNS configurado, devolver array vacío
    return [];
  }
}

async function addDomainToSite(siteId, domain) {
  try {
    const response = await axios.post(
      `${API_BASE}/sites/${siteId}/domains`,
      { domain: domain },
      {
        headers: { 
          'Authorization': `Bearer ${NETLIFY_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return { success: true, data: response.data };
  } catch (e) {
    if (e.response?.status === 422) {
      return { success: false, error: 'Domain already exists or invalid', data: e.response.data };
    }
    return { success: false, error: e.response?.data || e.message };
  }
}

async function main() {
  console.log('🌐 Configurando dominio en Netlify\n');
  
  // Buscar sitio
  console.log('🔍 Buscando sitio de GuestsValencia...');
  const site = await findGuestsSite();
  
  if (!site) {
    console.error('❌ No se encontró ningún sitio en Netlify');
    console.error('   Crea un sitio primero en: https://app.netlify.com');
    process.exit(1);
  }
  
  console.log(`✅ Sitio encontrado: ${site.name} (${site.id})`);
  console.log(`   URL: ${site.url}\n`);
  
  // Obtener dominios actuales
  const currentDomains = site.custom_domain ? [site.custom_domain] : [];
  console.log('📋 Dominios actuales:');
  if (currentDomains.length === 0) {
    console.log('   (ninguno)\n');
  } else {
    currentDomains.forEach(d => console.log(`   - ${d}`));
    console.log('');
  }
  
  // Verificar si el dominio ya existe
  if (currentDomains.includes(DOMAIN_TO_ADD)) {
    console.log(`✅ ${DOMAIN_TO_ADD} - Ya está configurado`);
  } else {
    // Añadir dominio
    console.log(`➕ Añadiendo ${DOMAIN_TO_ADD}...`);
    const result = await addDomainToSite(site.id, DOMAIN_TO_ADD);
    
    if (result.success) {
      console.log(`   ✅ Dominio añadido correctamente`);
      console.log(`   📝 CNAME a configurar: ${site.subdomain || site.name}.netlify.app`);
    } else {
      console.log(`   ❌ Error: ${result.error}`);
      if (result.data) {
        console.log(`   Detalles:`, JSON.stringify(result.data, null, 2));
      }
    }
  }
  
  // Obtener información del DNS
  console.log('\n📋 Información de DNS:');
  console.log(`   Dominio: ${DOMAIN_TO_ADD}`);
  console.log(`   CNAME → ${site.subdomain || site.name}.netlify.app`);
  console.log(`   O usa: ${site.url.replace('https://', '')}`);
  
  console.log('\n✅ Configuración completada\n');
  console.log('💡 Configura el CNAME en PiensaSolution:');
  console.log(`   site.guestsvalencia.es → ${site.subdomain || site.name}.netlify.app\n`);
}

main().catch(console.error);

