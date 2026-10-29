"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Waves } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

type Props = { displayName: string; avatarUrl: string | null };

/** Simple title bar for inner pages. The feed has its own greeting header (FeedHeader). */
export function TopBar({ displayName, avatarUrl }: Props) {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <header className="glass-bar">
      <div className="mx-auto flex min-h-topbar w-full max-w-feed items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-h-touch items-center gap-2 text-heading font-medium text-ink">
          <Waves className="size-6" aria-hidden />
          surFriends
        </Link>
        <Link
          href="/profile"
          aria-label={`הפרופיל של ${displayName}`}
          className="flex min-h-touch min-w-touch items-center justify-center rounded-full"
        >
          <UserAvatar name={displayName} src={avatarUrl} />
        </Link>
      </div>
    </header>
  );
}
