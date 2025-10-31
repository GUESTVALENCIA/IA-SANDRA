/**
 * Script para verificar sitios disponibles en Netlify
 */

const https = require('https');

const NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN || 'nfp_BguXWY1a87dAj2hLJvB2wy5ndvvkkCkm0b60';

function listSites() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.netlify.com',
      path: '/api/v1/sites',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const sites = JSON.parse(data);
            resolve(sites);
          } catch (e) {
            reject(new Error(`Failed to parse: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('🔍 Listando sitios disponibles en Netlify...\n');

  try {
    const sites = await listSites();
    
    if (sites.length === 0) {
      console.log('❌ No se encontraron sitios');
      return;
    }

    console.log(`✅ Encontrados ${sites.length} sitio(s):\n`);
    
    sites.forEach((site, i) => {
      console.log(`${i + 1}. ${site.name || 'Sin nombre'}`);
      console.log(`   Site ID: ${site.site_id}`);
      console.log(`   Slug: ${site.slug || site.name}`);
      console.log(`   URL: ${site.url || site.domain || 'N/A'}`);
      console.log(`   Build ID: ${site.build_id || 'N/A'}`);
      console.log('');
    });

    // Buscar el sitio correcto
    const targetSlug = 'sensational-pegasus-d56cc3';
    const targetSite = sites.find(s => s.slug === targetSlug || s.name === targetSlug || s.site_id === targetSlug);
    
    if (targetSite) {
      console.log(`\n✅ Sitio encontrado: ${targetSite.name}`);
      console.log(`   Site ID para usar: ${targetSite.site_id}`);
    } else {
      console.log(`\n⚠️  No se encontró sitio con slug "${targetSlug}"`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();

