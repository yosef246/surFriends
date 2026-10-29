/**
 * Post-login redirect target. Only same-site relative paths are allowed: a single leading "/", no "//",
 * no backslash and no control characters (browsers strip tabs/newlines, which could turn "/\t/evil" into "//evil").
 */
export function safeNext(next: string | null | undefined, fallback = "/profile"): string {
  if (typeof next !== "string" || next.length === 0 || next.length > 512) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(next)) return fallback;
  try {
    const u = new URL(next, "http://localhost");
    if (u.origin !== "http://localhost") return fallback;
  } catch {
    return fallback;
  }
  return next;
}

/** Error codes coming back on the callback URL: letters, digits, "_" and "-" only. */
export function safeErrorCode(code: string | null | undefined, fallback = "unknown"): string {
  return typeof code === "string" && /^[a-z0-9_-]{1,60}$/i.test(code) ? code : fallback;
}
