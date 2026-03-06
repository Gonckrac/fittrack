// FitTrack Service Worker
// Maneja notificaciones push y cache offline

const CACHE_NAME = 'fittrack-v3';

// ── Instalación: cachear el HTML principal ──────────────────────
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['./index38.html']).catch(() => {});
    })
  );
});

// ── Activación: limpiar caches viejos ──────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: servir desde cache si está offline ──────────────────
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ── Notificaciones: mostrar cuando llega un mensaje ───────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SHOW_NOTIF') {
    const { title, body } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: './icon-192.png',
        badge: './icon-192.png',
        vibrate: [300, 100, 300, 100, 300],
        requireInteraction: false,
        silent: false,
        tag: 'fittrack-timer'
      })
    );
  }
});

// ── Click en notificación: abrir la app ───────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('./index38.html');
    })
  );
});
