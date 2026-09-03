self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Extrovert Date", body: event.data?.text() || "You have a new dating update." };
  }
  const title = payload.title || "Extrovert Date";
  const options = { body: payload.body || "You have a new dating update.", icon: payload.icon || "/icon-192.png", badge: payload.badge || "/icon-192.png", image: payload.image, tag: payload.tag, data: payload.data || {}, requireInteraction: Boolean(payload.requireInteraction), silent: Boolean(payload.silent), timestamp: payload.timestamp || Date.now() };
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    const targetUrl = options.data?.url;
    const targetPath = typeof targetUrl === "string" ? new URL(targetUrl, self.location.origin).pathname : null;
    const matchingFocusedClient = clients.find((client) => {
      if (!targetPath || !client.focused) return false;
      try { return new URL(client.url).pathname === targetPath; } catch { return false; }
    });
    if (matchingFocusedClient) return undefined;
    return self.registration.showNotification(title, options);
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url;
  if (typeof targetUrl !== "string") return;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    const targetPath = new URL(targetUrl, self.location.origin).pathname;
    const existing = clients.find((client) => {
      try { return new URL(client.url).pathname === targetPath; } catch { return false; }
    });
    if (existing) return existing.focus();
    return self.clients.openWindow(new URL(targetUrl, self.location.origin).href);
  }));
});

// No fetch handler: the service worker never intercepts the normal app network path.
