// Service Worker for Sperrmüll push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Sperrmüll Abholung", body: event.data.text() };
  }

  const title = data.title || "Sperrmüll Abholung";
  const options = {
    body: data.body || "Morgen ist Sperrmüll-Abfuhr in deiner Nähe!",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "sperrmuell-notification",
    renotify: true,
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
