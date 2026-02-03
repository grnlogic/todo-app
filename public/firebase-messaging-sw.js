// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyAchEVBRLoqX3C3a61Pjly_N24YgW2DzzA",
  authDomain: "to-do-app-70bd5.firebaseapp.com",
  projectId: "to-do-app-70bd5",
  storageBucket: "to-do-app-70bd5.firebasestorage.app",
  messagingSenderId: "913645710843",
  appId: "1:913645710843:web:323208eb2a5193f897ef5e"
});

const messaging = firebase.messaging();

// Handle background messages (for scheduled notifications from server)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || '🎯 Task Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a pending task',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.taskId || 'task-notification',
    data: payload.data,
    requireInteraction: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if no existing window found
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

console.log('[SW] Firebase Messaging Service Worker loaded');
