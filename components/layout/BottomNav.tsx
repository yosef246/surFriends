"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, User } from "lucide-react";
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
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex h-bottomnav w-full max-w-feed items-stretch">
        {ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full min-h-touch min-w-touch flex-col items-center justify-center gap-1 text-caption",
                  active ? "font-bold text-sea-deep" : "font-medium text-mist-text"
                )}
              >
                {active ? (
                  <span aria-hidden className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-sea-wave" />
                ) : null}
                <Icon className={cn("size-5", active && "fill-sea-wave/30")} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
