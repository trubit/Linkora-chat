// Linkora Service Worker
const CACHE_NAME = 'linkora-v2';
const PRECACHE_URLS = ['/'];

// Install: pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Always network for API calls and socket.io
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io')) {
    return;
  }

  // Cache-first for static assets
  if (request.method === 'GET' && url.pathname.match(/\.(js|css|png|jpg|svg|woff2?|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (!res || res.status !== 200) return res;
          const toCache = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, toCache));
          return res;
        });
      }),
    );
    return;
  }

  // Network-first for HTML navigation
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/') ?? new Response('Offline')));
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = { title: 'Linkora', body: 'You have a new notification', icon: '/favicon.svg' };
  try {
    data = { ...data, ...event.data.json() };
  } catch {
    data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? '/favicon.svg',
      badge: '/favicon.svg',
      tag: data.tag ?? 'linkora-notification',
      data: data,
      requireInteraction: false,
    }),
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});
