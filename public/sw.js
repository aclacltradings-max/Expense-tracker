/*
 * Expense Tracker service worker.
 *
 * Strategy
 *   - App shell (HTML, manifest, icons): precached on install.
 *   - Navigations: network first, falling back to the cached shell, then to
 *     the offline page.
 *   - Same-origin assets (hashed JS/CSS) and web fonts: stale-while-revalidate,
 *     so a first visit populates the cache and later visits work offline.
 *
 * Updates
 *   A new worker installs but does NOT activate on its own. The page detects it
 *   and asks the user to reload; on confirmation the page posts SKIP_WAITING and
 *   reloads once the new worker takes control. This avoids swapping assets out
 *   from under a running session.
 */

const VERSION = 'v1';
const SHELL_CACHE = `expense-tracker-shell-${VERSION}`;
const ASSET_CACHE = `expense-tracker-assets-${VERSION}`;
const FONT_CACHE = `expense-tracker-fonts-${VERSION}`;
const KEEP_CACHES = [SHELL_CACHE, ASSET_CACHE, FONT_CACHE];

const OFFLINE_URL = '/offline.html';
const SHELL_URLS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
];

/* --------------------------------------------------------------- install --- */

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Individually so one bad URL cannot fail the whole install.
      await Promise.all(
        SHELL_URLS.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: 'reload' }));
          } catch (error) {
            console.warn('[sw] could not precache', url, error);
          }
        }),
      );
    })(),
  );
});

/* -------------------------------------------------------------- activate --- */

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => !KEEP_CACHES.includes(key)).map((key) => caches.delete(key)),
      );

      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }

      // Take control of pages that were loaded before this worker existed.
      await self.clients.claim();
    })(),
  );
});

/* ----------------------------------------------------------------- fetch --- */

function isFontRequest(url) {
  return (
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com'
  );
}

async function staleWhileRevalidate(event, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);

  const network = fetch(event.request)
    .then((response) => {
      // Opaque responses (cross-origin no-cors) are still worth caching.
      if (response && (response.ok || response.type === 'opaque')) {
        const copy = response.clone();
        cache.put(event.request, copy).catch(() => {});
      }
      return response;
    })
    .catch(() => cached);

  return cached || network;
}

async function handleNavigation(event) {
  const cache = await caches.open(SHELL_CACHE);

  try {
    const preloaded = await event.preloadResponse;
    const response = preloaded || (await fetch(event.request));

    if (response && response.ok) {
      // Every route serves the same SPA shell, so store it under a stable key.
      cache.put('/index.html', response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return (
      (await cache.match('/index.html')) ||
      (await cache.match('/')) ||
      (await cache.match(OFFLINE_URL)) ||
      Response.error()
    );
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(event, ASSET_CACHE));
    return;
  }

  if (isFontRequest(url)) {
    event.respondWith(staleWhileRevalidate(event, FONT_CACHE));
  }
});

/* --------------------------------------------------------------- message --- */

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
