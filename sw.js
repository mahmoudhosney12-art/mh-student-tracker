/* MH Student Tracker offline cache. Cache only this app's shell and local assets. */
const CACHE_PREFIX = 'mh-tracker-';
const SHELL_CACHE = 'mh-tracker-shell-v15';
const FONT_CACHE = 'mh-tracker-fonts-v15';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // addAll is atomic: if a required shell file is missing, keep the old worker active.
    await cache.addAll(CORE);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, FONT_CACHE].includes(key))
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    // Keep the app shell available offline. For navigations, prefer the network while
    // online, then fall back to the last cached shell if the network is unavailable.
    if (request.mode === 'navigate') {
      event.respondWith((async () => {
        try {
          const response = await fetch(request);
          if (response && response.ok) {
            const cache = await caches.open(SHELL_CACHE);
            await cache.put('./index.html', response.clone());
          }
          return response;
        } catch (_) {
          const cache = await caches.open(SHELL_CACHE);
          return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
        }
      })());
      return;
    }

    // Cache-first for same-origin app assets, refreshing the cache when online.
    event.respondWith((async () => {
      const shellCache = await caches.open(SHELL_CACHE);
      const cached = await shellCache.match(request, { ignoreSearch: false });
      if (cached) {
        fetch(request).then(async response => {
          if (response && response.ok) {
            const cache = await caches.open(SHELL_CACHE);
            await cache.put(request, response.clone());
          }
        }).catch(() => {});
        return cached;
      }
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(SHELL_CACHE);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        return Response.error();
      }
    })());
    return;
  }

  // Fonts are optional: cache Google Fonts CSS/font files if they were fetched online.
  // If not cached, the app falls back to the system font via its CSS stack.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith((async () => {
      const cache = await caches.open(FONT_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && response.ok) await cache.put(request, response.clone());
        return response;
      } catch (_) {
        return Response.error();
      }
    })());
  }
});
