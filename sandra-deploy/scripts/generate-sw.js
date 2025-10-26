// Sandra IA Galaxy PWA - Service Worker Generator
// Generates optimized service worker for PWA functionality

const fs = require('fs').promises;
const path = require('path');

/**
 * Sandra IA Galaxy Service Worker Generator
 * Creates service worker with caching strategies optimized for PWA
 */
class ServiceWorkerGenerator {
  constructor() {
    this.version = process.env.SW_VERSION || Date.now().toString();
    this.cacheName = `sandra-ia-galaxy-v${this.version}`;
    this.staticAssets = [
      '/',
      '/app.html',
      '/index.html',
      '/manifest.json',
      '/offline.html'
    ];
  }

  async generate() {
    console.log('🔧 Generating Sandra IA Galaxy Service Worker...');

    const serviceWorkerContent = this.createServiceWorkerContent();
    await fs.writeFile('sw.js', serviceWorkerContent);

    console.log(`✅ Service Worker generated: sw.js (version: ${this.version})`);
    return this.cacheName;
  }

  createServiceWorkerContent() {
    return `
// Sandra IA Galaxy PWA - Service Worker
// Version: ${this.version}
// Generated: ${new Date().toISOString()}

const CACHE_NAME = '${this.cacheName}';
const STATIC_CACHE = '${this.cacheName}-static';
const DYNAMIC_CACHE = '${this.cacheName}-dynamic';
const MAX_DYNAMIC_ITEMS = 50;

// Static assets to cache immediately
const STATIC_ASSETS = ${JSON.stringify(this.staticAssets, null, 2)};

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /\\/health$/,
  /\\/status$/,
  /\\/metrics$/
];

// Resources that should always be fetched from network
const NETWORK_FIRST_PATTERNS = [
  /\\/api\\//,
  /websocket/,
  /real-time/
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing Sandra IA Galaxy Service Worker v${this.version}');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Sandra IA Galaxy Service Worker v${this.version}');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        const deletePromises = cacheNames
          .filter(cacheName =>
            cacheName.startsWith('sandra-ia-galaxy-') &&
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE
          )
          .map(cacheName => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          });

        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('[SW] Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Network-first strategy for API calls
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Cache-first strategy for static assets
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.includes('.')) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Stale-while-revalidate for dynamic content
  event.respondWith(staleWhileRevalidateStrategy(request));
});

// Network-first strategy
async function networkFirstStrategy(request) {
  try {
    console.log('[SW] Network-first:', request.url);
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }

    throw error;
  }
}

// Cache-first strategy
async function cacheFirstStrategy(request) {
  console.log('[SW] Cache-first:', request.url);
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log('[SW] Serving from cache:', request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed:', request.url, error);

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }

    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidateStrategy(request) {
  console.log('[SW] Stale-while-revalidate:', request.url);
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Fetch from network in background
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      // Update cache with new response
      cache.put(request, response.clone());

      // Manage cache size
      manageCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
    }
    return response;
  }).catch(error => {
    console.log('[SW] Network update failed:', request.url, error);
  });

  // Return cached version immediately if available
  if (cachedResponse) {
    console.log('[SW] Serving stale content:', request.url);
    return cachedResponse;
  }

  // If no cache, wait for network
  try {
    return await networkPromise;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
    throw error;
  }
}

// Manage cache size
async function manageCacheSize(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxItems) {
      console.log('[SW] Managing cache size for:', cacheName);
      const deleteCount = keys.length - maxItems;

      // Delete oldest items (FIFO)
      for (let i = 0; i < deleteCount; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch (error) {
    console.error('[SW] Cache management failed:', error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sandra-offline-sync') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync offline actions when connection is restored
async function syncOfflineActions() {
  try {
    console.log('[SW] Syncing offline actions...');

    // Get offline actions from IndexedDB (if implemented)
    // This would sync any chat messages or actions queued while offline

    console.log('[SW] Offline sync completed');
  } catch (error) {
    console.error('[SW] Offline sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'Sandra IA Galaxy notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'sandra-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open Sandra IA',
        icon: '/icon-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-dismiss.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Sandra IA Galaxy', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/app.html')
    );
  }
});

// Message handling from main app
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: '${this.version}' });
        break;
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
    }
  }
});

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error);
  }
}

// Error handling
self.addEventListener('error', event => {
  console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Sandra IA Galaxy Service Worker v${this.version} loaded successfully');
`;
  }
}

// CLI execution
async function main() {
  const generator = new ServiceWorkerGenerator();

  try {
    await generator.generate();
    console.log('🎉 Service Worker generation completed successfully!');
  } catch (error) {
    console.error('💥 Service Worker generation failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
module.exports = ServiceWorkerGenerator;

// Run if called directly
if (require.main === module) {
  main();
}