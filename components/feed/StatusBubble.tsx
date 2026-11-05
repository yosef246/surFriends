"use client";

import Link from "next/link";
import { useState } from "react";
import { Ruler } from "lucide-react";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { RelativeAgo } from "@/components/shared/RelativeTime";
import { WaveLevel } from "@/components/shared/WaveLevel";
import { formatClock, senderColor } from "@/lib/bubbles";
import type { FeedReport } from "@/lib/feed";
import type { ReactionKind } from "@/lib/replies";
import { isTrustedMedia } from "@/lib/media-trust";
import { cn } from "@/lib/utils";
import { PhotoLightbox } from "./PhotoLightbox";
import { ReportText } from "./ReportText";
import { QuickReactionBar } from "./QuickReactionBar";
import { ReplyThread, type ThreadViewer } from "./ReplyThread";
import { ReportMenu } from "./ReportMenu";

const commentsLabel = (n: number) => (n === 0 ? "הגיבו" : n === 1 ? "תגובה אחת" : `${n} תגובות`);

/**
 * One report as a WhatsApp-style message (DESIGN_SYSTEM 5c). Others: avatar at the start (right in RTL).
 * Mine: opposite side, no avatar, brand-soft. `grouped` = continues the previous bubble from the same sender
 * (within 10 minutes): no avatar, no name, no tail.
 */
export function StatusBubble({
  report,
  me,
  grouped = false,
  priority = false,
  onToggleReaction,
  onDeleted,
}: {
  report: FeedReport;
  me: ThreadViewer;
  grouped?: boolean;
  /** First bubble in the list: its photo is likely the LCP element. */
  priority?: boolean;
  /** Optimistic reaction toggle owned by the feed; resolves to an error message or null. */
  onToggleReaction: (reportId: string, kind: ReactionKind) => Promise<string | null>;
  onDeleted: (reportId: string) => void;
}) {
  const name = report.author?.display_name ?? "גולש/ת";
  const { beach } = report;
  const [open, setOpen] = useState(false);
  // Derived from the report id (not useId): stable across server and client even if the tree above differs.
  const panelId = `thread-${report.id}`;
  const isOwn = report.user_id === me.id;
  const hasImage = !!report.image_url && isTrustedMedia(report.image_url);
  const hasMedia = hasImage;
  const showHeader = !grouped;

  return (
    <article
      aria-label={`דיווח מאת ${isOwn ? "אני" : name}`}
      className={cn("flex items-start gap-2.5", isOwn && "justify-end")}
    >
      {!isOwn ? (
        showHeader ? (
          <Link
            href={`/profile/${report.user_id}`}
            aria-label={`הפרופיל של ${name}`}
            className="-m-1 shrink-0 p-1"
          >
            <UserAvatar name={name} src={report.author?.avatar_url} className="size-9" />
          </Link>
        ) : (
          <span aria-hidden className="size-9 shrink-0" />
        )
      ) : null}

      <div className={cn("min-w-0 max-w-[88%]", hasMedia && "w-full")}>
        <div
          data-own={isOwn ? "true" : undefined}
          className={cn(
            "bubble-msg flex flex-col gap-1.5",
            !hasMedia && "w-fit min-w-52 max-w-full",
            grouped && "before:hidden rounded-ss-xl! rounded-se-xl!"
          )}
        >
          {(showHeader && !isOwn) || beach || isOwn ? (
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col items-start gap-1">
                {showHeader && !isOwn ? (
                  <Link
                    href={`/profile/${report.user_id}`}
                    data-c={senderColor(report.user_id)}
                    className="bubble-sender max-w-full truncate"
                  >
                    {name}
                  </Link>
                ) : null}
                {beach ? (
                  <Link
                    href={`/beach/${beach.id}`}
                    className="chip-link relative max-w-full before:absolute before:-inset-y-2 before:inset-x-0 before:content-['']"
                  >
                    <span className="truncate">{beach.name_he}</span>
                  </Link>
                ) : null}
              </div>
              {isOwn ? (
                <div className="-me-2 -mt-1.5 shrink-0">
                  <ReportMenu reportId={report.id} onDeleted={onDeleted} />
                </div>
              ) : null}
            </div>
          ) : null}

          {report.text ? (
            <ReportText text={report.text} />
          ) : null}

          {hasImage ? (
            <PhotoLightbox
              src={report.image_url!}
              alt={beach ? `תמונה מהדיווח ב${beach.name_he}` : "תמונה מהדיווח"}
              priority={priority}
            />
          ) : null}

          {report.wave_rating !== null || report.wave_height_estimate ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {report.wave_rating !== null ? <WaveLevel value={report.wave_rating} /> : null}
              {report.wave_height_estimate ? (
                <span
                  aria-label={`גובה גל: ${report.wave_height_estimate}`}
                  className="inline-flex h-6 items-center gap-1 rounded-pill bg-surface px-2 text-caption font-semibold text-copy"
                >
                  <Ruler className="size-3.5" aria-hidden />
                  <span aria-hidden>{report.wave_height_estimate}</span>
                </span>
              ) : null}
            </div>
          ) : null}

          <QuickReactionBar
            comingCount={report.comingCount}
            onTheWayCount={report.onTheWayCount}
            myComing={report.myComing}
            myOnTheWay={report.myOnTheWay}
            isOwn={isOwn}
            onToggle={(kind) => onToggleReaction(report.id, kind)}
          >
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((o) => !o)}
              className="chip-coast min-h-touch"
            >
              <span aria-hidden>💬</span>
              <span>{commentsLabel(report.replyCount)}</span>
            </button>
          </QuickReactionBar>

          {open ? <ReplyThread reportId={report.id} panelId={panelId} me={me} /> : null}

          <p className="bubble-time self-end">
            <time dateTime={report.created_at}>{formatClock(report.created_at)}</time>
            <RelativeAgo iso={report.created_at} prefix=" · " />
          </p>
        </div>
      </div>
    </article>
  );
}

export function BubbleSkeleton() {
  return (
    <div aria-hidden className="flex items-start gap-2.5">
      <div className="skeleton size-9 shrink-0 rounded-full" />
      <div className="card-coast flex w-4/5 flex-col gap-2 rounded-bubble">
        <div className="skeleton h-3.5 w-24 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-5 w-28 rounded" />
      </div>
    </div>
  );
}
