'use strict';

const staticCacheName = 'mws-restaurant-cache-v1';
const allCaches = [
    staticCacheName
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        // Cache resources for offline first
        caches.open(staticCacheName).then(function(cache) {
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

self.addEventListener('activate', function(event) {
    event.waitUntil(
        // Remove old caches
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName.startsWith('mws-restaurant-') &&
                        !allCaches.includes(cacheName);
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    // Return matched cache resource
    // otherwise fetch from network and store in cache
    event.respondWith(
        caches.open(staticCacheName).then(function(cache) {
            return cache.match(event.request).then(function(response) {
                return response || fetch(event.request).then(function(response) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});

