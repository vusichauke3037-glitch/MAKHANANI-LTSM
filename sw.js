// Makhanani LTSM — Service Worker v1
const CACHE = 'makhanani-ltsm-v1';
const FILES = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./logo.png','./Jobs.html'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE ? caches.delete(k) : null))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => { let copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; }).catch(()=>caches.match('./index.html')))); });
