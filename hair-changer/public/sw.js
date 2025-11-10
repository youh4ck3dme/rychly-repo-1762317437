const CORE_CACHE = "app-v1";
const ASSETS_CACHE = "assets-v1";
// Add the new stylesheet to the list of core assets to cache on install.
const CORE_ASSETS = ["/", "/index.html", "/public/manifest.json", "../src/styles.css", "/public/firebase-messaging-sw.js"]; // Added firebase-messaging-sw.js to cache

const ALL_CACHES = [CORE_CACHE, ASSETS_CACHE];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CORE_CACHE).then((c) => c.addAll(CORE_ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !ALL_CACHES.includes(k)).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Strategy: Network-first for CDN modules (esm.sh)
  if (url.hostname.endsWith("esm.sh")) {
    e.respondWith(
      fetch(e.request).then((res) => {
        return caches.open(CORE_CACHE).then((c) => {
            c.put(e.request, res.clone());
            return res;
        });
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  
  // Strategy: Stale-While-Revalidate for external assets (images, fonts)
  if (url.hostname === 'storage.googleapis.com' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
     e.respondWith(
        caches.match(e.request).then((cached) => {
          const fetchPromise = fetch(e.request).then((res) => {
            caches.open(ASSETS_CACHE).then((c) => c.put(e.request, res.clone()));
            return res;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
    );
    return;
  }

  // Strategy: Stale-While-Revalidate for same-origin requests (including the new stylesheet)
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request).then((res) => {
        caches.open(CORE_CACHE).then((c) => c.put(e.request, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// FCM hook (ak používaš Firebase Messaging)
try { importScripts("./firebase-messaging-sw.js"); } catch (_) {}