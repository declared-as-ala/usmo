self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
// No-op fetch handler — required by some browsers' PWA install criteria.
// Intentionally does not cache: news/scores/boutique data must always be fresh.
self.addEventListener('fetch', () => {});
