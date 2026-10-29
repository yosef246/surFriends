"use client";

import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { deleteReply, replyToReport } from "@/app/actions/replies";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { buttonVariants } from "@/components/ui/button";
import { subscribeReplyEvents } from "@/lib/realtime/reply-events";
import {
  REACTION_LABEL,
  REPLY_COUNTER_FROM,
  REPLY_TEXT_MAX,
  fetchReplies,
  fetchReplyById,
  mergeReplies,
  removeReplyById,
  upsertReply,
  validateReplyInput,
  type ReplyItem,
} from "@/lib/replies";
import { textLength } from "@/lib/reports";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MAX_COMPOSER_PX = 96; // 3 lines

export type ThreadViewer = { id: string; name: string; avatarUrl: string | null };

export function ReplyThread({ reportId, panelId, me }: { reportId: string; panelId: string; me: ThreadViewer }) {
  const [items, setItems] = useState<ReplyItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [text, setText] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef(text);
  const itemsRef = useRef(items);
  useEffect(() => {
    textRef.current = text;
    itemsRef.current = items;
  });

  const load = useCallback(async () => {
    try {
      const fetched = await fetchReplies(createClient(), reportId);
      setItems((cur) => mergeReplies(cur, fetched));
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoaded(true);
    }
  }, [reportId]);

  // Lazy load: the thread only mounts when the card is expanded.
  useEffect(() => {
    void load();
  }, [load]);

  // Live updates arrive through the feed's single channel (reply-events), not a channel per card.
  useEffect(
    () =>
      subscribeReplyEvents(reportId, (e) => {
        if (e.type === "resync") {
          void load();
        } else if (e.type === "delete") {
          setItems((cur) => removeReplyById(cur, e.id));
        } else {
          const { id, created_at } = e.row;
          const known = itemsRef.current.find((r) => r.id === id);
          if (known) {
            // Our optimistic copy (or a repeat): confirm it with the server timestamp.
            setItems((cur) => {
              const mine = cur.find((r) => r.id === id);
              return mine ? upsertReply(cur, { ...mine, pending: false, created_at: created_at ?? mine.created_at }) : cur;
            });
          } else {
            void fetchReplyById(createClient(), id).then((item) => {
              if (item) setItems((cur) => upsertReply(cur, item));
            });
          }
        }
      }),
    [reportId, load]
  );

  // One-line pill that grows to 3 lines when the text wraps.
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, MAX_COMPOSER_PX) + "px";
    el.style.overflowY = el.scrollHeight > MAX_COMPOSER_PX ? "auto" : "hidden";
  }, [text]);

  const len = textLength(text);
  const tooLong = len > REPLY_TEXT_MAX;
  const canSend = text.trim().length > 0 && !tooLong;

  async function send() {
    const v = validateReplyInput(reportId, text);
    if (!v.ok) {
      setSendError(v.error);
      return;
    }
    const { id, text: clean } = v.value;
    const draft = text;
    setSendError(null);
    setText("");
    setItems((cur) =>
      upsertReply(cur, {
        id,
        user_id: me.id,
        text: clean,
        quick_reaction: null,
        created_at: new Date().toISOString(),
        author: { display_name: me.name, avatar_url: me.avatarUrl },
        pending: true,
      })
    );
    const res = await replyToReport(reportId, clean, id);
    if ("error" in res) {
      setItems((cur) => removeReplyById(cur, id));
      setSendError(res.error);
      if (textRef.current === "") setText(draft); // keep the draft
      taRef.current?.focus();
      return;
    }
    setItems((cur) => {
      const mine = cur.find((r) => r.id === id);
      return mine ? upsertReply(cur, { ...mine, pending: false }) : cur;
    });
  }

  const metaError = sendError ?? (tooLong ? `התגובה ארוכה מדי (עד ${REPLY_TEXT_MAX} תווים)` : null);

  return (
    <div id={panelId} role="region" aria-label="תגובות" className="flex flex-col gap-3 border-t border-line pt-3">
      {!loaded ? (
        <div aria-hidden className="flex flex-col gap-2">
          <div className="skeleton h-10 w-2/3 rounded-2xl" />
          <div className="skeleton h-10 w-1/2 rounded-2xl" />
        </div>
      ) : loadError && items.length === 0 ? (
        <p role="alert" className="text-body-sm text-danger">
          לא הצלחנו לטעון תגובות.{" "}
          <button type="button" onClick={() => void load()} className="min-h-touch font-medium text-link underline">
            נסו שוב
          </button>
        </p>
      ) : items.length === 0 ? (
        <p className="py-2 text-center text-body-sm text-muted-text">עוד אין תגובות. תהיו הראשונים 🤙</p>
      ) : (
        <ul className="flex flex-col gap-3" aria-live="polite" aria-relevant="additions">
          {items.map((r) => (
            <ReplyRow
              key={r.id}
              reply={r}
              mine={r.user_id === me.id}
              onRemoved={(id) => setItems((cur) => removeReplyById(cur, id))}
            />
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) void send();
        }}
        className="flex items-end gap-2"
      >
        <div className="min-w-0 flex-1">
          <label htmlFor={`${panelId}-text`} className="sr-only">
            כתבו תגובה
          </label>
          <textarea
            id={`${panelId}-text`}
            ref={taRef}
            value={text}
            rows={1}
            placeholder="כתבו תגובה..."
            enterKeyHint="send"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (canSend) void send();
              }
            }}
            aria-invalid={metaError ? true : undefined}
            aria-describedby={`${panelId}-meta`}
            className="block min-h-12 w-full resize-none rounded-pill border-[1.5px] border-input bg-white/90 px-5 py-3 text-body text-copy shadow-card backdrop-blur-sm placeholder:text-muted-text focus:border-link-blue focus:ring-3 focus:ring-link/25 focus:outline-none aria-invalid:border-danger"
          />
        </div>
        <button
          type="submit"
          disabled={!canSend}
          aria-label="שלחו תגובה"
          className={cn(buttonVariants({ variant: "ocean", size: "icon" }))}
        >
          <Send aria-hidden className="rtl:-scale-x-100" />
        </button>
      </form>
      <div id={`${panelId}-meta`} className="flex justify-between gap-2 text-body-sm empty:hidden">
        <span role="alert" className="text-danger">
          {metaError ? `⚠ ${metaError}` : ""}
        </span>
        {len > REPLY_COUNTER_FROM ? (
          <span className={cn("font-mono", tooLong ? "text-danger" : "text-muted-text")}>
            {len}/{REPLY_TEXT_MAX}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ReplyRow({
  reply,
  mine,
  onRemoved,
}: {
  reply: ReplyItem;
  mine: boolean;
  onRemoved: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = reply.author?.display_name ?? "גולש/ת";
  const badge = reply.quick_reaction ? REACTION_LABEL[reply.quick_reaction] : null;

  async function remove() {
    setBusy(true);
    setError(null);
    const res = await deleteReply(reply.id);
    if ("error" in res) {
      setBusy(false);
      setError(res.error);
      return;
    }
    onRemoved(reply.id); // the realtime DELETE dedupes (removeReplyById is idempotent)
  }

  return (
    <li className={cn("motion-fade-up flex gap-2.5", (reply.pending || busy) && "opacity-60")}>
      <UserAvatar name={name} src={reply.author?.avatar_url} className="size-8" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2">
          <span className="truncate text-body-sm font-medium text-ink">{name}</span>
          {reply.pending ? (
            <span className="text-caption text-muted-text">שולח...</span>
          ) : (
            <RelativeTime iso={reply.created_at} className="text-caption text-muted-text" />
          )}
          {mine && !reply.pending ? (
            confirming ? (
              <span className="ms-auto flex items-center gap-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove()}
                  className="min-h-touch px-2 text-body-sm font-medium text-danger"
                >
                  מחקו
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirming(false)}
                  className="min-h-touch px-2 text-body-sm text-muted-text"
                >
                  ביטול
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                aria-label="מחקו את התגובה"
                className="bubble-ghost ms-auto min-h-touch rounded-pill px-3 text-body-sm text-muted-text"
              >
                מחיקה
              </button>
            )
          ) : null}
        </div>
        {badge ? (
          <span className="bubble-chip mt-0.5 inline-flex items-center gap-1 rounded-pill px-3 py-0.5 text-body-sm">
            <span aria-hidden>{badge.emoji}</span>
            {badge.label}
          </span>
        ) : null}
        {reply.text ? <p className="mt-0.5 text-body break-words whitespace-pre-line text-copy">{reply.text}</p> : null}
        <p role="alert" className="text-body-sm text-danger empty:hidden">
          {error ? `⚠ ${error}` : null}
        </p>
      </div>
    </li>
  );
}
