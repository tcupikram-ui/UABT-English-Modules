/* Service worker — caches the site so the installed app works offline */
const CACHE = 'ikram-classroom-v2';
const ASSETS = [
  './',
  './Index.html',
  './Session1_Meeting_People_and_Countries.html',
  './Session_1_Orientation_Language_of_Genetics.html',
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
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(fresh => {
      const copy = fresh.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return fresh;
    }).catch(() => caches.match('./Index.html')))
  );
});
