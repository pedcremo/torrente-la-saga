'use strict';
// Torrente: La Saga — service worker: offline play once loaded.
// Bump VERSION whenever any cached file changes so players get the update.
const VERSION = 'torrente-v3';
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'assets/music.js', 'src/core.js', 'src/art.js', 'src/levels.js', 'src/game.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== VERSION).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate: answer from cache instantly, refresh it in the background.
// Also caches Google Fonts and any custom song in assets/ the first time they load.
self.addEventListener('fetch', e => {
  // Audio uses Range requests (206 replies can't be cached): let those go to the network.
  if (e.request.method !== 'GET' || e.request.headers.has('range')) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const cached = await cache.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then(res => {
      if (res.status === 200 || res.type === 'opaque') cache.put(e.request, res.clone());
      return res;
    }).catch(() => cached);
    return cached || fresh;
  }));
});
