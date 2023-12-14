/// <reference lib="WebWorker" />

const ASSETS = {
  html: ['./', './index.html', './offline.html',],
  js: [
    './main.js',
    './lib/phaser.js',
    './src/prefabs/Language.js',
    './src/prefabs/Plant.js',
    './src/scenes/Load.js',
    './src/scenes/Play.js',
  ],
  gameAssets: [
    './assets/en.json',
    './assets/ja.json',
    './assets/zh.json',
    './assets/gamemap.json',
    './assets/gamemap.png',
    './assets/gamemap.tmx',
    './assets/plants.json',
    './assets/plants.png',
    './assets/tiles.png',
    './assets/pig.png',
    './assets/pig.json',
    './assets/gameScenario.json',
  ],
};

function addToCache(cache, assets) {
  return cache.addAll(assets).catch((error) => {
    console.error("Failed to add assets to cache", error);
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('game-cache').then((cache) => {
      return Promise.all([
        addToCache(cache, ASSETS.html),
        addToCache(cache, ASSETS.js),
        addToCache(cache, ASSETS.gameAssets),
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch((error) => {
          console.error("Fetch failed; returning offline page instead.", error);
          return caches.match('./offline.html');
        })
      );
    })
  );
});
