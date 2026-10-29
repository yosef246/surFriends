/* surFriends service worker: Web Push only. No fetch handler and no caching on purpose (no stale-app bugs). */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

function safeUrl(raw) {
  // Same-origin paths only; anything else falls back to the feed.
  try {
    const u = new URL(raw || "/", self.location.origin);
    return u.origin === self.location.origin ? u.pathname + u.search + u.hash : "/";
  } catch {
    return "/";
  }
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = typeof data.title === "string" && data.title ? data.title : "surFriends";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: typeof data.body === "string" ? data.body : "",
      icon: "/pwa-icon/192",
      badge: "/pwa-icon/96?badge=1",
      dir: "rtl",
      lang: "he",
      tag: typeof data.tag === "string" ? data.tag : undefined, // same tag = one notification per beach
      renotify: Boolean(data.tag),
      data: { url: safeUrl(data.url) },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = safeUrl(event.notification.data && event.notification.data.url);
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        if (new URL(client.url).origin === self.location.origin && "focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(url);
            } catch {
              /* ignore */
            }
          }
          return;
        }
      }
      await self.clients.openWindow(url);
    })(),
  );
});

// The push service rotated/expired the subscription: best-effort resubscribe and tell the server.
// The server action needs a session cookie, which a SW fetch to the same origin carries.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const old = event.oldSubscription;
        const key = old && old.options && old.options.applicationServerKey;
        const sub =
          event.newSubscription ||
          (key ? await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }) : null);
        if (!sub) return;
        await fetch("/api/push/resubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ subscription: sub.toJSON(), oldEndpoint: old ? old.endpoint : null }),
        });
      } catch {
        /* best effort: the settings screen re-syncs the next time it is opened */
      }
    })(),
  );
});
