const CACHE_NAME = 'spellingmon-v1';
const ASSETS = [
  './',
  './index.html',
  './favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use a more robust approach: try to add all, but don't fail the whole install if one fails
      // though for core assets we usually want them all.
      // Here, removing the invalid main.js should fix the primary issue.
      return cache.addAll(ASSETS).catch(err => {
        console.error('Service Worker cache.addAll failed:', err);
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
