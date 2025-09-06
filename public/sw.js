// Service Worker for caching API responses and static assets
const CACHE_NAME = 'supernova-v1';
const API_CACHE_NAME = 'supernova-api-v1';

// Cache static assets
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/rest.png',
  '/vite.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Filter out any potentially problematic URLs
        const validAssets = STATIC_ASSETS.filter(asset => {
          try {
            const url = new URL(asset, self.location.origin);
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch (e) {
            console.warn('Invalid asset URL:', asset);
            return false;
          }
        });
        return cache.addAll(validAssets);
      })
      .then(() => self.skipWaiting())
      .catch(err => {
        console.error('Service worker installation failed:', err);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
    .catch(err => {
      console.error('Service worker activation failed:', err);
    })
  );
});

// Helper function to check if a request/response can be cached
function isCacheable(request, response) {
  const url = new URL(request.url);
  
  // Skip unsupported schemes
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }
  
  // Skip chrome extensions and other unsupported schemes
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return false;
  }
  
  // Skip partial responses (206), redirects, and errors
  if (response.status === 206 || response.status >= 300) {
    return false;
  }
  
  // Only cache GET requests
  if (request.method !== 'GET') {
    return false;
  }
  
  return true;
}

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip unsupported schemes entirely
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Handle API requests (Convex)
  if (url.origin.includes('convex.cloud') || url.pathname.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            // Return cached response and update cache in background
            fetch(request).then(networkResponse => {
              if (networkResponse.ok && isCacheable(request, networkResponse)) {
                cache.put(request, networkResponse.clone()).catch(err => {
                  console.warn('Failed to cache API response:', err);
                });
              }
            }).catch(() => {
              // Network failed, but we have cache
            });
            return response;
          }

          // No cache, fetch from network
          return fetch(request).then(networkResponse => {
            if (networkResponse.ok && isCacheable(request, networkResponse)) {
              cache.put(request, networkResponse.clone()).catch(err => {
                console.warn('Failed to cache API response:', err);
              });
            }
            return networkResponse;
          }).catch(() => {
            // Both cache and network failed
            return new Response('Offline', { status: 503 });
          });
        });
      })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response;
      }

      return fetch(request).then(networkResponse => {
        // Cache successful responses
        if (networkResponse.ok && isCacheable(request, networkResponse)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache).catch(err => {
              console.warn('Failed to cache static asset:', err);
            });
          });
        }
        return networkResponse;
      });
    })
  );
});