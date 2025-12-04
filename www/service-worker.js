// Service Worker para Journaly
// Permite funcionamiento offline y cacheo de recursos

const CACHE_NAME = 'journaly-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/signup.html',
  '/bio.html',
  '/voces.html',
  '/pensamientos.html',
  '/fotos.html',
  '/global.css',
  '/style.css',
  '/login.css',
  '/bio.css',
  '/voces.css',
  '/pensamientos.css',
  '/fotos.css',
  '/manifest.json'
];

// Instalar Service Worker y cachear archivos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando recursos');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch((error) => {
        console.warn('⚠️ Service Worker: Error al cachear', error);
      })
  );
  self.skipWaiting();
});

// Activar Service Worker y limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // No cachear llamadas a API de Firebase
  if (event.request.url.includes('firebase') || event.request.url.includes('firestore')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si es exitoso, guardar en caché
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Si falla, intentar desde caché
        return caches.match(event.request)
          .then((response) => {
            return response || new Response('Offline - Recurso no disponible', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});
