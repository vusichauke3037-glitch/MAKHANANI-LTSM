const CACHE_NAME = 'makhanani-ltsm-v25';
const FILES_TO_CACHE = [
  './',
  './index.html?v=ltsm35',
  './manifest.json',
  './logo.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE)).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => { if (k !== CACHE_NAME) return caches.delete(k); }))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('firestore.googleapis.com') || e.request.url.includes('firebase') || e.request.url.includes('googleapis')) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      let copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
