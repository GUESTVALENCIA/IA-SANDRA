// Sandra IA Galaxy Level - Service Worker
// PWA functionality for iOS installation

const CACHE_NAME = 'sandra-ia-galaxy-v1.0.0';
const STATIC_CACHE = 'sandra-static-v1';
const DYNAMIC_CACHE = 'sandra-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Sandra IA SW: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Sandra IA SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => url !== '/'));
      })
      .then(() => {
        console.log('Sandra IA SW: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.log('Sandra IA SW: Installation failed', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('Sandra IA SW: Activating...');

  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Sandra IA SW: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ]).then(() => {
      console.log('Sandra IA SW: Activation complete');
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('Sandra IA SW: Serving from cache', event.request.url);
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Don't cache unsuccessful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response
            const responseToCache = networkResponse.clone();

            // Add to dynamic cache
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            console.log('Sandra IA SW: Serving from network', event.request.url);
            return networkResponse;
          })
          .catch(() => {
            // Network failed, try to serve a fallback
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Handle background sync
self.addEventListener('sync', event => {
  console.log('Sandra IA SW: Background sync', event.tag);

  if (event.tag === 'sandra-sync') {
    event.waitUntil(
      // Perform background sync operations
      syncSandraData()
    );
  }
});

// Handle push notifications
self.addEventListener('push', event => {
  console.log('Sandra IA SW: Push received');

  const options = {
    body: event.data ? event.data.text() : 'Sandra IA tiene una actualización',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir Sandra IA',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Sandra IA Galaxy', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Sandra IA SW: Notification clicked');

  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync function
async function syncSandraData() {
  try {
    console.log('Sandra IA SW: Syncing data...');
    // Implement data sync logic here
    return Promise.resolve();
  } catch (error) {
    console.error('Sandra IA SW: Sync failed', error);
    return Promise.reject(error);
  }
}

// Update available notification
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});