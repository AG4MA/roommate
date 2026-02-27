// rooMate Service Worker for Web Push Notifications
// This file must be served from the root of the domain

const CACHE_NAME = 'roomate-v1';
const APP_URL = self.location.origin;

// ==================== Install ====================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  self.skipWaiting();
});

// ==================== Activate ====================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(self.clients.claim());
});

// ==================== Push Event ====================

self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[SW] Push received with no data');
    return;
  }

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: 'rooMate',
      body: event.data.text(),
    };
  }

  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/badge-72x72.png',
    image: payload.image || undefined,
    tag: payload.tag || 'roomate-notification',
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: payload.url || APP_URL,
      ...payload.data,
    },
    actions: getActionsForType(payload.data?.type),
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'rooMate', options)
  );
});

// ==================== Notification Click ====================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  const url = event.notification.data?.url || APP_URL;
  
  // Handle action buttons
  if (event.action === 'view') {
    // Default — open the URL
  } else if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // If there's already a window open, focus it and navigate
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// ==================== Notification Close ====================

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// ==================== Helpers ====================

function getActionsForType(type) {
  switch (type) {
    case 'NEW_MESSAGE':
      return [
        { action: 'view', title: 'Leggi', icon: '/icons/message.png' },
        { action: 'dismiss', title: 'Chiudi', icon: '/icons/close.png' },
      ];
    case 'INTEREST_RECEIVED':
      return [
        { action: 'view', title: 'Vedi profilo', icon: '/icons/user.png' },
        { action: 'dismiss', title: 'Chiudi', icon: '/icons/close.png' },
      ];
    case 'BOOKING_CONFIRMED':
      return [
        { action: 'view', title: 'Dettagli', icon: '/icons/calendar.png' },
        { action: 'dismiss', title: 'Chiudi', icon: '/icons/close.png' },
      ];
    default:
      return [
        { action: 'view', title: 'Apri', icon: '/icons/open.png' },
      ];
  }
}
