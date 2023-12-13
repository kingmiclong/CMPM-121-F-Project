/// <reference lib="WebWorker" />

self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('game-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/main.js',
          
          '/assets/en.json',
          '/assets/ja.json',
          '/assets/zh.json',
          '/assets/gamemap.json',
          '/assets/gamemap.png',
          '/assets/gamemap.tmx',
          '/assets/plants.json',
          '/assets/plants.png',
          '/assets/tiles.png',
          '/assets/pig.png',
          '/assets/pig.json',
          '/assets/gameScenario.json',
          
          '/src/prefabs/Language.js',
          '/src/prefabs/Plant.js',

          '/src/scenes/Load.js',
          '/src/scenes/Play.js',

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
