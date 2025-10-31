// setup-pwa.js

const fs = require('fs');
const path = require('path');

// Set public directory to current directory
const publicDir = __dirname;

// Crear manifest.json con configuración para iOS/Android
const manifest = {
  name: "Sandra IA Galaxy",
  short_name: "Sandra",
  start_url: "/",
  display: "standalone",
  background_color: "#000000",
  theme_color: "#00ff88",
  icons: [
    {
      src: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png"
    }
  ],
  shortcuts: [
    {
      name: "Iniciar chat",
      url: "/chat",
      icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }]
    }
  ]
};

fs.mkdirSync(publicDir + '/icons', { recursive: true });
fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

// Service Worker básico
const swContent = `
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('sandra-cache-v1').then(cache => cache.addAll([
      '/',
      '/index.html',
      '/manifest.json',
      '/offline.html'
    ]))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then(response => response || caches.match('/offline.html')))
  );
});
`;
fs.writeFileSync(path.join(publicDir, 'sw.js'), swContent);

// Offline fallback
fs.writeFileSync(path.join(publicDir, 'offline.html'), '<h1>Sandra IA sin conexión</h1><p>Conéctate a internet para continuar.</p>');

// Instrucción para index.html (ejemplo, añadir manualmente si no existe)
console.log("✅ Archivos PWA generados: manifest.json, sw.js, offline.html");
console.log("👉 Asegúrate de enlazar en tu index.html:");
console.log(`<link rel=\"manifest\" href=\"/manifest.json\">`);
console.log(`<script>navigator.serviceWorker.register('/sw.js');</script>`);
console.log("✅ Ahora puedes hacer build o deploy a producción");