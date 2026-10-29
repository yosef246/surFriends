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
        <Link href="/" className="flex min-h-touch items-center gap-2 text-ink">
          <Waves className="size-6 text-link-blue" aria-hidden />
          <span className="text-title heading-tight font-display font-normal text-gradient-sea">surFriends</span>
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
