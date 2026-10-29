import { REPORT_TTL_HOURS } from "@/lib/reports";

/** Time-of-day greeting in Asia/Jerusalem. */
export function greetingFor(now: Date = new Date()): string {
  const h = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jerusalem", hour: "2-digit", hourCycle: "h23" }).format(now)
  );
  if (h >= 5 && h < 12) return "בוקר טוב";
  if (h >= 12 && h < 17) return "צהריים טובים";
  if (h >= 17 && h < 21) return "ערב טוב";
  return "לילה טוב";
}

/** "בוקר טוב <name>" in display type, a coral meta line and the 12-hour note. */
export function FeedGreeting({ greeting, firstName }: { greeting: string; firstName: string }) {
  return (
    <section aria-label="ברכה" className="flex flex-col gap-1 pt-2">
      <p className="eyebrow">חופי ישראל · עכשיו</p>
      <p className="text-display font-display font-normal text-balance text-ink">
        {greeting} {firstName ? firstName : <span aria-hidden>🤙</span>}
      </p>
      <p className="text-label text-muted-text">דיווחים נעלמים אחרי {REPORT_TTL_HOURS} שעות</p>
    </section>
  );
}
