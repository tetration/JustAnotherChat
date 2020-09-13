var cacheName = 'chat-engine-app-v1';
var filesToCache = [];

self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function (e) {
    console.log('[ServiceWorker] Fetch', e.request.url);
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request);
        })
    );
});


self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'Just Another Chat App';
    const options = {
        "body": msg_content,
        "icon": "/images/JustAnotherChat_icon_multiple.ico",
        "badge": "/images/JustAnotherChat_icon_multiple.ico",
        "vibrate": [200, 100, 200, 100, 200, 100, 400],
    };
    
    self.registration.showNotification(title, options);
    event.waitUntil(self.registration.showNotification(title, options));
    
});
