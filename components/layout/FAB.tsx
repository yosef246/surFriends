"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

/** Feed-only for now (Day 4). The beach page gets it together with its real content. */
export function FAB() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <Link
      href="/new"
      aria-label="דיווח חדש"
      className="fixed end-4 bottom-[calc(var(--spacing-bottomnav)+env(safe-area-inset-bottom)+1rem)] z-30 flex size-14 items-center justify-center rounded-full bg-sea-wave text-sea-deep shadow-fab transition-transform duration-(--dur-fast) ease-(--ease-press) active:scale-95"
    >
      <Plus className="size-6" aria-hidden />
    </Link>
  );
}
