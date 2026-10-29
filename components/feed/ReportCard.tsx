"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { RelativeTime } from "@/components/shared/RelativeTime";
import type { FeedReport } from "@/lib/feed";
import type { ReactionKind } from "@/lib/replies";
import { QuickReactionBar } from "./QuickReactionBar";
import { ReplyThread, type ThreadViewer } from "./ReplyThread";
import { ReportMenu } from "./ReportMenu";
import { WaveRating } from "./WaveRating";

// next/image throws for hosts not in next.config; never let one bad row take the feed down.
const IMAGE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host;
  } catch {
    return null;
  }
})();
function isTrustedImage(url: string) {
  try {
    return IMAGE_HOST !== null && new URL(url).host === IMAGE_HOST;
  } catch {
    return false;
  }
}

const commentsLabel = (n: number) => (n === 0 ? "הגיבו" : n === 1 ? "תגובה אחת" : `${n} תגובות`);

export function ReportCard({
  report,
  me,
  onToggleReaction,
  onDeleted,
}: {
  report: FeedReport;
  me: ThreadViewer;
  /** Optimistic reaction toggle owned by the feed; resolves to an error message or null. */
  onToggleReaction: (reportId: string, kind: ReactionKind) => Promise<string | null>;
  onDeleted: (reportId: string) => void;
}) {
  const name = report.author?.display_name ?? "גולש/ת";
  const { beach } = report;
  const [open, setOpen] = useState(false);
  const panelId = `thread-${useId()}`;
  const isOwn = report.user_id === me.id;

  return (
    <article className="glass-card bubble-post motion-bubble-hover flex flex-col gap-3 p-5">
      <header className="flex items-center gap-3">
        <Link
          href={`/profile/${report.user_id}`}
          className="flex min-h-touch min-w-0 items-center gap-3 text-body font-medium text-ink"
        >
          <UserAvatar name={name} src={report.author?.avatar_url} />
          <span className="truncate">{name}</span>
        </Link>
        <RelativeTime
          iso={report.created_at}
          className="ms-auto shrink-0 text-body-sm text-muted-text"
        />
        {isOwn ? <ReportMenu reportId={report.id} onDeleted={onDeleted} /> : null}
      </header>

      {beach ? (
        <Link
          href={`/beach/${beach.id}`}
          className="-my-2 flex min-h-touch items-center gap-1 font-display text-heading font-normal tracking-tight text-link"
        >
          <span>{beach.name_he}</span>
          <span className="text-muted-text">· {beach.city}</span>
        </Link>
      ) : null}

      {report.wave_rating !== null || report.wave_height_estimate ? (
        <div className="flex items-center justify-between gap-3">
          {report.wave_rating !== null ? <WaveRating value={report.wave_rating} /> : <span />}
          {report.wave_height_estimate ? (
            <p className="flex flex-col items-end text-end">
              <span className="text-caption text-muted-text">גובה גל</span>
              <span className="text-heading font-medium text-ink">{report.wave_height_estimate}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      {report.text ? (
        <p className="text-body break-words whitespace-pre-line text-copy">{report.text}</p>
      ) : null}

      {report.image_url && isTrustedImage(report.image_url) ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface">
          <Image
            src={report.image_url}
            alt={beach ? `תמונה מהדיווח ב${beach.name_he}` : "תמונה מהדיווח"}
            fill
            sizes="(max-width: 576px) 100vw, 576px"
            className="object-cover"
          />
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
          className="bubble-chip inline-flex min-h-touch items-center gap-1.5 rounded-pill px-4 text-body-sm font-medium whitespace-nowrap"
        >
          <span aria-hidden>💬</span>
          <span>{commentsLabel(report.replyCount)}</span>
        </button>
      </QuickReactionBar>

      {open ? <ReplyThread reportId={report.id} panelId={panelId} me={me} /> : null}
    </article>
  );
}

export function ReportCardSkeleton() {
  return (
    <div
      aria-hidden
      className="glass-card bubble-post flex flex-col gap-3 p-5"
    >
      <div className="flex items-center gap-3">
        <div className="skeleton size-9 rounded-full" />
        <div className="skeleton h-4 w-32 rounded" />
      </div>
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
      <div className="skeleton aspect-[4/3] w-full rounded-lg" />
    </div>
  );
}
