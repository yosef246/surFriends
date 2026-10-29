"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

// DOM order = RTL order: first item on the right.
const ITEMS = [
  { href: "/", label: "פיד", icon: Home, accent: false, match: (p: string) => p === "/" || p.startsWith("/beach/") },
  { href: "/new", label: "דיווח", icon: PlusCircle, accent: true, match: (p: string) => p.startsWith("/new") },
  { href: "/profile", label: "פרופיל", icon: User, accent: false, match: (p: string) => p.startsWith("/profile") },
  { href: "/settings", label: "הגדרות", icon: Settings, accent: false, match: (p: string) => p.startsWith("/settings") },
] as const;

/** Bottom nav (DESIGN_SYSTEM 5h): white bar + hairline, 4 equal items, brand blue when active, no raised FAB. */
export function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/new") return null;

  return (
    <nav
      aria-label="ניווט ראשי"
      className="bar-coast fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex h-bottomnav w-full max-w-feed items-stretch">
        {ITEMS.map(({ href, label, icon: Icon, accent, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={cn(
                  "nav-item motion-press h-full min-w-touch transition-colors duration-(--dur-fast)",
                  accent && "text-brand!"
                )}
              >
                <Icon className="size-6" strokeWidth={active ? 2.5 : 2} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
