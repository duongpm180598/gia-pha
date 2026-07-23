self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Gia Phả", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Gia Phả";
  const url = data.url || "/dashboard/events";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/android-chrome-192x192.png",
      badge: "/android-chrome-192x192.png",
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard/events";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    }),
  );
});
