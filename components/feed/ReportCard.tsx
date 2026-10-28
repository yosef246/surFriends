import Image from "next/image";
import Link from "next/link";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { RelativeTime } from "@/components/shared/RelativeTime";
import type { FeedReport } from "@/lib/feed";
import { WaveRating } from "./WaveRating";

export function ReportCard({ report }: { report: FeedReport }) {
  const name = report.author?.display_name ?? "גולש/ת";
  const { beach } = report;
  const counts = [
    report.replyCount > 0
      ? report.replyCount === 1
        ? "תגובה אחת"
        : `${report.replyCount} תגובות`
      : null,
    report.comingCount > 0
      ? report.comingCount === 1
        ? "בא אחד"
        : `${report.comingCount} באים`
      : null,
  ].filter(Boolean);

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-card">
      <header className="flex items-center gap-3">
        <Link
          href={`/profile/${report.user_id}`}
          className="flex min-h-touch min-w-0 items-center gap-3 text-body font-semibold text-sea-deep"
        >
          <UserAvatar name={name} src={report.author?.avatar_url} />
          <span className="truncate">{name}</span>
        </Link>
        <RelativeTime
          iso={report.created_at}
          className="ms-auto shrink-0 text-body-sm text-mist-text"
        />
      </header>

      {beach ? (
        <Link
          href={`/beach/${beach.id}`}
          className="-my-2 flex min-h-touch items-center gap-1 text-body-sm font-medium text-link"
        >
          <span>{beach.name_he}</span>
          <span className="text-mist-text">· {beach.city}</span>
        </Link>
      ) : null}

      {report.wave_rating !== null || report.wave_height_estimate ? (
        <div className="flex flex-col gap-1">
          {report.wave_rating !== null ? <WaveRating value={report.wave_rating} /> : null}
          {report.wave_height_estimate ? (
            <p className="text-body-sm text-shadow">גובה: {report.wave_height_estimate}</p>
          ) : null}
        </div>
      ) : null}

      <p className="text-body break-words whitespace-pre-line text-shadow">{report.text}</p>

      {report.image_url ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={report.image_url}
            alt={beach ? `תמונה מהדיווח ב${beach.name_he}` : "תמונה מהדיווח"}
            fill
            sizes="(max-width: 576px) 100vw, 576px"
            className="object-cover"
          />
        </div>
      ) : null}

      {counts.length > 0 ? (
        <p className="text-body-sm text-mist-text">{counts.join(" · ")}</p>
      ) : null}
    </article>
  );
}

export function ReportCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-card"
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
