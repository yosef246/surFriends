import Link from "next/link";
import { Waves } from "lucide-react";
import type { BeachCircleItem } from "@/lib/feed";

export function BeachCircleRow({ beaches }: { beaches: BeachCircleItem[] }) {
  if (beaches.length === 0) return null;
  return (
    <nav aria-label="חופים">
      <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pt-2 pb-3 [scrollbar-width:none]">
        {beaches.map((b) => (
          <li key={b.id} className="w-18 shrink-0 snap-start">
            <Link
              href={`/beach/${b.id}`}
              aria-label={b.live ? `${b.name}, חי` : b.name}
              className="flex min-h-touch flex-col items-center gap-2"
            >
              <span className="relative flex size-16 items-center justify-center rounded-full bg-card text-ink shadow-card">
                <Waves className="size-6" aria-hidden />
                {b.live ? (
                  <span
                    aria-hidden
                    className="absolute -top-1.5 -end-2 inline-flex h-[1.125rem] items-center gap-1 rounded-pill bg-link-soft px-1.5 text-caption font-medium text-link-blue"
                  >
                    <span className="size-1.5 rounded-full bg-link-blue animate-live-pulse" />
                    חי
                  </span>
                ) : null}
              </span>
              <span className="w-full truncate text-center text-caption font-medium text-copy">
                {b.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
