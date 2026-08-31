self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Intentionally no fetch handler.
// A pass-through fetch(event.respondWith(fetch(...))) adds a service-worker
// hop to every network request without providing any caching benefit.
