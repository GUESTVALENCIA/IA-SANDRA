// ═══════════════════════════════════════════════════════════════════
// SANDRA IA MOBILE GALAXY - SERVICE WORKER
// Galaxy Level PWA Service Worker 98.0.0
// Environment: production
// Domain: sandra.guestsvalencia.es
// Generated: 2025-10-29T06:30:00.000Z
// ═══════════════════════════════════════════════════════════════════

const CACHE_NAME = 'sandra-mobile-galaxy-99.1.0-production';
const STATIC_CACHE = 'sandra-static-98.0.0';
const DYNAMIC_CACHE = 'sandra-dynamic-98.0.0';
const API_CACHE = 'sandra-api-98.0.0';
const RUNTIME_CACHE = 'sandra-runtime-98.0.0';

// Environment configuration - AUTO-DETECT
const ENV = 'production';
const DOMAIN = self.location.hostname;
const BASE_URL = self.location.origin;
const API_BASE = `${self.location.origin}/api`;

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/sandra-mobile-app.html',
    '/manifest.json',
    '/js/sandra-mobile-app.js',
    '/img/avatar-sandra.png',
    // Desktop COE
    '/desktop/index.html',
    '/desktop/styles.css',
    '/desktop/app.js'
];

// API endpoints to cache strategically
const API_ENDPOINTS = [
    'https://api.openai.com/v1/chat/completions',
    'https://api.groq.com/openai/v1/chat/completions',
    'https://api.anthropic.com/v1/messages'
];

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
    NETWORK_ONLY: 'network-only',
    CACHE_ONLY: 'cache-only'
};

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
    STATIC: 7 * 24 * 60 * 60 * 1000,      // 7 days
    DYNAMIC: 24 * 60 * 60 * 1000,         // 1 day
    API: 5 * 60 * 1000,                   // 5 minutes
    RUNTIME: 60 * 60 * 1000               // 1 hour
};

// ═══════════════════════════════════════════════════════════════════
// SERVICE WORKER INSTALLATION
// ═══════════════════════════════════════════════════════════════════

self.addEventListener('install', event => {
    console.log(`📱 Sandra Mobile Service Worker ${CACHE_NAME} installing...`);

    event.waitUntil(
        Promise.all([
            // Cache static files
            caches.open(STATIC_CACHE).then(cache => {
                console.log('💾 Caching static files...');
                return cache.addAll(STATIC_FILES.filter(url => {
                    try {
                        new URL(url, self.location);
                        return true;
                    } catch {
                        console.warn(`⚠️  Invalid URL: ${url}`);
                        return false;
                    }
                }));
            }),

            // Pre-cache critical resources
            preCacheCriticalResources(),

            // Initialize runtime cache
            caches.open(RUNTIME_CACHE)
        ]).then(() => {
            console.log('✅ Service Worker installation complete');
            return self.skipWaiting();
        }).catch(error => {
            console.error('❌ Service Worker installation failed:', error);
        })
    );
});

// ═══════════════════════════════════════════════════════════════════
// SERVICE WORKER ACTIVATION
// ═══════════════════════════════════════════════════════════════════

self.addEventListener('activate', event => {
    console.log(`🔄 Sandra Mobile Service Worker ${CACHE_NAME} activating...`);

    event.waitUntil(
        Promise.all([
            // Clean old caches
            cleanOldCaches(),

            // Claim all clients
            self.clients.claim(),

            // Update cache strategies
            updateCacheStrategies()
        ]).then(() => {
            console.log('✅ Service Worker activation complete');
        }).catch(error => {
            console.error('❌ Service Worker activation failed:', error);
        })
    );
});

// ═══════════════════════════════════════════════════════════════════
// FETCH EVENT HANDLING
// ═══════════════════════════════════════════════════════════════════

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Route to appropriate strategy
    if (isStaticResource(url)) {
        event.respondWith(handleStaticResource(request));
    } else if (isAPIRequest(url)) {
        event.respondWith(handleAPIRequest(request));
    } else if (isDocumentRequest(request)) {
        event.respondWith(handleDocumentRequest(request));
    } else {
        event.respondWith(handleDynamicResource(request));
    }
});

// ═══════════════════════════════════════════════════════════════════
// CACHE STRATEGY IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════

// Handle static resources (Cache First)
async function handleStaticResource(request) {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            // Return cached version and update in background
            updateCacheInBackground(cache, request);
            return cachedResponse;
        }

        // Fetch and cache
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;

    } catch (error) {
        console.warn('Static resource fetch failed:', error);
        return createFallbackResponse();
    }
}

// Handle API requests (Network First with timeout)
async function handleAPIRequest(request) {
    try {
        const cache = await caches.open(API_CACHE);

        // Try network first with timeout
        const networkPromise = fetchWithTimeout(request, 5000);

        try {
            const response = await networkPromise;
            if (response.ok) {
                // Cache successful API responses briefly
                cache.put(request, response.clone());
            }
            return response;
        } catch (networkError) {
            // Fall back to cache
            const cachedResponse = await cache.match(request);
            if (cachedResponse) {
                console.log('📱 Serving API request from cache');
                return cachedResponse;
            }
            throw networkError;
        }

    } catch (error) {
        console.warn('API request failed:', error);
        return new Response(
            JSON.stringify({
                error: 'Network unavailable',
                message: 'Sandra IA is currently offline. Please try again later.',
                cached: false
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle document requests (Stale While Revalidate)
async function handleDocumentRequest(request) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);

        // Serve from cache while updating
        const fetchPromise = fetch(request).then(response => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        });

        return cachedResponse || await fetchPromise;

    } catch (error) {
        console.warn('Document request failed:', error);
        // Return main app if available
        const cache = await caches.open(STATIC_CACHE);
        const fallback = await cache.match('/index.html');
        return fallback || createFallbackResponse();
    }
}

// Handle dynamic resources (Runtime caching)
async function handleDynamicResource(request) {
    try {
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse && !isExpired(cachedResponse)) {
            return cachedResponse;
        }

        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;

    } catch (error) {
        console.warn('Dynamic resource fetch failed:', error);
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);
        return cachedResponse || createFallbackResponse();
    }
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

// Check if URL is a static resource
function isStaticResource(url) {
    return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/);
}

// Check if URL is an API request
function isAPIRequest(url) {
    return url.pathname.startsWith('/api/') ||
           API_ENDPOINTS.some(endpoint => url.href.startsWith(endpoint));
}

// Check if request is for a document
function isDocumentRequest(request) {
    return request.headers.get('accept').includes('text/html');
}

// Fetch with timeout
function fetchWithTimeout(request, timeout = 5000) {
    return Promise.race([
        fetch(request),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Fetch timeout')), timeout)
        )
    ]);
}

// Check if cached response is expired
function isExpired(response) {
    const cachedTime = response.headers.get('sw-cached-time');
    if (!cachedTime) return false;

    const age = Date.now() - parseInt(cachedTime);
    return age > CACHE_DURATIONS.RUNTIME;
}

// Update cache in background
function updateCacheInBackground(cache, request) {
    fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
    }).catch(error => {
        console.warn('Background cache update failed:', error);
    });
}

// Pre-cache critical resources
async function preCacheCriticalResources() {
    const cache = await caches.open(RUNTIME_CACHE);

    // Add timestamp to responses
    const responses = await Promise.allSettled(
        STATIC_FILES.map(async url => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const modifiedResponse = new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: {
                            ...response.headers,
                            'sw-cached-time': Date.now().toString()
                        }
                    });
                    await cache.put(url, modifiedResponse);
                }
            } catch (error) {
                console.warn(`Failed to pre-cache ${url}:`, error);
            }
        })
    );

    console.log(`📦 Pre-cached ${responses.filter(r => r.status === 'fulfilled').length} resources`);
}

// Clean old caches
async function cleanOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name =>
        name.startsWith('sandra-') && !name.includes('99.1.0')
    );

    await Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
    );

    if (oldCaches.length > 0) {
        console.log(`🗑️  Cleaned ${oldCaches.length} old caches`);
    }
}

// Update cache strategies
async function updateCacheStrategies() {
    console.log('🔄 Updating cache strategies...');

    // Clear expired API cache
    const apiCache = await caches.open(API_CACHE);
    const apiKeys = await apiCache.keys();

    await Promise.all(
        apiKeys.map(async request => {
            const response = await apiCache.match(request);
            if (response && isExpired(response)) {
                await apiCache.delete(request);
            }
        })
    );
}

// Create fallback response
function createFallbackResponse() {
    return new Response(
        `<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sandra IA - Offline</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    background: linear-gradient(135deg, #0a0a0a, #1a1a2e);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    text-align: center;
                }
                .container { max-width: 400px; padding: 20px; }
                .logo { font-size: 48px; margin-bottom: 20px; }
                h1 { color: #00ff88; }
                .retry {
                    background: linear-gradient(135deg, #00ff88, #00aaff);
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    color: black;
                    font-weight: bold;
                    margin-top: 20px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">🤖</div>
                <h1>Sandra IA</h1>
                <p>No hay conexión a internet. Algunos contenidos están disponibles offline.</p>
                <button class="retry" onclick="location.reload()">Reintentar</button>
            </div>
        </body>
        </html>`,
        {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        }
    );
}

// ═══════════════════════════════════════════════════════════════════
// MESSAGE HANDLING
// ═══════════════════════════════════════════════════════════════════

self.addEventListener('message', event => {
    const { type, payload } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CACHE_UPDATE':
            updateCacheInBackground(payload.cache, payload.request);
            break;

        case 'CLEAR_CACHE':
            caches.delete(payload.cacheName || CACHE_NAME);
            break;

        default:
            console.log('Unknown message type:', type);
    }
});

// ═══════════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS (Future enhancement)
// ═══════════════════════════════════════════════════════════════════

self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: 'sandra-notification',
            renotify: true,
            actions: [
                {
                    action: 'open',
                    title: 'Abrir Sandra IA',
                    icon: '/icons/action-open.png'
                },
                {
                    action: 'dismiss',
                    title: 'Cerrar',
                    icon: '/icons/action-close.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Sandra IA', options)
        );
    }
});

self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(BASE_URL)
        );
    }
});

console.log(`🚀 Sandra Mobile Service Worker ${CACHE_NAME} loaded successfully`);
console.log(`🌐 Environment: ${ENV}`);
console.log(`📱 Domain: ${DOMAIN}`);