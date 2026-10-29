// Pure Web Push helpers (no I/O, no aliases) so `node --test` can import this file directly.

export const COOLDOWN_MS = 30 * 60 * 1000; // at most 1 report push per user per beach per 30 min
export const REPLY_COOLDOWN_MS = 5 * 60 * 1000; // at most 1 reply/reaction push per owner per report per 5 min
export const TEST_PUSH_INTERVAL_MS = 60 * 1000;
export const MAX_SUBSCRIPTIONS_PER_USER = 10;
export const SNIPPET_MAX = 80;
const WAVE_LABELS = ["שטוח", "קטן", "סביר", "טוב", "אש"];

export type PushSubscriptionInput = { endpoint: string; keys: { p256dh: string; auth: string } };
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Hosts of the push services browsers actually use. web-push POSTs to the endpoint from our server, so an
 *  arbitrary https URL here would be an SSRF vector; restrict to the real services. */
const PUSH_HOST_SUFFIXES = [
  "fcm.googleapis.com",
  "android.googleapis.com",
  "push.services.mozilla.com",
  "push.apple.com",
  "notify.windows.com",
];

export function isAllowedPushEndpoint(raw: unknown): raw is string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 2048) return false;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" || u.username || u.password || (u.port && u.port !== "443")) return false;
  const host = u.hostname.toLowerCase();
  return PUSH_HOST_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`));
}

const B64URL = /^[A-Za-z0-9_-]+={0,2}$/;

function b64urlByteLength(s: string): number {
  const t = s.replace(/=+$/, "");
  return Math.floor((t.length * 3) / 4);
}

/** Validates the JSON shape of PushSubscription.toJSON(). p256dh = 65-byte P-256 point, auth = 16-byte secret. */
export function validateSubscription(raw: unknown): ValidationResult<PushSubscriptionInput> {
  const bad = (error: string) => ({ ok: false as const, error });
  if (!raw || typeof raw !== "object") return bad("מנוי לא תקין");
  const r = raw as { endpoint?: unknown; keys?: unknown };
  if (!isAllowedPushEndpoint(r.endpoint)) return bad("כתובת ההתראות לא תקינה");
  if (!r.keys || typeof r.keys !== "object") return bad("מפתחות ההתראות חסרים");
  const { p256dh, auth } = r.keys as { p256dh?: unknown; auth?: unknown };
  if (typeof p256dh !== "string" || !B64URL.test(p256dh) || b64urlByteLength(p256dh) !== 65) {
    return bad("מפתחות ההתראות לא תקינים");
  }
  if (typeof auth !== "string" || !B64URL.test(auth) || b64urlByteLength(auth) !== 16) {
    return bad("מפתחות ההתראות לא תקינים");
  }
  return { ok: true, value: { endpoint: r.endpoint, keys: { p256dh, auth } } };
}

/** Browser: VAPID public key (base64url) -> applicationServerKey bytes. */
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export type PushPayload = { title: string; body: string; url: string; tag: string };

/** Truncates by code points (not UTF-16 units: emoji stay whole) and adds an ellipsis when cut. */
export function snippet(text: string, max = SNIPPET_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const chars = Array.from(clean);
  if (chars.length <= max) return clean;
  return `${chars.slice(0, max - 1).join("").trimEnd()}…`;
}

export function firstName(displayName: string): string {
  const first = displayName.trim().split(/\s+/)[0];
  return first && first.length > 0 ? first : "מישהו";
}

export function buildPushPayload(i: {
  beachId: number;
  beachName: string;
  authorName: string;
  text: string | null;
  waveRating: number | null;
}): PushPayload {
  const who = firstName(i.authorName);
  const text = i.text ? snippet(i.text) : "";
  const label =
    i.waveRating !== null && Number.isInteger(i.waveRating) && i.waveRating >= 1 && i.waveRating <= 5
      ? WAVE_LABELS[i.waveRating - 1]
      : null;
  const detail = text || (label ? `גלים: ${label}` : "דיווח חדש");
  return {
    title: `🌊 ${i.beachName}`,
    body: `${who}: ${detail}`,
    url: `/beach/${i.beachId}`,
    tag: `beach-${i.beachId}`,
  };
}

/** Ids whose last push (for this beach) is still inside the cooldown window. */
export function cooledDownUserIds(
  log: { user_id: string; sent_at: string }[],
  now: number = Date.now(),
  windowMs: number = COOLDOWN_MS,
): Set<string> {
  const out = new Set<string>();
  for (const l of log) {
    const t = Date.parse(l.sent_at);
    if (Number.isFinite(t) && now - t < windowMs) out.add(l.user_id);
  }
  return out;
}

/** Favorited the beach, not the author, push enabled, not in cooldown. De-duplicated, stable order. */
export function selectRecipients(i: {
  favoriteUserIds: string[];
  authorId: string | null;
  pushEnabledUserIds: Set<string>;
  cooledDown: Set<string>;
}): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of i.favoriteUserIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    if (id === i.authorId) continue;
    if (!i.pushEnabledUserIds.has(id)) continue;
    if (i.cooledDown.has(id)) continue;
    out.push(id);
  }
  return out;
}

// ---------- Reply / reaction pushes (to the report owner) ----------

export type ReplyPushKind = "coming" | "on_the_way" | "text";

/** "ל" + name; a non-Hebrew name gets a hyphen ("ל-Hilton"). Null/blank name -> "לחוף". */
export function toBeach(beachName: string | null | undefined): string {
  const n = (beachName ?? "").trim();
  if (!n) return "לחוף";
  return /^[֐-׿]/.test(n) ? `ל${n}` : `ל-${n}`;
}

export function buildReplyPayload(i: {
  reportId: string;
  beachId: number;
  beachName: string | null;
  actorName: string;
  kind: ReplyPushKind;
  text?: string | null;
  /** Other people with the same reaction since the last push (aggregation), >= 0. */
  others?: number;
}): PushPayload {
  const who = firstName(i.actorName);
  const others = typeof i.others === "number" && Number.isInteger(i.others) && i.others > 0 ? i.others : 0;
  const names = others > 0 ? `${who} ועוד ${others}` : who;
  const base = { url: `/beach/${i.beachId}`, tag: `reply-${i.reportId}` };
  if (i.kind === "coming") {
    return { ...base, title: `🤙 ${names} ${others > 0 ? "באים" : "בא/ה"} ${toBeach(i.beachName)}`, body: "על הדיווח שלך" };
  }
  if (i.kind === "on_the_way") {
    return { ...base, title: `🚗 ${names} בדרך ${toBeach(i.beachName)}`, body: "על הדיווח שלך" };
  }
  return { ...base, title: `💬 ${who} הגיב/ה על הדיווח שלך`, body: snippet(i.text ?? "") };
}

/** Why a reply push must not be sent (null = send). */
export function replyPushSkipReason(i: {
  reportExists: boolean;
  ownerId: string | null;
  actorId: string;
  ownerPushEnabled: boolean;
}): "report-not-found" | "own-report" | "push-disabled" | null {
  if (!i.reportExists || !i.ownerId) return "report-not-found";
  if (i.ownerId === i.actorId) return "own-report";
  if (!i.ownerPushEnabled) return "push-disabled";
  return null;
}

/** True while the last reply push for this (owner, report) is inside the cooldown window. */
export function inReplyCooldown(lastSentAt: string | null | undefined, now: number = Date.now()): boolean {
  if (!lastSentAt) return false;
  const t = Date.parse(lastSentAt);
  return Number.isFinite(t) && now - t < REPLY_COOLDOWN_MS;
}

/** Distinct reactors (excluding actor and owner) created after the last push; i.e. "ועוד N". */
export function aggregateOthers(
  rows: { user_id: string; created_at: string }[],
  actorId: string,
  ownerId: string,
  sinceIso: string | null,
): number {
  const since = sinceIso ? Date.parse(sinceIso) : -Infinity;
  const ids = new Set<string>();
  for (const r of rows) {
    if (r.user_id === actorId || r.user_id === ownerId) continue;
    const t = Date.parse(r.created_at);
    if (Number.isFinite(t) && t > since) ids.add(r.user_id);
  }
  return ids.size;
}

/** Notify only when an insert really happened: no error. (23505 = already there / retried id -> no push.) */
export function isFreshInsert(error: { code?: string } | null | undefined): boolean {
  return !error;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** web-push error -> should the stored subscription be deleted? (gone / not found) */
export function isGoneStatus(status: unknown): boolean {
  return status === 404 || status === 410;
}
