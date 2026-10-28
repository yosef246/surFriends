import Link from "next/link";
import { Waves } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

type Props = { displayName: string; avatarUrl: string | null };

export function TopBar({ displayName, avatarUrl }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="mx-auto flex h-topbar w-full max-w-feed items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex min-h-touch items-center gap-2 text-heading font-bold text-sea-deep"
        >
          <Waves className="size-6" aria-hidden />
          surFriends
        </Link>
        <div className="flex items-center gap-2">
          {/* Day 5+: feed filter button goes in this slot (visual placeholder only). */}
          <div className="min-h-touch min-w-touch" aria-hidden data-slot="topbar-filter" />
          <Link
            href="/profile"
            aria-label={`הפרופיל של ${displayName}`}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-full"
          >
            <UserAvatar name={displayName} src={avatarUrl} />
          </Link>
        </div>
      </div>
    </header>
  );
}
