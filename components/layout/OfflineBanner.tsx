"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export function OfflineBanner() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true
  );
  if (online) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-border bg-secondary px-4 py-2 text-center text-body-sm text-secondary-foreground"
    >
      אין חיבור. מציגים את מה שנטען עד עכשיו
    </div>
  );
}
