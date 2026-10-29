import Link from "next/link";
import { Mascot } from "@/components/mascot";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { WaveStrip } from "@/components/shared/WaveStrip";
import type { HeroSummary as Summary } from "@/lib/feed";

/** Live summary card (v3 look): deep-ocean gradient, floating mascot, big numeral, animated wave strip. */
export function HeroSummary({ summary }: { summary: Summary }) {
  const { recentCount, latest } = summary;
  return (
    <section
      aria-label="סיכום חי"
      className="motion-pop-in relative min-h-44 overflow-hidden rounded-card bg-hero-ocean p-5 pb-10 text-white"
    >
      <WaveStrip />
      <div className="relative z-10 flex max-w-[60%] flex-col items-start gap-2">
        <p className="eyebrow-ocean">חופי ישראל · עכשיו</p>
        {recentCount > 0 ? (
          <>
            <p className="numeral font-display text-numeral-xl font-normal text-white">{recentCount}</p>
            <p className="text-heading heading-tight font-display font-normal text-white">
              {recentCount === 1 ? "דיווח בשעתיים האחרונות" : "דיווחים בשעתיים האחרונות"}
            </p>
          </>
        ) : (
          <>
            <p className="text-heading heading-tight font-display font-normal text-white">הים שקט... כולם מחכים שמישהו יעז. אתם?</p>
            <Link href="/new" className="inline-flex h-10 items-center rounded-lg bg-white px-4 text-body-sm font-semibold text-brand">
              לדיווח חדש
            </Link>
          </>
        )}
        {latest ? (
          <p className="text-body-sm text-white">
            {latest.beachName ? `${latest.beachName} · ` : ""}
            <RelativeTime iso={latest.created_at} />
          </p>
        ) : null}
      </div>
      <Mascot.Wave size={120} className="motion-float absolute bottom-3 end-3 z-10" />
    </section>
  );
}
