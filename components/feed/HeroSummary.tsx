import Link from "next/link";
import { PhotoHero } from "@/components/shared/PhotoHero";
import { RelativeTime } from "@/components/shared/RelativeTime";
import type { HeroSummary as Summary } from "@/lib/feed";
import { DEFAULT_BEACH_PHOTO, beachPhotoSrc } from "@/lib/beach-photo";

/** Live summary as a PhotoHero (the photo is the most recently reported beach; hilton when there is none). */
export function HeroSummary({ summary }: { summary: Summary }) {
  const { recentCount, latest } = summary;
  const hasPhoto = !!beachPhotoSrc(latest?.imagePath);
  const photo = hasPhoto ? { path: latest!.imagePath!, credit: latest!.imageCredit } : DEFAULT_BEACH_PHOTO;
  return (
    <PhotoHero
      label="סיכום חי"
      priority
      imagePath={photo.path}
      imageCredit={photo.credit}
      eyebrow="סיכום חי · חופי ישראל"
      title={
        recentCount > 0 ? (
          <p>
            <span className="numeral">{recentCount}</span> {recentCount === 1 ? "דיווח" : "דיווחים"} בשעתיים האחרונות
          </p>
        ) : (
          <p>הים שקט... כולם מחכים שמישהו יעז. אתם?</p>
        )
      }
    >
      {latest ? (
        <p className="text-body-sm text-white/90">
          {latest.beachName ? `${latest.beachName} · ` : ""}
          <RelativeTime iso={latest.created_at} />
        </p>
      ) : null}
      {recentCount === 0 ? (
        <Link href="/new" className="btn-primary mt-1 inline-flex h-10 items-center rounded-lg px-4 text-body-sm font-semibold">
          לדיווח חדש
        </Link>
      ) : null}
    </PhotoHero>
  );
}
