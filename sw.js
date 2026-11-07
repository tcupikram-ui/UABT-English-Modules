/* Service worker — caches the site so the installed app works offline */
const CACHE = 'ikram-classroom-v4';
const ASSETS = [
  './',
  './Index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './favicon.png',
  './og-preview.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  // Pages (HTML) always go to the network first so updates reach every
  // student; the cache is the offline fallback.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(fresh => {
        const copy = fresh.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return fresh;
      }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('./Index.html')))
    );
    return;
  }
  // Static assets (icons, manifests…) go cache-first for speed.
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(fresh => {
      const copy = fresh.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return fresh;
    }))
  );
});
