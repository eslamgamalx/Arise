// UMBRAKAI service worker — always fetch fresh, fall back to cache offline.
const CACHE = 'umbrakai-v6';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  const isCode = e.request.mode === 'navigate' || /\.(html|js|css|webmanifest)(\?|$)/.test(e.request.url) || e.request.url.endsWith('/');
  e.respondWith(
    fetch(e.request, { cache: isCode ? 'reload' : 'no-cache' })
      .then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); } return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./')))
  );
});
