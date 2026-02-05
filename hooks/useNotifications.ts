'use client';

import { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener, showNotification } from '@/lib/firebase';

export interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: {
    [key: string]: string;
  };
}

export const useNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notification, setNotification] = useState<NotificationPayload | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    // Check initial permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Listen for foreground messages
    const setupListener = async () => {
      const payload = await onMessageListener();
      if (payload) {
        setNotification(payload as NotificationPayload);
        
        // Show via SW (new Notification() is illegal when SW controls the page)
        if (Notification.permission === 'granted') {
          const notif = payload as NotificationPayload;
          showNotification(notif.notification?.title || 'Task Reminder', {
            body: notif.notification?.body || '',
            icon: '/icon.jpg',
          });
        }
      }
    };

    setupListener();
  }, []);

  const requestPermission = async () => {
    setLastError(null);
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setFcmToken(token);
        setPermission('granted');
        if (token !== 'permission-granted') {
          await saveTokenToBackend(token);
        }
        return token;
      }
      return null;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setLastError(msg);
      console.error('Error requesting permission:', error);
      throw error;
    }
  };

  const saveTokenToBackend = async (token: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      await fetch(`${API_BASE}/api/notifications/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          userId: 'default-user',
          deviceName: navigator.userAgent
        }),
      });
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  };

  return {
    fcmToken,
    permission,
    notification,
    lastError,
    clearError: () => setLastError(null),
    requestPermission,
  };
};
