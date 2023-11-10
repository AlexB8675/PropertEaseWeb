function getUrlsToCache() {
    return [
        '../css/style.css',
        '../index.html',
        '../manifest.json',
        'main.js',
    ];
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open("main_cache")
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
