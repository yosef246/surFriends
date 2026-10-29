import { BeachPhotoTile } from "@/components/shared/BeachPhotoTile";
import type { BeachCircleItem } from "@/lib/feed";

/** Horizontal snap row of beach photo tiles (favorites first when the user has any). */
export function BeachSlider({ beaches }: { beaches: BeachCircleItem[] }) {
  if (beaches.length === 0) return null;
  return (
    <section aria-labelledby="beaches-heading" className="flex flex-col gap-3">
      <h2 id="beaches-heading" className="section-title">
        החופים
      </h2>
      <nav aria-labelledby="beaches-heading">
        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {beaches.map((b, i) => (
            <li key={b.id} className="snap-start">
              <BeachPhotoTile
                href={`/beach/${b.id}`}
                name={b.name}
                imagePath={b.imagePath}
                imageCredit={b.imageCredit}
                live={b.live}
                favorite={b.favorite}
                priority={i < 2}
                sizes="176px"
                className="w-44"
              />
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
