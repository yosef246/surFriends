import Link from "next/link";
import { Mascot } from "@/components/mascot";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { WaveStrip } from "@/components/shared/WaveStrip";
import { buttonVariants } from "@/components/ui/button";
import type { HeroSummary as Summary } from "@/lib/feed";
import { cn } from "@/lib/utils";

export function HeroSummary({ summary }: { summary: Summary }) {
  const { recentCount, latest } = summary;
  return (
    <section
      aria-label="סיכום חי"
      className="motion-pop-in relative min-h-44 overflow-hidden rounded-card bg-hero-sea p-5 pb-10 text-white shadow-hero"
    >
      <WaveStrip />
      <div className="relative z-10 flex max-w-[60%] flex-col items-start gap-2">
        <p className="eyebrow eyebrow-light">סיכום חי</p>
        {recentCount > 0 ? (
          <>
            <p
              className="numeral font-display text-numeral-xl font-normal text-white"
              aria-label={`${recentCount} דיווחים בשעתיים האחרונות`}
            >
              <span aria-hidden>{recentCount}</span>
            </p>
            <p className="text-heading heading-tight font-display font-normal text-white">
              {recentCount === 1 ? "דיווח בשעתיים האחרונות" : "דיווחים בשעתיים האחרונות"}
            </p>
          </>
        ) : (
          <>
            <p className="text-heading heading-tight font-display font-normal text-white">הים שקט... כולם מחכים שמישהו יעז. אתם?</p>
            <Link href="/new" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
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
