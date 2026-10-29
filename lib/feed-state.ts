import type { FeedReport } from "./feed";

/** Pure feed list state for realtime updates (no React, no I/O). */
export type FeedState = { items: FeedReport[]; queue: FeedReport[] };

const byNewest = (a: FeedReport, b: FeedReport) =>
  a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : a.id < b.id ? 1 : a.id > b.id ? -1 : 0;

const has = (s: FeedState, id: string) => s.items.some((r) => r.id === id) || s.queue.some((r) => r.id === id);

/** A new report: shown at the top (own report near top) or queued for the pill. Deduped by id. */
export function addIncoming(
  s: FeedState,
  report: FeedReport,
  opts: { direct: boolean }
): FeedState {
  if (has(s, report.id)) return s;
  if (opts.direct) return { ...s, items: [report, ...s.items].sort(byNewest) };
  return { ...s, queue: [...s.queue, report].sort(byNewest) };
}

/** Pill tap / scroll back to top: queued reports go to the top of the list. */
export function flushQueue(s: FeedState): FeedState {
  if (s.queue.length === 0) return s;
  const seen = new Set(s.items.map((r) => r.id));
  const fresh = s.queue.filter((r) => !seen.has(r.id));
  return { items: [...fresh, ...s.items].sort(byNewest), queue: [] };
}

export function removeReport(s: FeedState, id: string): FeedState {
  if (!has(s, id)) return s;
  return { items: s.items.filter((r) => r.id !== id), queue: s.queue.filter((r) => r.id !== id) };
}

/** Client-side TTL: drop reports whose created_at is not after `cutoffIso`. */
export function dropExpired(s: FeedState, cutoffIso: string): FeedState {
  const cut = Date.parse(cutoffIso);
  const live = (r: FeedReport) => Date.parse(r.created_at) > cut;
  if (s.items.every(live) && s.queue.every(live)) return s;
  return { items: s.items.filter(live), queue: s.queue.filter(live) };
}

/** Adjusts reply / "coming" counts of one report (never below 0). */
export function applyReplyDelta(
  s: FeedState,
  reportId: string,
  delta: { replies: number; coming: number }
): FeedState {
  const upd = (r: FeedReport): FeedReport =>
    r.id === reportId
      ? {
          ...r,
          replyCount: Math.max(0, r.replyCount + delta.replies),
          comingCount: Math.max(0, r.comingCount + delta.coming),
        }
      : r;
  if (!has(s, reportId)) return s;
  return { items: s.items.map(upd), queue: s.queue.map(upd) };
}

/** Appends a "load more" page, deduped. Prepending never affects the cursor (oldest item). */
export function appendPage(s: FeedState, page: FeedReport[]): FeedState {
  const seen = new Set([...s.items, ...s.queue].map((r) => r.id));
  return { ...s, items: [...s.items, ...page.filter((r) => !seen.has(r.id))] };
}

/**
 * Heals missed events from a fresh first page: refreshes counts/content of known reports, removes
 * reports that fall inside the page's time range but are no longer returned (deleted), and queues
 * unknown newer reports.
 */
export function healWithFirstPage(s: FeedState, page: FeedReport[]): FeedState {
  if (page.length === 0) {
    return { items: [], queue: [] };
  }
  const byId = new Map(page.map((r) => [r.id, r]));
  const oldest = page[page.length - 1];
  const inRange = (r: FeedReport) => byNewest(r, oldest) <= 0; // r is at least as new as oldest
  const refresh = (r: FeedReport) => byId.get(r.id) ?? r;
  const keep = (r: FeedReport) => byId.has(r.id) || !inRange(r);
  const items = s.items.filter(keep).map(refresh);
  const queue = s.queue.filter(keep).map(refresh);
  const known = new Set([...items, ...queue].map((r) => r.id));
  const unknown = page.filter((r) => !known.has(r.id));
  return { items, queue: [...queue, ...unknown].sort(byNewest) };
}
