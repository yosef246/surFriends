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
      className="fixed inset-x-0 bottom-0 z-30 rounded-t-card bg-card pb-[env(safe-area-inset-bottom)] shadow-nav"
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
                  "flex h-full min-h-touch min-w-touch flex-col items-center justify-center gap-1 text-caption font-medium",
                  active ? "text-ink" : "text-muted-text"
                )}
              >
                <Icon className={cn("size-5", active && "fill-ink/10")} aria-hidden />
                <span className="flex flex-col items-center gap-0.5">
                  {label}
                  <span
                    aria-hidden
                    className={cn("size-1 rounded-full", active ? "bg-signature" : "bg-transparent")}
                  />
                </span>
              </Link>
            </li>
          );
        })}
        {/* Last DOM item = end side (left in RTL). Circle overlaps the bar's top edge. */}
        <li className="flex-1">
          <Link
            href="/new"
            aria-label="דיווח חדש"
            className="group flex h-full min-h-touch min-w-touch flex-col items-center justify-end gap-1 pb-2 text-caption font-medium text-ink"
          >
            <span className="-mt-7 mb-auto flex size-14 items-center justify-center rounded-full bg-signature text-ink shadow-raised ring-4 ring-card transition-[transform,background-color] duration-(--dur-fast) ease-(--ease-press) group-hover:bg-signature-hover group-active:scale-[0.94] group-active:bg-signature-pressed">
              <Plus className="size-7" aria-hidden />
            </span>
            דיווח
          </Link>
        </li>
      </ul>
    </nav>
  );
}
