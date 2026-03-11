const CACHE_NAME = 'dk-electronic-v6';

// Always fetch from network, never use cache for HTML/JS
self.addEventListener('fetch', event => {
    // No cachear nunca - siempre ir a la red
    event.respondWith(fetch(event.request));
});
