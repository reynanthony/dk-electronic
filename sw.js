const CACHE_NAME = 'dk-electronic-v7';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/app-publico.js',
    '/dataStore.js',
    '/navigation.js',
    '/manifest.json'
];

// Instalar: pre-cachear assets esenciales
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activar: borrar caches viejos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: Network-first para JSON, Cache-first para el resto
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const isJSON = url.pathname.endsWith('.json');

    if (isJSON) {
        // Datos: intentar red primero, fallback a caché
        event.respondWith(
            fetch(event.request)
                .then(res => {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return res;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        // Assets: intentar caché primero, fallback a red
        event.respondWith(
            caches.match(event.request).then(cached => cached || fetch(event.request))
        );
    }
});

