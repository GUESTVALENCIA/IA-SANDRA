'use strict';
const fs = require('fs');
const path = require('path');

// Intentar cargar roles-system si existe
let rolesList = [];
try {
  const rolesSystemPath = path.resolve(__dirname, '..', 'core', 'roles-system.js');
  if (fs.existsSync(rolesSystemPath)) {
    // Leer el archivo y extraer roles (búsqueda básica)
    const content = fs.readFileSync(rolesSystemPath, 'utf-8');
    // Buscar definiciones de roles comunes
    const roleMatches = content.matchAll(/(?:id|key|name|roleId)\s*[:=]\s*['"]([^'"]+)['"]/gi);
    const seen = new Set();
    for (const match of roleMatches) {
      const id = match[1];
      if (id && !seen.has(id) && id.length > 2) {
        seen.add(id);
        rolesList.push({ id, title: id[0].toUpperCase() + id.slice(1).replace(/_/g, ' ') });
      }
    }
  }
} catch (e) {
  console.warn('No se pudo leer roles-system.js, usando lista manual');
}

// Si no hay roles, usar lista manual común
if (rolesList.length === 0) {
  rolesList = [
    { id: 'general', title: 'General' },
    { id: 'concierge', title: 'Concierge' },
    { id: 'community_manager', title: 'Community Manager' },
    { id: 'voice_telephony', title: 'Telephony' },
    { id: 'sales', title: 'Ventas' },
    { id: 'listings_manager', title: 'Listings Manager' },
    { id: 'pricing_revenue', title: 'Pricing & Revenue' },
    { id: 'language_teacher', title: 'Profesora Idiomas' },
    { id: 'animadora', title: 'Animadora Infantil' },
    { id: 'content_seo', title: 'Content SEO' },
    { id: 'dev_support', title: 'Dev Support' },
    { id: 'guest_relations', title: 'Guest Relations' },
    { id: 'cleaning_coordinator', title: 'Cleaning Coordinator' },
    { id: 'maintenance_manager', title: 'Maintenance Manager' },
    { id: 'revenue_manager', title: 'Revenue Manager' },
    { id: 'marketing_manager', title: 'Marketing Manager' },
    { id: 'content_creator', title: 'Content Creator' },
    { id: 'social_media_manager', title: 'Social Media Manager' },
    { id: 'seo_specialist', title: 'SEO Specialist' },
    { id: 'analytics_expert', title: 'Analytics Expert' },
    { id: 'legal_advisor', title: 'Legal Advisor' },
    { id: 'financial_advisor', title: 'Financial Advisor' },
    { id: 'customer_support', title: 'Customer Support' },
    { id: 'quality_assurance', title: 'Quality Assurance' },
    { id: 'training_coordinator', title: 'Training Coordinator' }
  ];
}

const out = {
  defaultPipeline: 'voice_only',
  roles: {},
  campaigns: {
    guarderias: { title: 'Guarderías', roleId: 'language_teacher', pipeline: 'avatar_sora' },
    captacion: { title: 'Captación', roleId: 'sales', pipeline: 'voice_only' }
  }
};

for (const r of rolesList) {
  const id = r.id || r.key || r.name;
  if (!id) continue;
  const title = r.title || (id[0].toUpperCase() + id.slice(1).replace(/_/g, ' '));
  const pipeline = /infantil|teacher|profesora|animadora|language_teacher/i.test(id) ? 'avatar_sora' : 'voice_only';
  out.roles[id] = { title, pipeline };
}

const p = path.resolve(__dirname, '..', 'callcenter', 'config', 'dialplan.json');
fs.writeFileSync(p, JSON.stringify(out, null, 2));
console.log('✅ Dialplan actualizado:', p);
console.log(`   Roles: ${Object.keys(out.roles).length}`);
console.log(`   Campañas: ${Object.keys(out.campaigns).length}`);

