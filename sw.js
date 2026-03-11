const CACHE_NAME = 'dk-electronic-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/productos.json',
    '/logo/dklogo-removebg-preview.png',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap'
];

// Instalar Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto v2');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activar y limpiar caches antiguos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Cache eliminado:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptar solicitudes - siempre ir a la red primero
self.addEventListener('fetch', event => {
    // No cachear solicitudes de Analytics
    if (event.request.url.includes('google-analytics.com') || 
        event.request.url.includes('googletagmanager.com')) {
        return;
    }

    // Siempre ir a la red primero para ver cambios
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clonar respuesta
                const responseToCache = response.clone();
                
                // Cachear solo respuestas válidas
                if (response.status === 200) {
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                }
                
                return response;
            })
            .catch(() => {
                // Si falla la red, buscar en cache
                return caches.match(event.request);
            })
    );
});
