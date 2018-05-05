'use strict';

const staticCache = 'mws-restaurant-cache-v1';
const allCaches = [
    staticCache
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        // Cache resources for offline first
        caches.open(staticCache).then(function(cache) {
            return cache.addAll([
                'index.html',
                'js/dbhelper.js',
                'js/main.js',
                'js/restaurant_info.js',
                'css/styles.css'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    // Return matched cache resource
    // otherwise fetch from network and store in cache
    event.respondWith(
        caches.open(staticCache).then(function(cache) {
            return cache.match(event.request).then(function(response) {
                return response || fetch(event.request).then(function(response) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});

