/**
 * Service Worker for Khalasly (خلصلى)
 * Handles Native Web Push Notifications, Action Clicks & Background Sync
 */

self.addEventListener('install', (event) => {
  // Activate worker immediately without waiting
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Become available to all clients immediately
  event.waitUntil(self.clients.claim());
});

/**
 * Handle incoming push notifications from Web Push protocol / VAPID
 */
self.addEventListener('push', (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = {
        title: 'إشعار جديد من خلصلى',
        body: event.data.text()
      };
    }
  } else {
    payload = {
      title: 'إشعار جديد من منصة خلصلى',
      body: 'لديك تحديث جديد على حسابك في خلصلى'
    };
  }

  const title = payload.title || 'إشعار جديد | خلصلى';
  const options = {
    body: payload.body || payload.message || 'لديك طلب جديد أو تحديث على حجزك',
    icon: payload.icon || '/favicon.svg',
    badge: payload.badge || '/favicon.svg',
    vibrate: [200, 100, 200, 100, 200],
    tag: payload.tag || `khalasly-${payload.bookingId || Date.now()}`,
    renotify: true,
    requireInteraction: payload.requireInteraction !== false,
    dir: 'rtl',
    lang: 'ar',
    data: {
      url: payload.url || (payload.role === 'provider' ? '/?view=provider-dashboard' : '/?view=customer-dashboard'),
      bookingId: payload.bookingId,
      eventType: payload.eventType,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'عرض التفاصيل'
      },
      {
        action: 'dismiss',
        title: 'إغلاق'
      }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Handle notification clicks: navigate to booking/dashboard & focus window
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a matching or open window is found, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }

      // If no window is currently open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

/**
 * Handle notification close event (for logging/analytics if needed)
 */
self.addEventListener('notificationclose', (event) => {
  // Notification dismissed by user
});
