"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { toggleReaction } from "@/app/actions/replies";
import { loadMoreReports } from "@/app/(app)/feed-actions";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { fetchReportById, fetchReports, FEED_PAGE_SIZE, type FeedReport } from "@/lib/feed";
import {
  addIncoming,
  appendPage,
  applyReplyEvent,
  dropExpired,
  flushQueue,
  healWithFirstPage,
  removeReport,
  restoreReactions,
  snapshotReactions,
  toggleMyReaction,
  type FeedState,
} from "@/lib/feed-state";
import { emitReplyEvent, emitReplyResync } from "@/lib/realtime/reply-events";
import { useFeedRealtime, type ReplyRow } from "@/lib/realtime/useFeedRealtime";
import type { ReactionKind } from "@/lib/replies";
import { reportCutoffIso } from "@/lib/reports";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LiveDot } from "./LiveDot";
import { NewReportsPill } from "./NewReportsPill";
import { ReportCard } from "./ReportCard";

const NEAR_TOP_PX = 120;
const LEAVE_MS = 220;
const TTL_CHECK_MS = 60_000;
const HERO_REFRESH_MS = 10_000;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ReportList({
  initialReports,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  heading,
  beachId,
  authorId,
  emptyState,
}: {
  initialReports: FeedReport[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string | null;
  heading?: ReactNode;
  /** Beach page: list only this beach (load-more, resync and realtime inserts are filtered). */
  beachId?: number;
  /** Profile pages: list only this author (load-more, resync and realtime inserts are filtered). */
  authorId?: string;
  /** Replaces the default empty state. */
  emptyState?: ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<FeedState>({ items: initialReports, queue: [] });
  const [leaving, setLeaving] = useState<ReadonlySet<string>>(new Set());
  const [hasMore, setHasMore] = useState(initialReports.length >= FEED_PAGE_SIZE);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const getClient = () => (supabaseRef.current ??= createClient());
  const reports = state.items;
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  // Hero summary + "live" badges are server components: refresh them (debounced, keeps client state).
  const heroTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshHero = useCallback(() => {
    if (heroTimer.current) return;
    heroTimer.current = setTimeout(() => {
      heroTimer.current = null;
      router.refresh();
    }, HERO_REFRESH_MS);
  }, [router]);
  useEffect(
    () => () => {
      if (heroTimer.current) clearTimeout(heroTimer.current);
    },
    []
  );

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  }, []);

  const flush = useCallback(() => setState((s) => flushQueue(s)), []);

  // Scrolling back to the top merges the queue (the pill disappears).
  const wasFar = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      const far = window.scrollY > NEAR_TOP_PX;
      if (wasFar.current && !far) setState((s) => flushQueue(s));
      wasFar.current = far;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onReportInsert = useCallback(
    async (id: string, insertBeachId?: number, insertUserId?: string) => {
      if (beachId != null && insertBeachId !== beachId) return; // another beach
      if (authorId != null && insertUserId !== authorId) return; // another author
      if (stateRef.current.items.some((r) => r.id === id)) return; // own optimistic / server render
      const report = await fetchReportById(getClient(), id, reportCutoffIso(), currentUserId);
      if (!report) return;
      const direct = report.user_id === currentUserId && window.scrollY <= NEAR_TOP_PX;
      setState((s) => addIncoming(s, report, { direct }));
      refreshHero();
    },
    [currentUserId, refreshHero, beachId, authorId]
  );

  const leavingRef = useRef<Set<string>>(new Set());
  const onReportDelete = useCallback(
    (id: string) => {
      refreshHero();
      if (leavingRef.current.has(id)) return; // own delete + realtime DELETE: animate once
      leavingRef.current.add(id);
      if (!stateRef.current.items.some((r) => r.id === id)) {
        setState((s) => removeReport(s, id));
        return;
      }
      const ms = reducedMotion() ? 0 : LEAVE_MS;
      setLeaving((l) => new Set(l).add(id));
      setTimeout(() => {
        leavingRef.current.delete(id);
        setState((s) => removeReport(s, id));
        setLeaving((l) => {
          const n = new Set(l);
          n.delete(id);
          return n;
        });
      }, ms);
    },
    [refreshHero]
  );

  const resync = useCallback(async () => {
    try {
      const page = await fetchReports(getClient(), reportCutoffIso(), null, currentUserId, beachId, authorId);
      setState((s) => healWithFirstPage(dropExpired(s, reportCutoffIso()), page));
      refreshHero();
      emitReplyResync(); // open threads refetch too
    } catch {
      /* next visibility/online event retries */
    }
  }, [refreshHero, currentUserId, beachId, authorId]);

  const onReplyInsert = useCallback(
    (row: ReplyRow) => {
      if (!row.report_id) return;
      setState((s) => applyReplyEvent(s, "insert", row, currentUserId));
      if (row.id) emitReplyEvent({ type: "insert", reportId: row.report_id, row: { id: row.id, ...row } });
    },
    [currentUserId]
  );

  const onReplyDelete = useCallback(
    (row: ReplyRow) => {
      // Without REPLICA IDENTITY FULL the old row is only {id}: we can't tell which card, so heal.
      if (!row.report_id) {
        void resync();
        return;
      }
      setState((s) => applyReplyEvent(s, "delete", row, currentUserId));
      if (row.id) emitReplyEvent({ type: "delete", reportId: row.report_id, id: row.id });
    },
    [resync, currentUserId]
  );

  /** Optimistic "אני בא" / "בדרך": flip now, call the server, roll back on failure. */
  const onToggleReaction = useCallback(async (reportId: string, kind: ReactionKind): Promise<string | null> => {
    const before = stateRef.current.items.find((r) => r.id === reportId);
    if (!before) return null;
    const snap = snapshotReactions(before);
    setState((s) => toggleMyReaction(s, reportId, kind));
    let err: string | null = null;
    try {
      const res = await toggleReaction(reportId, kind);
      if ("error" in res) err = res.error;
    } catch {
      err = "לא הצלחנו לשלוח. נסו שוב";
    }
    if (err) setState((s) => restoreReactions(s, reportId, snap));
    return err;
  }, []);

  const me = { id: currentUserId, name: currentUserName, avatarUrl: currentUserAvatar };

  const status = useFeedRealtime({ onReportInsert, onReportDelete, onReplyInsert, onReplyDelete, onResync: resync });

  // Client-side TTL, so the UI matches the 12h rule even before the purge cron runs.
  useEffect(() => {
    const t = setInterval(() => setState((s) => dropExpired(s, reportCutoffIso())), TTL_CHECK_MS);
    return () => clearInterval(t);
  }, []);

  function loadMore() {
    const last = reports[reports.length - 1];
    if (!last) return;
    setFailed(false);
    startTransition(async () => {
      const res = await loadMoreReports({ created_at: last.created_at, id: last.id }, beachId, authorId);
      if (!res.ok) {
        setFailed(true);
        return;
      }
      setState((s) => appendPage(s, res.reports));
      setHasMore(res.reports.length >= FEED_PAGE_SIZE);
    });
  }

  const top = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">{heading}</div>
        <LiveDot status={status} />
      </div>
      <NewReportsPill
        count={state.queue.length}
        onClick={() => {
          flush();
          scrollTop();
        }}
      />
    </>
  );

  if (reports.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        {top}
        {emptyState ?? (
          <EmptyState title="עדיין שקט בים" description="היו הראשונים לספר מה קורה בחוף">
            <Link href="/new" className={cn(buttonVariants(), "min-h-touch")}>
              היה הראשון לדווח
            </Link>
          </EmptyState>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {top}
      {beachId == null && authorId == null ? <h1 className="sr-only">פיד דיווחים</h1> : null}
      <ul className="flex flex-col gap-5 px-1 py-1" aria-busy={pending}>
        {reports.map((r, i) => (
          <li
            key={r.id}
            className={leaving.has(r.id) ? "animate-card-out" : "motion-fade-up"}
            style={{ "--i": Math.min(i, 8) } as React.CSSProperties}
          >
            <ReportCard report={r} me={me} onToggleReaction={onToggleReaction} onDeleted={onReportDelete} />
          </li>
        ))}
      </ul>

      {failed ? (
        <p role="alert" className="text-center text-body-sm text-danger">
          לא הצלחנו לטעון עוד. נסו שוב
        </p>
      ) : null}

      {hasMore ? (
        <button
          type="button"
          onClick={loadMore}
          disabled={pending}
          className={cn(buttonVariants({ variant: "secondary" }), "min-h-touch self-center")}
        >
          {pending ? "טוענים..." : "טען עוד"}
        </button>
      ) : (
        <p className="py-2 text-center text-body-sm text-muted-text">זה הכל לעכשיו</p>
      )}
    </div>
  );
}
