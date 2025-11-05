// PAPI Hair Design - Service Worker for PWA functionality
const CACHE_NAME = 'papi-hair-design-v1';
const urlsToCache = [
  '/',
  '/assets/6af2e6b989a158cee5230ee1698e84b3.jpg',
  '/assets/android-chrome-192x192.png',
  '/assets/android-chrome-512x512.png',
  '/assets/apple-touch-icon.png',
  '/assets/favicon.ico',
  '/assets/site.webmanifest'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
  // console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            // console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nová správa z PAPI Hair Design',
    icon: '/assets/android-chrome-192x192.png',
    badge: '/assets/android-chrome-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Zobraziť',
        icon: '/assets/android-chrome-192x192.png'
      },
      {
        action: 'close',
        title: 'Zavrieť',
        icon: '/assets/android-chrome-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('PAPI Hair Design', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});