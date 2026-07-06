const CACHE_NAME = 'taller-migue-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/logo_nuevo.png',
  '/taller_migue_logo.jpeg',
  '/logo_transparente.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Al recibir respuesta de red, la devolvemos y actualizamos la caché
        return response;
      })
      .catch(() => {
        // Si no hay red (offline), devolvemos lo que hay en caché
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
