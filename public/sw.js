// This service worker unregisters itself and clears all caches.
// It exists to clean up a previously registered service worker that is causing
// stale cache issues (fonts, images, scripts not loading).

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function() {
  // Clear all caches
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        return caches.delete(cacheName);
      })
    );
  }).then(function() {
    // Unregister this service worker
    self.registration.unregister().then(function() {
      // Reload all clients so they get fresh resources
      self.clients.matchAll().then(function(clients) {
        clients.forEach(function(client) {
          client.navigate(client.url);
        });
      });
    });
  });
});
