const CACHE_VERSION = 'v1';
const APP_CACHE = `timeflow-cache-${CACHE_VERSION}`;

const APP_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', event => {
  event.waitUntil(precache());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== APP_CACHE).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigation(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

async function precache() {
  const cache = await caches.open(APP_CACHE);
  await cache.addAll(APP_ASSETS);

  await Promise.all(
    CDN_ASSETS.map(async (url) => {
      try {
        await cache.add(new Request(url, { mode: 'no-cors' }));
      } catch (err) {
        console.warn('[service-worker] Unable to cache CDN asset', url, err);
      }
    })
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;

  try {
    const response = await fetch(request);
    const cache = await caches.open(APP_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    return cached;
  }
}

async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(APP_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (err) {
    const cachedIndex = await caches.match('./index.html');
    if (cachedIndex) return cachedIndex;
    throw err;
  }
}
