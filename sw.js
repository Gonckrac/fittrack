// FitTrack Service Worker v4
const CACHE_NAME = 'fittrack-v4';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SHOW_NOTIF') {
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        vibrate: [300,100,300,100,300],
        requireInteraction: false,
        tag: 'fittrack-timer'
      })
    );
  }

  // SW espera hasta endTime y muestra la notif — funciona con pantalla bloqueada
  if (data.type === 'SCHEDULE_NOTIF') {
    const { title, body, endTime } = data;
    const delay = Math.max(0, endTime - Date.now());
    event.waitUntil(
      new Promise(resolve => setTimeout(resolve, delay)).then(() =>
        self.registration.showNotification(title, {
          body,
          vibrate: [300,100,300,100,300],
          requireInteraction: true,
          tag: 'fittrack-timer',
          silent: false
        })
      )
    );
  }

  if (data.type === 'CANCEL_NOTIF') {
    event.waitUntil(
      self.registration.getNotifications({ tag: 'fittrack-timer' })
        .then(notifs => notifs.forEach(n => n.close()))
    );
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('./');
    })
  );
});
