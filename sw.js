const CACHE_NAME = 'dk-electronic-v1';
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
                console.log('Cache abierto');
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

// Interceptar solicitudes
self.addEventListener('fetch', event => {
    // No cachear solicitudes de Analytics
    if (event.request.url.includes('google-analytics.com') || 
        event.request.url.includes('googletagmanager.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Devolver cache si existe, si no hacer fetch
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then(response => {
                    // No cachear respuestas no válidas
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clonar respuesta para cachear
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // Si hay error, devolver página offline si existe
                return caches.match('/index.html');
            })
    );
});
