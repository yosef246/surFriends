"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Settings, User } from "lucide-react";
import { useDaylight } from "@/components/night/DaylightProvider";
import { NightReportSheet } from "@/components/night/NightReportSheet";

// DOM order = RTL order: first item on the right.
const ITEMS = [
  { href: "/", label: "פיד", icon: Home, match: (p: string) => p === "/" || p.startsWith("/beach/") },
  { href: "/profile", label: "פרופיל", icon: User, match: (p: string) => p.startsWith("/profile") },
  { href: "/settings", label: "הגדרות", icon: Settings, match: (p: string) => p.startsWith("/settings") },
] as const;

/** Bottom nav (DESIGN_SYSTEM 5h): white bar + hairline, 4 equal items, brand blue when active, raised report button at the end side. */
export function BottomNav() {
  const pathname = usePathname();
  const { isNight } = useDaylight();
  const [sheetOpen, setSheetOpen] = useState(false);
  if (pathname === "/new") return null;

  return (
    <nav
      aria-label="ניווט ראשי"
      className="bar-coast fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)]"
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
                className="nav-item motion-press h-full min-w-touch transition-colors duration-(--dur-fast)"
              >
                <Icon className="size-6" strokeWidth={active ? 2.5 : 2} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
        {/* Last DOM item = end side (left in RTL). Raised circle overlaps the bar's top edge. */}
        <li className="flex-1">
          {isNight ? (
            // Night: the button stays, but opens a friendly "closed until sunrise" sheet instead of navigating.
            <button
              type="button"
              aria-label="דיווח חדש (סגור בלילה)"
              aria-haspopup="dialog"
              onClick={() => setSheetOpen(true)}
              className="nav-item motion-press h-full w-full min-w-touch justify-end pb-2 text-ink!"
            >
              <span className="bubble-ocean-raised -mt-7 mb-auto flex size-14 items-center justify-center rounded-full opacity-70 ring-4 ring-white">
                <Plus className="size-7" aria-hidden />
              </span>
              דיווח
            </button>
          ) : (
            <Link
              href="/new"
              prefetch
              aria-label="דיווח חדש"
              className="nav-item motion-press h-full min-w-touch justify-end pb-2 text-ink!"
            >
              <span className="bubble-ocean-raised -mt-7 mb-auto flex size-14 items-center justify-center rounded-full ring-4 ring-white">
                <Plus className="size-7" aria-hidden />
              </span>
              דיווח
            </Link>
          )}
        </li>
      </ul>
      {sheetOpen && isNight ? <NightReportSheet onClose={() => setSheetOpen(false)} /> : null}
    </nav>
  );
}
