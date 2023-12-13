/// <reference lib="WebWorker" />

self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('game-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          // other assets like CSS, JavaScript, images, etc.
        ]);
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
