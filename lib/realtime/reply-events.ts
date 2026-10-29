/**
 * Tiny pub/sub so an open ReplyThread reuses the feed's single realtime channel
 * (no second channel per card). The feed list emits; threads subscribe by report id.
 */
export type ReplyEvent =
  | { type: "insert"; reportId: string; row: { id: string; user_id?: string; created_at?: string } }
  | { type: "delete"; reportId: string; id: string };

type Listener = (e: ReplyEvent | { type: "resync" }) => void;
const byReport = new Map<string, Set<Listener>>();

export function subscribeReplyEvents(reportId: string, fn: Listener): () => void {
  let set = byReport.get(reportId);
  if (!set) byReport.set(reportId, (set = new Set()));
  set.add(fn);
  return () => {
    set.delete(fn);
    if (set.size === 0) byReport.delete(reportId);
  };
}

export function emitReplyEvent(e: ReplyEvent): void {
  byReport.get(e.reportId)?.forEach((fn) => fn(e));
}

/** Reconnect / tab visible: every open thread should refetch. */
export function emitReplyResync(): void {
  byReport.forEach((set) => set.forEach((fn) => fn({ type: "resync" })));
}
