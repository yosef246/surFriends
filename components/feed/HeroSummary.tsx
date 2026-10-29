import Link from "next/link";
import { Mascot } from "@/components/mascot";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { buttonVariants } from "@/components/ui/button";
import type { HeroSummary as Summary } from "@/lib/feed";
import { cn } from "@/lib/utils";

export function HeroSummary({ summary }: { summary: Summary }) {
  const { recentCount, latest } = summary;
  return (
    <section
      aria-label="סיכום חי"
      className="relative min-h-42 overflow-hidden rounded-card bg-signature p-5 shadow-hero"
    >
      <div className="relative z-10 flex max-w-[60%] flex-col items-start gap-2">
        <p className="text-body-sm font-medium text-ink">סיכום חי</p>
        {recentCount > 0 ? (
          <>
            <p
              className="numeral text-numeral-xl font-light"
              aria-label={`${recentCount} דיווחים בשעתיים האחרונות`}
            >
              <span aria-hidden>{recentCount}</span>
            </p>
            <p className="text-heading font-medium text-ink">
              {recentCount === 1 ? "דיווח בשעתיים האחרונות" : "דיווחים בשעתיים האחרונות"}
            </p>
          </>
        ) : (
          <>
            <p className="text-heading font-medium text-ink">הים שקט... היה הראשון לדווח</p>
            <Link
              href="/new"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "border-ink hover:bg-signature-hover"
              )}
            >
              לדיווח חדש
            </Link>
          </>
        )}
        {latest ? (
          <p className="text-body-sm text-ink">
            {latest.beachName ? `${latest.beachName} · ` : ""}
            <RelativeTime iso={latest.created_at} />
          </p>
        ) : null}
      </div>
      <Mascot.Wave size={120} className="absolute -bottom-2 end-3 animate-mascot-bob" />
    </section>
  );
}
