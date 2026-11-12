import Link from "next/link";
import { Mascot } from "@/components/mascot";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { WaveStrip } from "@/components/shared/WaveStrip";
import type { HeroSummary as Summary } from "@/lib/feed";

/** Live summary card: electric-blue sticker card, black outline + text, floating mascot, big crushed numeral. */
export function HeroSummary({ summary }: { summary: Summary }) {
  const { recentCount, latest } = summary;
  return (
    <section
      aria-label="סיכום חי"
      className="motion-pop-in relative min-h-44 overflow-hidden rounded-[1.875rem] bg-hero-ocean p-5 pb-10 text-ink"
    >
      <WaveStrip />
      <div className="relative z-10 flex max-w-[60%] flex-col items-start gap-2">
        <p className="eyebrow-ocean">חופי ישראל · עכשיו</p>
        {recentCount > 0 ? (
          <>
            <p className="numeral font-display text-numeral-xl font-bold text-ink">{recentCount}</p>
            <p className="heading-tight text-[1.75rem] text-ink">
              {recentCount === 1 ? "דיווח בשעתיים האחרונות" : "דיווחים בשעתיים האחרונות"}
            </p>
          </>
        ) : (
          <>
            <p className="heading-tight text-[1.75rem] text-ink">הים שקט... כולם מחכים שמישהו יעז. אתם?</p>
            <Link href="/new" className="btn-primary inline-flex h-10 items-center rounded-full px-5 text-body-sm font-bold tracking-[0.02em]">
              לדיווח חדש
            </Link>
          </>
        )}
        {latest ? (
          <p className="text-body-sm font-medium text-ink">
            {latest.beachName ? `${latest.beachName} · ` : ""}
            <RelativeTime iso={latest.created_at} />
          </p>
        ) : null}
      </div>
      <Mascot.Wave size={120} className="motion-float absolute bottom-3 end-3 z-10" />
    </section>
  );
}
