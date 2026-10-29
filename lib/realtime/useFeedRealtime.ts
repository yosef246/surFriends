"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type RealtimeStatus = "live" | "connecting";

export type ReplyRow = {
  id?: string;
  report_id?: string;
  user_id?: string;
  quick_reaction?: string | null;
  created_at?: string;
};

export type FeedRealtimeHandlers = {
  /** `beachId` comes from the INSERT payload (lets a beach page ignore other beaches). */
  onReportInsert: (id: string, beachId?: number, userId?: string) => void;
  onReportDelete: (id: string) => void;
  onReplyInsert: (row: ReplyRow) => void;
  /** `row` has report_id only with REPLICA IDENTITY FULL on replies (see migration). */
  onReplyDelete: (row: ReplyRow) => void;
  /** Reconnected / tab visible / back online: refetch the first page to heal missed events. */
  onResync: () => void;
};

/** One channel for reports + replies. Handlers are read through a ref, so no resubscribing. */
export function useFeedRealtime(handlers: FeedRealtimeHandlers): RealtimeStatus {
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let everSubscribed = false;
    let disposed = false;
    let live = false;

    const subscribe = () => {
      if (disposed) return;
      if (channel) void supabase.removeChannel(channel);
      setStatus("connecting");
      channel = supabase
        .channel("feed-live")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "reports" }, (p) => {
          const row = p.new as { id?: string; beach_id?: number; user_id?: string };
          if (row.id) ref.current.onReportInsert(row.id, row.beach_id, row.user_id);
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "reports" }, (p) => {
          const id = (p.old as { id?: string }).id;
          if (id) ref.current.onReportDelete(id);
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "replies" }, (p) =>
          ref.current.onReplyInsert(p.new as ReplyRow)
        )
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "replies" }, (p) =>
          ref.current.onReplyDelete(p.old as ReplyRow)
        )
        .subscribe((s) => {
          if (disposed) return;
          live = s === "SUBSCRIBED";
          if (s === "SUBSCRIBED") {
            setStatus("live");
            if (everSubscribed) ref.current.onResync(); // reconnect: heal the gap
            everSubscribed = true;
          } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT" || s === "CLOSED") {
            setStatus("connecting");
          }
        });
    };

    const resync = () => {
      if (document.visibilityState === "hidden") return;
      if (live) ref.current.onResync();
      else subscribe(); // fresh channel; its SUBSCRIBED triggers the resync
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") resync();
    };
    const onOnline = () => resync();
    const onOffline = () => {
      live = false;
      setStatus("connecting");
    };

    subscribe();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  return status;
}
