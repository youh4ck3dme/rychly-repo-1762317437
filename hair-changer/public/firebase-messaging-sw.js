// firebase-messaging-sw.js

// DÔLEŽITÉ: Tento service worker beží na pozadí a spracováva push notifikácie.
// Potrebuje vlastnú inicializáciu Firebase a používa staršiu 'compat' verziu knižníc.
// Service Workery nemajú priamy prístup k premenným prostredia (process.env alebo import.meta.env)
// z hlavnej aplikácie. Preto MUSÍTE sem skopírovať vaše Firebase konfiguračné údaje.
// Skopírujte hodnoty z `src/config/firebaseConfig.ts` PO tom, ako ich tam nastavíte
// pomocou premenných prostredia.

// IMPORTANT: This service worker runs in the background and handles push notifications.
// It requires its own Firebase initialization and uses older 'compat' library versions.
// Service Workers do not have direct access to environment variables (process.env or import.meta.env)
// from the main application's build process. Therefore, you MUST copy your Firebase
// configuration data here. Copy the values from `src/config/firebaseConfig.ts` AFTER
// you have set them up there using environment variables.

// Import skriptov pre Firebase (compat verzia pre Service Workery)
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');


// VLOŽTE VAŠU FIREBASE KONFIGURÁCIU SEM / INSERT YOUR FIREBASE CONFIGURATION HERE
// Príklad / Example:
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY", // <-- COPY FROM src/config/firebaseConfig.ts (after .env setup)
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // <-- COPY FROM src/config/firebaseConfig.ts
  projectId: "YOUR_PROJECT_ID", // <-- COPY FROM src/config/firebaseConfig.ts
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // <-- COPY FROM src/config/firebaseConfig.ts
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <-- COPY FROM src/config/firebaseConfig.ts
  appId: "YOUR_APP_ID", // <-- COPY FROM src/config/firebaseConfig.ts
  // measurementId je voliteľné pre SW / measurementId is optional for SW
};


// Inicializácia Firebase aplikácie v service workeri
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handler pre správy na pozadí. Spustí sa, keď aplikácia nie je v popredí.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Prijatá správa na pozadí: ', payload);

  // Prispôsobenie notifikácie
  const notificationTitle = payload.notification?.title || 'Nová Správa';
  const notificationOptions = {
    body: payload.notification?.body || 'Máte novú správu.',
    icon: payload.notification?.icon || './icons/icon-192.png',
    data: {
      // Prenesenie odkazu z FCM payloadu, aby sme vedeli, kam presmerovať po kliknutí
      url: payload.fcmOptions?.link || '../' 
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


// Táto udalosť sa spustí, keď používateľ klikne na notifikáciu.
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Kliknutie na notifikáciu prijaté.', event.notification);
  
  event.notification.close();

  // Získanie URL na otvorenie z dátového payloadu notifikácie. Predvolená hodnota je koreňová adresa.
  const urlToOpen = new URL(event.notification.data.url || '/', self.location.origin).href;

  // Táto logika sa pokúsi zamerať na existujúci tab aplikácie, alebo otvorí nový.
  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {
      // Ak je okno s cieľovou URL už otvorené, zameraj sa naň.
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Ak sa nenašlo žiadne zhodujúce okno, otvor nové.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});