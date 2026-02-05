import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: any = null;

// Check if browser supports service workers & notifications
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
  }
}

const FCM_SW_PATH = '/firebase-messaging-sw.js';

// Get or register only the Firebase Messaging service worker (do NOT unregister others – breaks Android/PWA)
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    // Prefer existing registration so we don't break Android/PWA push
    let registration = await navigator.serviceWorker.getRegistration('/');
    const existing = registration?.active?.scriptURL?.includes('firebase-messaging-sw');
    if (existing && registration) {
      console.log('Using existing FCM service worker');
      return registration;
    }
    // Optional: also check by iterating (some browsers expose scriptURL differently)
    const all = await navigator.serviceWorker.getRegistrations();
    for (const reg of all) {
      const url = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || '';
      if (url.includes('firebase-messaging-sw')) {
        console.log('Using existing FCM service worker (from list)');
        return reg;
      }
    }

    // Register FCM SW only; use updateViaCache: 'none' so Android gets latest SW
    registration = await navigator.serviceWorker.register(FCM_SW_PATH, {
      scope: '/',
      updateViaCache: 'none' as ServiceWorkerUpdateViaCache,
    });

    // Wait for this registration to be active (critical on Android)
    const waitActive = (reg: ServiceWorkerRegistration, timeoutMs = 10000): Promise<void> => {
      if (reg.active) return Promise.resolve();
      const sw = reg.installing || reg.waiting;
      if (!sw) return navigator.serviceWorker.ready.then(() => {});
      return new Promise((resolve, reject) => {
        const t = setTimeout(() => resolve(), timeoutMs);
        sw.addEventListener('statechange', function () {
          if (reg.active) {
            clearTimeout(t);
            resolve();
          } else if (this.state === 'redundant') {
            clearTimeout(t);
            reject(new Error('Service worker redundant'));
          }
        });
      });
    };
    await waitActive(registration);
    console.log('FCM Service Worker registered and active');
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw error;
  }
};

// Request notification permission and get FCM token
// Returns token, or 'permission-granted' if permission OK but no FCM token, or null if denied.
// Throws on Android/PWA when SW or getToken fails so caller can show the real error.
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('Notification permission denied');
    return null;
  }
  console.log('Notification permission granted');

  let registration: ServiceWorkerRegistration | null = null;
  try {
    registration = await registerServiceWorker();
  } catch (swError) {
    const msg = swError instanceof Error ? swError.message : String(swError);
    console.error('Service worker registration failed:', msg);
    throw new Error(`Service Worker gagal: ${msg}. Di Android pastikan HTTPS dan coba buka dari browser (bukan hanya PWA).`);
  }
  if (!registration) return 'permission-granted';

  if (!messaging) {
    console.warn('Firebase Messaging not available (e.g. SSR)');
    return 'permission-granted';
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn('NEXT_PUBLIC_FIREBASE_VAPID_KEY not set – FCM token will fail');
    throw new Error('VAPID key belum di-set. Tambahkan NEXT_PUBLIC_FIREBASE_VAPID_KEY di .env (dari Firebase Console > Project Settings > Cloud Messaging > Web Push certificates).');
  }

  try {
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    if (token) {
      console.log('FCM Token obtained');
      return token;
    }
  } catch (tokenError: unknown) {
    const err = tokenError as { message?: string; code?: string };
    const msg = err?.message || String(tokenError);
    console.error('FCM getToken failed:', msg);
    throw new Error(`FCM token gagal: ${msg}. Pastikan firebase-messaging-sw.js bisa diakses (HTTPS), dan di Android coba izinkan notifikasi lalu refresh halaman.`);
  }
  return 'permission-granted';
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      resolve(null);
      return;
    }
    
    onMessage(messaging, (payload) => {
      console.log('Message received (foreground):', payload);
      resolve(payload);
    });
  });

// Show in-app notification via ServiceWorkerRegistration (required when SW controls the page; "new Notification()" throws otherwise)
export const showNotification = async (
  title: string,
  options?: NotificationOptions,
): Promise<void> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg) {
      await reg.showNotification(title, {
        icon: '/icon.jpg',
        badge: '/icon.jpg',
        ...options,
      });
      return;
    }
  } catch (_) {
    // ignore
  }
  try {
    new Notification(title, { icon: '/icon.jpg', ...options });
  } catch (_) {
    console.warn('Could not show notification');
  }
};

export { app, messaging };
