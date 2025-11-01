#!/usr/bin/env node

// ═══════════════════════════════════════════════════════════════════
// SANDRA IA MOBILE - MANIFEST GENERATOR
// Production Manifest Builder for sandra.guestsvalencia.es
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

// Environment detection
const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';
const isStaging = env === 'staging';
const isProd = env === 'production';

// Domain configuration based on environment
const getDomainConfig = () => {
  switch (env) {
    case 'production':
      return {
        domain: 'sandra.guestsvalencia.es',
        url: 'https://sandra.guestsvalencia.es',
        startUrl: 'https://sandra.guestsvalencia.es/sandra-ia-mobile-galaxy-responsive.html'
      };
    case 'staging':
      return {
        domain: 'deploy-preview--sandra-mobile.netlify.app',
        url: 'https://deploy-preview--sandra-mobile.netlify.app',
        startUrl: 'https://deploy-preview--sandra-mobile.netlify.app/sandra-ia-mobile-galaxy-responsive.html'
      };
    default:
      return {
        domain: 'localhost:8080',
        url: 'http://localhost:8080',
        startUrl: 'http://localhost:8080/sandra-ia-mobile-galaxy-responsive.html'
      };
  }
};

const domainConfig = getDomainConfig();

// Generate production-ready manifest
const generateManifest = () => {
  const manifest = {
    name: "Sandra IA Mobile Galaxy Ultimate",
    short_name: "Sandra IA",
    description: "Inteligencia Artificial Galaxy Ultimate optimizada para iOS 14+ con soporte completo para iPhone Pro y iPad Pro - sandra.guestsvalencia.es",
    version: "98.0.0",
    start_url: domainConfig.startUrl,
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: "#00ff88",
    background_color: "#0a0a0a",
    lang: "es",
    dir: "ltr",

    // Enhanced app metadata
    categories: [
      "productivity",
      "utilities",
      "business",
      "education",
      "entertainment"
    ],

    // Icons with proper sizing for all devices
    icons: generateIcons(),

    // Screenshots for app stores
    screenshots: generateScreenshots(),

    // Shortcuts for quick actions
    shortcuts: generateShortcuts(),

    // Protocol handlers
    protocol_handlers: [
      {
        protocol: "web+sandra",
        url: `${domainConfig.url}/sandra-ia-mobile-galaxy-responsive.html?action=%s`
      },
      {
        protocol: "mailto",
        url: `${domainConfig.url}/sandra-ia-mobile-galaxy-responsive.html?action=compose&to=%s`
      }
    ],

    // File handlers for various file types
    file_handlers: [
      {
        action: `${domainConfig.url}/sandra-ia-mobile-galaxy-responsive.html?action=open`,
        accept: {
          "text/plain": [".txt"],
          "text/markdown": [".md"],
          "application/pdf": [".pdf"],
          "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
          "audio/*": [".mp3", ".wav", ".m4a", ".ogg"],
          "video/*": [".mp4", ".mov", ".avi", ".webm"]
        }
      }
    ],

    // Share target for content sharing
    share_target: {
      action: `${domainConfig.url}/sandra-ia-mobile-galaxy-responsive.html?action=share`,
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [
          {
            name: "files",
            accept: ["image/*", "audio/*", "video/*", "text/*", "application/pdf"]
          }
        ]
      }
    },

    // Edge side panel configuration
    edge_side_panel: {
      preferred_width: 400
    },

    // Handle links preference
    handle_links: "preferred",

    // Launch handler
    launch_handler: {
      client_mode: "focus-existing"
    },

    // Related applications
    prefer_related_applications: false,
    related_applications: [],

    // App-specific metadata
    id: `${domainConfig.url}/`,
    iarc_rating_id: "",

    // Custom Sandra IA properties
    sandra_config: {
      version: "98.0.0",
      api_version: "1.0.0",
      features: {
        chat: true,
        voice: true,
        video: true,
        files: true,
        avatar: true,
        offline: true
      },
      ai_providers: ["openai", "groq", "anthropic"],
      voice_providers: ["elevenlabs", "openai"],
      supported_languages: ["es", "en", "fr", "de", "it"],
      mobile_optimized: true,
      ios_compatible: true,
      android_compatible: true
    }
  };

  return manifest;
};

// Generate icons for all required sizes
const generateIcons = () => {
  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const icons = [];

  iconSizes.forEach(size => {
    // SVG icon with proper scaling
    const svgIcon = generateSVGIcon(size);
    icons.push({
      src: `data:image/svg+xml;base64,${Buffer.from(svgIcon).toString('base64')}`,
      sizes: `${size}x${size}`,
      type: "image/svg+xml",
      purpose: "any maskable"
    });
  });

  return icons;
};

// Generate SVG icon with specific size
const generateSVGIcon = (size) => {
  const fontSize = Math.floor(size * 0.375); // 37.5% of icon size
  const borderRadius = Math.floor(size * 0.222); // 22.2% for rounded corners

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="${size}" height="${size}" rx="${borderRadius}" fill="url(#gradient0)"/>
<text x="${size/2}" y="${size/2 + fontSize/3}" fill="#0a0a0a" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle">S</text>
<defs>
<linearGradient id="gradient0" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
<stop offset="0%" stop-color="#00ff88"/>
<stop offset="100%" stop-color="#00aaff"/>
</linearGradient>
</defs>
</svg>`;
};

// Generate screenshots for app stores
const generateScreenshots = () => {
  return [
    {
      src: generateScreenshotSVG(390, 844, "iPhone 14 Pro"),
      sizes: "390x844",
      type: "image/svg+xml",
      label: "Sandra IA Mobile en iPhone 14 Pro",
      form_factor: "narrow"
    },
    {
      src: generateScreenshotSVG(834, 1194, "iPad Pro 11\""),
      sizes: "834x1194",
      type: "image/svg+xml",
      label: "Sandra IA Mobile en iPad Pro 11\"",
      form_factor: "wide"
    }
  ];
};

// Generate screenshot SVG
const generateScreenshotSVG = (width, height, device) => {
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="${width}" height="${height}" fill="#0a0a0a"/>
<rect x="20" y="60" width="${width-40}" height="60" rx="16" fill="#1a1a2e"/>
<text x="40" y="95" fill="#00ff88" font-family="-apple-system" font-size="18" font-weight="700">🤖 Sandra IA Mobile Galaxy</text>
<rect x="20" y="140" width="${width-40}" height="${height-220}" rx="16" fill="#14141e"/>
<text x="40" y="180" fill="#ffffff" font-family="-apple-system" font-size="14">Chat con Sandra... Soporte texto, voz, archivos...</text>
<rect x="20" y="${height-80}" width="${width-40}" height="60" rx="16" fill="#1a1a2e"/>
<rect x="40" y="${height-60}" width="${width-120}" height="30" rx="15" fill="#28284a"/>
<rect x="${width-80}" y="${height-60}" width="60" height="30" rx="15" fill="url(#gradient0)"/>
<defs>
<linearGradient id="gradient0" x1="0" y1="0" x2="60" y2="30" gradientUnits="userSpaceOnUse">
<stop offset="0%" stop-color="#00ff88"/>
<stop offset="100%" stop-color="#00aaff"/>
</linearGradient>
</defs>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

// Generate app shortcuts
const generateShortcuts = () => {
  return [
    {
      name: "Nueva Conversación",
      short_name: "Nueva Chat",
      description: "Iniciar una nueva conversación con Sandra IA",
      url: `${domainConfig.url}/sandra-ia-mobile-galaxy-responsive.html?action=new`,
      icons: [
        {
          src: generateShortcutIcon("#00ff88", "💬"),
          sizes: "96x96",
          type: "image/svg+xml"
        }
      ]
    },
    {
      name: "Grabación de Voz",
      short_name: "Voz",
      description: "Iniciar grabación de voz directamente",
      url: `${domainConfig.url}/sandra-ia-mobile-galaxy-responsive.html?action=voice`,
      icons: [
        {
          src: generateShortcutIcon("#ff4757", "🎤"),
          sizes: "96x96",
          type: "image/svg+xml"
        }
      ]
    },
    {
      name: "Subir Archivo",
      short_name: "Archivo",
      description: "Subir archivo o imagen para analizar",
      url: `${domainConfig.url}/sandra-ia-mobile-galaxy-responsive.html?action=upload`,
      icons: [
        {
          src: generateShortcutIcon("#667eea", "📎"),
          sizes: "96x96",
          type: "image/svg+xml"
        }
      ]
    },
    {
      name: "Configuración",
      short_name: "Config",
      description: "Acceder a configuración y opciones",
      url: `${domainConfig.url}/sandra-ia-mobile-galaxy-responsive.html?action=settings`,
      icons: [
        {
          src: generateShortcutIcon("#aaaaaa", "⚙️"),
          sizes: "96x96",
          type: "image/svg+xml"
        }
      ]
    }
  ];
};

// Generate shortcut icon
const generateShortcutIcon = (color, emoji) => {
  const svg = `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="96" height="96" rx="20" fill="${color}"/>
<text x="48" y="60" font-size="36" text-anchor="middle">${emoji}</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

// Main execution
const main = () => {
  try {
    console.log(`📱 Generating manifest for ${env} environment...`);
    console.log(`🌐 Domain: ${domainConfig.domain}`);

    const manifest = generateManifest();
    const manifestPath = path.join(__dirname, '..', 'manifest.json');

    // Write manifest with proper formatting
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`✅ Manifest generated successfully: ${manifestPath}`);
    console.log(`📊 Manifest size: ${JSON.stringify(manifest).length} bytes`);
    console.log(`🎯 Features enabled: ${Object.keys(manifest.sandra_config.features).filter(f => manifest.sandra_config.features[f]).join(', ')}`);

    // Validate manifest
    validateManifest(manifest);

  } catch (error) {
    console.error('❌ Error generating manifest:', error);
    process.exit(1);
  }
};

// Validate manifest
const validateManifest = (manifest) => {
  const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
  const missing = required.filter(field => !manifest[field]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing required fields: ${missing.join(', ')}`);
  } else {
    console.log('✅ Manifest validation passed');
  }

  // Check icon sizes
  const iconSizes = manifest.icons.map(icon => icon.sizes);
  console.log(`🎨 Generated ${iconSizes.length} icons: ${iconSizes.join(', ')}`);

  // Check shortcuts
  console.log(`🚀 Generated ${manifest.shortcuts.length} shortcuts`);
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateManifest, getDomainConfig };