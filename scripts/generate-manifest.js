/**
 * Generador dinámico de manifest.json
 * Detecta entorno y genera manifest sin localhost
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Detectar entorno
const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '.env.production' : '.env';

// Cargar variables de entorno
const envPath = path.join(__dirname, '..', envFile);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`📋 Cargando variables de entorno desde: ${envFile}`);
} else {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
  console.log(`📋 Cargando variables de entorno desde: .env`);
}

// Base URL según entorno
const getBaseUrl = () => {
  if (env === 'production') {
    return process.env.BASE_URL || 'https://sandra.guestsvalencia.es';
  }
  return process.env.BASE_URL || 'http://localhost:7777';
};

const baseUrl = getBaseUrl();

// Generar manifest
const manifest = {
  name: process.env.PWA_NAME || "Sandra DevConsole",
  short_name: process.env.PWA_SHORT_NAME || "Sandra",
  description: process.env.PWA_DESCRIPTION || "Sandra IA - Tu Aliada Digital Empática",
  start_url: "/", // SIEMPRE relativo, nunca localhost
  display: "standalone",
  background_color: "#667eea",
  theme_color: "#764ba2",
  orientation: "portrait-primary",
  icons: [
    {
      src: "/assets/images/sandra-avatar.svg",
      sizes: "192x192",
      type: "image/svg+xml",
      purpose: "any maskable"
    }
  ],
  scope: "/",
  lang: "es",
  dir: "ltr",
  categories: ["productivity", "business", "developer"],
  shortcuts: [
    {
      name: "Nuevo Chat",
      short_name: "Chat",
      description: "Iniciar nueva conversación",
      url: "/?action=new-chat", // Relativo
      icons: [{ 
        src: "/assets/images/sandra-avatar.svg", 
        sizes: "96x96" 
      }]
    }
  ],
  share_target: {
    action: "/share", // Relativo
    method: "POST",
    enctype: "multipart/form-data",
    params: {
      title: "title",
      text: "text",
      url: "url"
    }
  },
  prefer_related_applications: false
};

// Validar que no tenga localhost
const manifestStr = JSON.stringify(manifest, null, 2);
if (manifestStr.includes('localhost')) {
  console.error('❌ ERROR: Manifest contiene "localhost"!');
  process.exit(1);
}

// Escribir manifest
const manifestPath = path.join(__dirname, '..', 'frontend', 'manifest.json');
fs.writeFileSync(manifestPath, manifestStr, 'utf8');

console.log(`✅ Manifest generado: ${manifestPath}`);
console.log(`   Entorno: ${env}`);
console.log(`   Base URL: ${baseUrl}`);
console.log(`   start_url: ${manifest.start_url} (relativo)`);

