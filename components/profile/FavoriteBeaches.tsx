"use client";

import { useState } from "react";
import { BeachPhotoTile } from "@/components/shared/BeachPhotoTile";
import { EmptyState } from "@/components/shared/EmptyState";
import { FavoriteToggle } from "@/components/shared/FavoriteToggle";
import type { FavoriteBeach } from "@/lib/profile-data";

/** Own favorites only (RLS keeps everyone else's private). Removing hides the tile at once; a failed call restores it. */
export function FavoriteBeaches({ beaches }: { beaches: FavoriteBeach[] }) {
  const [hidden, setHidden] = useState<ReadonlySet<number>>(new Set());
  const visible = beaches.filter((b) => !hidden.has(b.id));

  const setTileHidden = (id: number, isHidden: boolean) =>
    setHidden((h) => {
      const n = new Set(h);
      if (isHidden) n.add(id);
      else n.delete(id);
      return n;
    });

  return (
    <section aria-labelledby="favorites-heading" className="flex flex-col gap-3">
      <h2 id="favorites-heading" className="section-title">
        חופים מועדפים
      </h2>
      {visible.length === 0 ? (
        <EmptyState title="עוד אין חופים מועדפים" description="היכנסו לחוף ולחצו על ⭐" />
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {visible.map((b) => (
            <li key={b.id}>
              <BeachPhotoTile
                href={`/beach/${b.id}`}
                name={b.name}
                imagePath={b.imagePath}
                imageCredit={b.imageCredit}
                sizes="(max-width: 576px) 50vw, 280px"
                className="w-full"
                action={
                  <FavoriteToggle
                    beachId={b.id}
                    beachName={b.name}
                    initialFavorite
                    onChange={(on) => setTileHidden(b.id, !on)}
                  />
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
