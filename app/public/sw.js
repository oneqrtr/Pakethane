/* Pakethane Admin PWA - minimal service worker for installability */
const CACHE_NAME = 'pakethane-admin-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  /* network-first: always try network, fallback not required for admin panel */
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
