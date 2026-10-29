"use client";

// Browser-side Web Push flow. Never runs on load: every entry point is called from a user gesture
// (settings button / opt-in sheet) or, for `getPushEnv`, only reads state.
import { subscribeToPush, unsubscribeFromPush } from "@/app/actions/push";
import { urlBase64ToUint8Array } from "@/lib/push";

export type PushEnv = "unsupported" | "ios-install" | "denied" | "off" | "on";
export type EnableResult = { ok: true } | { ok: false; reason: "denied" | "dismissed" | "unsupported" | "ios-install" | "error"; message?: string };

const DISMISS_KEY = "sf:push-optin-dismissed";

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.("(display-mode: standalone)").matches === true || nav.standalone === true;
}

function pushApisPresent(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.getRegistration("/");
  return reg ? reg.pushManager.getSubscription() : null;
}

export async function getPushEnv(): Promise<PushEnv> {
  if (isIOS() && !isStandalone()) return "ios-install"; // Safari tab: PushManager is absent until installed
  if (!pushApisPresent()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  try {
    const sub = await currentSubscription();
    return sub && Notification.permission === "granted" ? "on" : "off";
  } catch {
    return "off";
  }
}

/** Must be called directly from a click handler (permission prompt needs the user gesture). */
export async function enablePush(): Promise<EnableResult> {
  if (isIOS() && !isStandalone()) return { ok: false, reason: "ios-install" };
  if (!pushApisPresent()) return { ok: false, reason: "unsupported" };
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return { ok: false, reason: "error", message: "ההתראות עדיין לא הוגדרו בשרת" };

  try {
    const permission = await Notification.requestPermission();
    if (permission === "denied") return { ok: false, reason: "denied" };
    if (permission !== "granted") return { ok: false, reason: "dismissed" };

    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    const reg = await navigator.serviceWorker.ready;

    const key = urlBase64ToUint8Array(publicKey);
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    }
    const res = await subscribeToPush(sub.toJSON(), navigator.userAgent);
    if ("error" in res) return { ok: false, reason: "error", message: res.error };
    return { ok: true };
  } catch {
    return { ok: false, reason: "error", message: "לא הצלחנו להפעיל התראות במכשיר הזה" };
  }
}

/** Turns notifications off for THIS device only (per-device, like the permission itself). */
export async function disablePush(): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const sub = await currentSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      const res = await unsubscribeFromPush(endpoint);
      if ("error" in res) return { ok: false, message: res.error };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "הכיבוי נכשל, נסו שוב" };
  }
}

export function isOptInDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissOptIn(): void {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* private mode: just ask again next time */
  }
}

/** Should the in-context sheet show after a first favorite? Not if already on, blocked, or dismissed. */
export async function shouldOfferOptIn(): Promise<boolean> {
  if (isOptInDismissed()) return false;
  const env = await getPushEnv();
  return env === "off" || env === "ios-install";
}
