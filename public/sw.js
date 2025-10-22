// PHASE 2: Safe SW across deploys - version bumped to v3
const CACHE_NAME = 'driveWise-fleetflow-v3';
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v3';

// Only cache minimal shell - do NOT cache HTML routes to avoid stale asset references
const urlsToCache = [
  '/',
  '/manifest.json',
  '/lovable-uploads/0fe8cfa9-3548-415c-bc9c-114a2b91ae82.png'
];

// API endpoints that should be cached with network-first strategy
const API_CACHE_PATTERNS = [
  /\/api\/vehicles/,
  /\/api\/customers/,
  /\/api\/reservations/,
  /supabase/
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.debug(`📦 SW v3 installing...`);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.debug('Caching app shell (minimal)');
        return cache.addAll(urlsToCache);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Handle API requests with network-first strategy
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    console.debug('🌐 API request (network-first):', request.url);
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // PHASE 2: Navigation requests use network-first with offline fallback
  // This prevents serving stale HTML with outdated asset references
  if (request.mode === 'navigate' || request.headers.get('Accept')?.includes('text/html')) {
    console.debug('📄 Navigation request (network-first):', request.url);
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache HTML responses to avoid stale asset references
          return response;
        })
        .catch(() => {
          console.debug('📴 Offline: serving fallback shell for:', request.url);
          // Return cached index.html only when offline
          return caches.match('/');
        })
    );
    return;
  }

  // Default cache-first strategy for other resources (JS, CSS, images, etc.)
  console.debug('💾 Asset request (cache-first):', request.url);
  event.respondWith(
    caches.match(request)
      .then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          // Cache successful responses
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return fetchResponse;
        });
      })
  );
});

// Network-first strategy for API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline - Data not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.debug('✅ SW v3 activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
              console.debug('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any queued actions when coming back online
  console.log('Performing background sync...');
}