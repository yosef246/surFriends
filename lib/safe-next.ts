/** Returns a safe same-origin relative path, or "/" (prevents open redirects). */
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/";
  if (/[\u0000-\u001f]/.test(next)) return "/";
  if (next === "/login" || next.startsWith("/login?") || next.startsWith("/callback")) return "/";
  return next;
}
