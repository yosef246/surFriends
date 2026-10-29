import Link from "next/link";
import { Star, Waves } from "lucide-react";
import type { BeachCircleItem } from "@/lib/feed";

export function BeachCircleRow({ beaches }: { beaches: BeachCircleItem[] }) {
  if (beaches.length === 0) return null;
  return (
    <nav aria-label="חופים">
      <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pt-3 pb-3 [scrollbar-width:none]">
        {beaches.map((b, i) => (
          <li
            key={b.id}
            className="motion-pop-in w-18 shrink-0 snap-start"
            style={{ "--i": Math.min(i, 8) } as React.CSSProperties}
          >
            <Link
              href={`/beach/${b.id}`}
              aria-label={[b.name, b.favorite ? "מועדף" : null, b.live ? "חי" : null].filter(Boolean).join(", ")}
              className="motion-press motion-lift flex min-h-touch flex-col items-center gap-2"
            >
              <span className="glass-card relative flex size-16 items-center justify-center rounded-full text-ink ring-2 ring-signature">
                <Waves className="size-6" aria-hidden />
                {b.favorite ? (
                  <Star
                    aria-hidden
                    className="absolute -bottom-1 -end-1 size-5 fill-signature stroke-ink"
                    strokeWidth={1.75}
                  />
                ) : null}
                {b.live ? (
                  <span
                    aria-hidden
                    className="motion-pulse-ring absolute -top-1.5 -end-2 inline-flex h-[1.125rem] items-center gap-1 rounded-pill bg-live px-1.5 text-caption font-medium text-ink"
                  >
                    <span className="size-1.5 rounded-full bg-ink" />
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
