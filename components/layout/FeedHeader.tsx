import Link from "next/link";
import { UserAvatar } from "./UserAvatar";

type Props = { greeting: string; firstName: string; displayName: string; avatarUrl: string | null };

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

export function FeedHeader({ greeting, firstName, displayName, avatarUrl }: Props) {
  return (
    <header className="flex min-h-topbar items-center justify-between gap-3">
      <p className="min-w-0 text-title font-light text-ink">
        {greeting}
        {firstName ? <span className="font-medium"> {firstName}</span> : null}
      </p>
      <Link
        href="/profile"
        aria-label={`הפרופיל של ${displayName}`}
        className="flex min-h-touch min-w-touch items-center justify-center rounded-full"
      >
        <UserAvatar name={displayName} src={avatarUrl} className="size-10 text-ink" />
      </Link>
    </header>
  );
}
