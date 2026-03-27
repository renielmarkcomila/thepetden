const CACHE_NAME = 'petden-v3';

// Install - skip waiting
self.addEventListener('install', e => {
  self.skipWaiting();
});

// Activate - delete ALL old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - NEVER cache HTML files, always get fresh from network
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Always fetch HTML files fresh from network - never cache them
  if (url.endsWith('.html') || url.includes('index') || url.includes('staff') || url.includes('customer')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Skip Firebase calls - always network
  if (url.includes('firebase') || url.includes('firestore') || url.includes('googleapis')) {
    return;
  }

  // For everything else - network first, cache as fallback
  e.respondWith(
    fetch(e.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});