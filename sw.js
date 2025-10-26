
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
