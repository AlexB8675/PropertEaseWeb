function getUrlsToCache() {
    return [
        './css/style.css',
        './js/main.js',
        './index.html',
        './manifest.json',
    ];
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open("main-cache")
            .then((cache) => {
                return cache.addAll(getUrlsToCache());
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches
            .match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
