// Pure helpers behind the WhatsApp-style status bubbles. No React, no browser APIs.

export const GROUP_WINDOW_MS = 10 * 60 * 1000;

/** Stable sender color slot 1..6 (matches the data-c values of .bubble-sender). FNV-1a over the id. */
export function senderColor(userId: string): 1 | 2 | 3 | 4 | 5 | 6 {
  let h = 0x811c9dc5;
  for (let i = 0; i < userId.length; i++) {
    h ^= userId.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return ((h % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * For a list in display order: true when the item continues the run of the previous (adjacent) item,
 * i.e. same sender and within 10 minutes. Continuations hide the avatar, name and tail, like WhatsApp.
 */
export function groupWithPrevious(items: readonly { user_id: string; created_at: string }[]): boolean[] {
  return items.map((it, i) => {
    if (i === 0) return false;
    const prev = items[i - 1];
    if (prev.user_id !== it.user_id) return false;
    const gap = Math.abs(Date.parse(prev.created_at) - Date.parse(it.created_at));
    return Number.isFinite(gap) && gap <= GROUP_WINDOW_MS;
  });
}

const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jerusalem",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "14:32" in Asia/Jerusalem. Deterministic, so server and client render the same text. */
export function formatClock(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : clock.format(d);
}
