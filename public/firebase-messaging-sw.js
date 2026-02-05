// Mood Booster PWA: FCM Push + Offline Cache
const CACHE_VERSION = 'mood-booster-v1';
const PRECACHE_NAME = CACHE_VERSION + '-precache';
const RUNTIME_NAME = CACHE_VERSION + '-runtime';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/Frieren.jpg'
];

// ---------- Offline: Install & precache ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()).catch(() => {})
  );
});

// ---------- Offline: Activate & cleanup old caches ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k.startsWith('mood-booster-') && k !== PRECACHE_NAME && k !== RUNTIME_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ---------- Offline: Fetch (cache-first for static, network-first for HTML/API) ----------
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== 'GET') return;

  const isNav = event.request.mode === 'navigate';
  const isApi = url.pathname.startsWith('/api/');
  const isStatic = url.pathname.startsWith('/_next/static/') || /\.(js|css|woff2?|ico|jpg|jpeg|png|svg|webp)$/i.test(url.pathname);

  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_NAME);

      // Static assets: cache-first (cepat saat jaringan lemot), lalu update di background
      if (isStatic) {
        const cached = await cache.match(event.request);
        if (cached) {
          fetch(event.request).then((r) => { if (r.ok) cache.put(event.request, r); }).catch(() => {});
          return cached;
        }
        try {
          const net = await fetch(event.request);
          if (net.ok) try { await cache.put(event.request, net.clone()); } catch (_) {}
          return net;
        } catch (_) {
          return new Response('Offline', { status: 503 });
        }
      }

      // Navigation & API: network-first, fallback to cache
      try {
        const net = await fetch(event.request);
        if (net.ok) {
          if (isNav || isApi) try { await cache.put(event.request, net.clone()); } catch (_) {}
          return net;
        }
        throw new Error('not ok');
      } catch (_) {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        if (isNav) {
          const fallback = await cache.match('/');
          if (fallback) return fallback;
        }
        return new Response('Offline – no cached data', { status: 503, statusText: 'Offline' });
      }
    })()
  );
});

// ---------- Firebase Cloud Messaging ----------
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAchEVBRLoqX3C3a61Pjly_N24YgW2DzzA",
  authDomain: "to-do-app-70bd5.firebaseapp.com",
  projectId: "to-do-app-70bd5",
  storageBucket: "to-do-app-70bd5.firebasestorage.app",
  messagingSenderId: "913645710843",
  appId: "1:913645710843:web:323208eb2a5193f897ef5e"
});

const messaging = firebase.messaging();

function fullUrl(path) {
  try { return new URL(path, self.location.origin).href; } catch (_) { return path; }
}

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || '🎯 Task Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a pending task',
    icon: fullUrl('/Frieren.jpg'),
    badge: fullUrl('/Frieren.jpg'),
    tag: payload.data?.taskId || 'task-notification',
    data: payload.data || {},
    requireInteraction: false
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

console.log('[SW] Mood Booster PWA (FCM + Offline) loaded');
