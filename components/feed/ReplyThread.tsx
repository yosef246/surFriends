"use client";

import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { deleteReply, replyToReport } from "@/app/actions/replies";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { useDaylight } from "@/components/night/DaylightProvider";
import { RelativeAgo } from "@/components/shared/RelativeTime";
import { buttonVariants } from "@/components/ui/button";
import { formatClock, senderColor } from "@/lib/bubbles";
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
import { INPUT_CLASS } from "@/components/ui/field";
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
  const { isNight, opensLabel } = useDaylight();
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
  const canSend = text.trim().length > 0 && !tooLong && !isNight;

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
    let res: Awaited<ReturnType<typeof replyToReport>>;
    try {
      res = await replyToReport(reportId, clean, id);
    } catch {
      res = { error: typeof navigator !== "undefined" && !navigator.onLine ? "אין חיבור. נסו שוב" : "השליחה נכשלה. נסו שוב" };
    }
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
    <div id={panelId} role="region" aria-label="תגובות" className="flex flex-col gap-2.5 border-t border-card-line pt-2.5">
      {!loaded ? (
        <div aria-hidden className="flex flex-col gap-2">
          <div className="skeleton h-9 w-2/3 rounded-xl" />
          <div className="skeleton h-9 w-1/2 rounded-xl" />
        </div>
      ) : loadError && items.length === 0 ? (
        <p role="alert" className="text-body-sm text-danger">
          לא הצלחנו לטעון תגובות.{" "}
          <button type="button" onClick={() => void load()} className="min-h-touch font-semibold text-brand underline">
            נסו שוב
          </button>
        </p>
      ) : items.length === 0 ? (
        <p className="py-2 text-center text-body-sm text-muted-text">עוד אין תגובות. תהיו הראשונים 🤙</p>
      ) : (
        <ul className="flex flex-col gap-2" aria-live="polite" aria-relevant="additions">
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
        className="flex items-end gap-2 rounded-3xl bg-page p-1.5"
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
            disabled={isNight}
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
            className={cn(INPUT_CLASS, "resize-none rounded-3xl px-4")}
          />
        </div>
        <button
          type="submit"
          disabled={!canSend}
          aria-label="שלחו תגובה"
          className={cn(buttonVariants({ variant: "ocean", size: "icon" }), "shrink-0 rounded-full")}
        >
          <Send aria-hidden className="rtl:-scale-x-100" />
        </button>
      </form>
      {isNight ? (
        <p className="text-body-sm text-muted-text">התגובות ייפתחו בזריחה ({opensLabel})</p>
      ) : null}
      <div id={`${panelId}-meta`} className="flex justify-between gap-2 text-body-sm empty:hidden">
        <span role="alert" className="text-danger">
          {metaError ? `⚠ ${metaError}` : ""}
        </span>
        {len > REPLY_COUNTER_FROM ? (
          <span className={cn("tabular-nums", tooLong ? "text-danger" : "text-muted-text")}>
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
    let res: Awaited<ReturnType<typeof deleteReply>>;
    try {
      res = await deleteReply(reply.id);
    } catch {
      res = { error: typeof navigator !== "undefined" && !navigator.onLine ? "אין חיבור. נסו שוב" : "המחיקה נכשלה. נסו שוב" };
    }
    if ("error" in res) {
      setBusy(false);
      setError(res.error);
      return;
    }
    onRemoved(reply.id); // the realtime DELETE dedupes (removeReplyById is idempotent)
  }

  return (
    <li className={cn("motion-fade-up flex items-start gap-2", mine && "justify-end", (reply.pending || busy) && "opacity-60")}>
      {!mine ? <UserAvatar name={name} src={reply.author?.avatar_url} className="size-7 text-caption" /> : null}
      <div
        data-own={mine ? "true" : undefined}
        className="bubble-msg min-w-0 max-w-[85%] before:hidden"
      >
        {!mine ? (
          <p data-c={senderColor(reply.user_id)} className="bubble-sender truncate">
            {name}
          </p>
        ) : null}
        {badge ? (
          <span className="chip-link my-0.5 h-6 text-caption">
            <span aria-hidden>{badge.emoji}</span>
            {badge.label}
          </span>
        ) : null}
        {reply.text ? <p className="text-body-sm break-words whitespace-pre-line text-copy">{reply.text}</p> : null}
        <p role="alert" className="text-body-sm text-danger empty:hidden">
          {error ? `⚠ ${error}` : null}
        </p>
        <div className="flex items-center justify-end gap-1">
          {mine && !reply.pending ? (
            confirming ? (
              <span className="flex items-center">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove()}
                  className="min-h-touch px-2 text-label font-semibold text-danger"
                >
                  מחקו
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirming(false)}
                  className="min-h-touch px-2 text-label text-muted-text"
                >
                  ביטול
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                aria-label="מחקו את התגובה"
                className="min-h-touch px-2 text-label text-muted-text underline-offset-2 hover:underline"
              >
                מחיקה
              </button>
            )
          ) : null}
          {reply.pending ? (
            <span className="bubble-time">שולח...</span>
          ) : (
            <span className="bubble-time">
              <time dateTime={reply.created_at}>{formatClock(reply.created_at)}</time>
              <RelativeAgo iso={reply.created_at} prefix=" · " />
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
