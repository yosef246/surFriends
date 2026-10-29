"use client";

import Link from "next/link";
import { Waves } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

type Props = { displayName: string; avatarUrl: string | null };

/** App header (DESIGN_SYSTEM 5i): white, hairline, surFriends wordmark at the start, profile avatar at the end. */
export function TopBar({ displayName, avatarUrl }: Props) {
  return (
    <header className="bar-coast sticky top-0 z-30 border-b">
      <div className="mx-auto flex h-topbar w-full max-w-feed items-center justify-between gap-3 px-4">
        <Link
          href="/"
          aria-label="surFriends, לדף הבית"
          className="flex min-h-touch items-center gap-2 font-display text-section font-normal text-brand"
        >
          <Waves className="size-6 shrink-0" aria-hidden />
          surFriends
        </Link>
        <Link
          href="/profile"
          aria-label={`הפרופיל של ${displayName}`}
          className="motion-press flex min-h-touch min-w-touch items-center justify-center rounded-full"
        >
          <UserAvatar name={displayName} src={avatarUrl} className="size-9" />
        </Link>
      </div>
    </header>
  );
}
