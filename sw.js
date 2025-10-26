
// Sandra IA Galaxy PWA Service Worker - iOS Safari Optimized
const CACHE_NAME = 'sandra-ia-galaxy-v1';
const OFFLINE_URL = '/offline.html';

// Essential files to cache for offline functionality
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/sandra-ios-pwa-optimizations.css',
  '/sandra-responsive-enhancements.css'
];

// Install event - cache essential resources
self.addEventListener('install', event => {
  console.log('🚀 Sandra IA PWA Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📱 Caching essential files for offline support');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker installation complete');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🔄 Sandra IA PWA Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - network first, cache fallback strategy
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests (APIs, CDNs)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If we got a valid response, clone it and update cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            // If no cache match, return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            // For other requests, return a generic offline response
            return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

// Background sync for iOS compatibility
self.addEventListener('sync', event => {
  if (event.tag === 'sandra-background-sync') {
    console.log('🔄 Background sync triggered');
    // Handle background sync events
  }
});

// Push notifications support
self.addEventListener('push', event => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };

    event.waitUntil(
      self.registration.showNotification('Sandra IA Galaxy', options)
    );
  }
});

console.log('📱 Sandra IA Galaxy Service Worker loaded successfully');
