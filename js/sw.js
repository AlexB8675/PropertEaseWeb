function getUrlsToCache() {
    return [
        '../css/house.css',
        '../css/index.css',
        '../css/style.css',
        '../js/houses.js',
        '../js/index.js',
        '../js/jquery-3.7.1.min.js',
        '../js/script.js',
        '../js/sw.js',
        '../tool/common.js',
        '../tool/tool.css',
        '../tool/tool.js',
        '../house.html',
        '../index.html',
        '../tool.html',
        '../manifest.json',
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
