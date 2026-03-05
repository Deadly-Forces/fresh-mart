/**
 * Service Worker for Push Notifications - Fresh Mart
 * Handles push events and notification clicks
 */

const CACHE_NAME = "fresh-mart-v1";

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/", // homepage
        "/manifest.json",
        "/icons/icon-192x192.png",
        "/icons/icon-512x512.png",
        // Add more static assets as needed
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    })
  );
  self.clients.claim();
});
// Fetch event - serve cached assets, cache static and image requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Only cache GET requests
  if (request.method !== "GET") return;

  // Cache static assets and images
  if (
    request.url.includes("/_next/static/") ||
    request.url.includes("/_next/image/") ||
    request.url.match(/\.(png|jpg|jpeg|webp|avif|svg|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
  }
});

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received");

  let data = {
    title: "Fresh Mart",
    body: "You have a new notification!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: "fresh-mart-notification",
    data: {
      url: "/",
    },
  };

  // Parse push data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        ...data,
        ...payload,
        data: {
          url: payload.url || payload.data?.url || "/",
          ...payload.data,
        },
      };
    } catch (e) {
      // If not JSON, use as body text
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/badge-72x72.png",
    tag: data.tag || "fresh-mart-notification",
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || [
      {
        action: "open",
        title: "View",
      },
      {
        action: "close",
        title: "Dismiss",
      },
    ],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event - handle user interaction
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked");

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  if (event.action === "close") {
    return;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window if none exist
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

// Handle notification close event
self.addEventListener("notificationclose", (event) => {
  console.log("[Service Worker] Notification closed:", event.notification.tag);
});

// Handle push subscription change
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[Service Worker] Push subscription changed");

  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: self.VAPID_PUBLIC_KEY,
      })
      .then((subscription) => {
        // Re-subscribe and update server
        return fetch("/api/push/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription),
        });
      }),
  );
});
