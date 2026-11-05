// MAKHANANI LTSM — Service Worker — V1.19
// XINTIMANI GROUP — Founder/CEO Mr Vusi Chauke — Johannesburg
// Works offline — Installs like a real app

const CACHE_NAME = 'makhanani-ltsm-v19';
const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './logo.png'
];

// Install — Cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_FILES);
    }).then(() => {
      return self.skipWaiting();
    }).catch((err) => {
      console.log('Makhanani SW Install — logo.png missing? Still OK', err);
    })
  );
});

// Activate — Delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch — Cache First for app files, Network First for everything else
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Never cache Firebase / Firestore / Google APIs — Always go to network
  if (
    url.includes('firestore.googleapis.com') ||
    url.includes('firebase') ||
    url.includes('googleapis.com') ||
    url.includes('gstatic.com') ||
    url.includes('jsdelivr.net')
  ) {
    return;
  }

  // For app files — Try cache, fallback to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        // Only cache successful GET requests for same-origin
        if (
          event.request.method === 'GET' &&
          response.status === 200 &&
          new URL(event.request.url).origin === self.location.origin
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback — Show index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
