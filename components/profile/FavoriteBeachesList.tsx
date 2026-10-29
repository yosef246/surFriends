"use client";

import Link from "next/link";
import { useState } from "react";
import { Waves } from "lucide-react";
import { FavoriteToggle } from "@/components/shared/FavoriteToggle";
import { EmptyState } from "@/components/shared/EmptyState";
import type { FavoriteBeach } from "@/lib/profile-data";

/** Own favorites only (RLS keeps everyone else's private). Removing hides the row at once; a failed call restores it. */
export function FavoriteBeachesList({ beaches }: { beaches: FavoriteBeach[] }) {
  const [hidden, setHidden] = useState<ReadonlySet<number>>(new Set());
  const visible = beaches.filter((b) => !hidden.has(b.id));

  const setRowHidden = (id: number, isHidden: boolean) =>
    setHidden((h) => {
      const n = new Set(h);
      if (isHidden) n.add(id);
      else n.delete(id);
      return n;
    });

  return (
    <section aria-labelledby="favorites-heading" className="flex flex-col gap-3">
      <div>
        <p className="eyebrow">החופים שלי</p>
        <h2 id="favorites-heading" className="text-title heading-tight font-display font-normal text-ink">
          חופים מועדפים
        </h2>
      </div>
      {visible.length === 0 ? (
        <EmptyState title="עוד אין חופים מועדפים. היכנסו לחוף ולחצו על ⭐" />
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((b, i) => (
            <li
              key={b.id}
              className="glass-card motion-pop-in flex items-center gap-2 rounded-card ps-4 pe-2"
              style={{ "--i": Math.min(i, 8) } as React.CSSProperties}
            >
              <Link
                href={`/beach/${b.id}`}
                className="motion-press flex min-h-touch min-w-0 flex-1 items-center gap-3 py-3"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-signature-soft text-ink ring-2 ring-signature">
                  <Waves className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-body font-medium text-ink">{b.name}</span>
                  <span className="block truncate text-caption text-muted-text">{b.city}</span>
                </span>
              </Link>
              <FavoriteToggle
                beachId={b.id}
                beachName={b.name}
                initialFavorite
                onChange={(on) => setRowHidden(b.id, !on)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
