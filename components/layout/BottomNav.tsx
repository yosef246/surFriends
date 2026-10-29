"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "פיד", icon: Home, match: (p: string) => p === "/" || p.startsWith("/beach/") },
  { href: "/profile", label: "פרופיל", icon: User, match: (p: string) => p.startsWith("/profile") },
  { href: "/settings", label: "הגדרות", icon: Settings, match: (p: string) => p.startsWith("/settings") },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/new") return null;

  return (
    <nav
      aria-label="ניווט ראשי"
      className="glass-bar fixed inset-x-0 bottom-0 z-30 rounded-t-card pb-[env(safe-area-inset-bottom)] shadow-nav"
    >
      <ul className="mx-auto flex h-bottomnav w-full max-w-feed items-stretch">
        {ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={cn(
                  "motion-press flex h-full min-h-touch min-w-touch flex-col items-center justify-center gap-1 text-caption font-medium transition-colors duration-(--dur-fast)",
                  active ? "text-ink" : "text-muted-text"
                )}
              >
                <span className="relative flex h-8 w-14 items-center justify-center">
                  <span
                    aria-hidden
                    className={cn(
                      "bubble-ocean absolute inset-0 rounded-pill transition-[transform,opacity] duration-(--dur-slow) ease-(--ease-spring)",
                      active ? "scale-x-100 opacity-100" : "scale-x-40 opacity-0"
                    )}
                  />
                  <Icon
                    className={cn("relative size-5 transition-colors duration-(--dur-fast)", active && "text-white")}
                    aria-hidden
                  />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
        {/* Last DOM item = end side (left in RTL). Circle overlaps the bar's top edge. */}
        <li className="flex-1">
          <Link
            href="/new"
            prefetch
            aria-label="דיווח חדש"
            className="group flex h-full min-h-touch min-w-touch flex-col items-center justify-end gap-1 pb-2 text-caption font-medium text-ink"
          >
            <span className="bubble-ocean motion-press -mt-7 mb-auto flex size-14 items-center justify-center rounded-full text-white ring-4 ring-white/80 transition-transform duration-(--dur-base) ease-(--ease-spring)">
              <Plus className="size-7" aria-hidden />
            </span>
            דיווח
          </Link>
        </li>
      </ul>
    </nav>
  );
}
