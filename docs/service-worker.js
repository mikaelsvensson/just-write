const STATIC_ASSETS = [
    '/icons/text-box.png'
]

const CACHE_NAME = 'cache-0.0.6'

self.addEventListener('install', serviceWorkerRegistration => {
    console.log('Installing service worker', CACHE_NAME)
    serviceWorkerRegistration.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            cache.addAll(STATIC_ASSETS)
        })
    )
    self.skipWaiting()
})

self.addEventListener('activate', event => {
    console.log('Activating service worker', CACHE_NAME, event)
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Delete cache', cacheName)
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
})

addEventListener("message", ({ source, data: { msg } }) => {
    switch (msg) {
        case 'CACHE_NAME':
            source.postMessage({
                msg: 'CACHE_NAME',
                value: CACHE_NAME,
            });

            break
    }
});

self.addEventListener('fetch', event => {
    console.log('Fetch event', event)
    event.respondWith(
        caches
            .match(event.request)
            .then(response => {
                if (response) {
                    console.log('Found ' + event.request.url + ' in cache.')
                    return response
                }

                return fetch(event.request)
                    .then(response => {
                        return caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request.url, response.clone())
                            return response
                        })
                    })
                    .catch(error => {
                        console.error('Failed to fetch', error)
                    })
            })
            .catch(error => {
                console.error('Failed to fetch', error)
            })
    )
})