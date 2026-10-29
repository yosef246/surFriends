import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { beachPhotoSrc, creditLabel } from "@/lib/beach-photo";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  name: string;
  imagePath: string | null;
  imageCredit?: string | null;
  /** "חי" badge with a coral dot. */
  live?: boolean;
  /** Static star marker (feed slider). */
  favorite?: boolean;
  /** Width class: w-40 / w-44 in sliders, w-full in grids. */
  className?: string;
  /** Load eagerly (first tiles of a slider). */
  priority?: boolean;
  sizes?: string;
  /** Interactive control floating over the top-end corner (e.g. FavoriteToggle). Sits outside the link. */
  action?: ReactNode;
};

/** BeachPhotoTile (DESIGN_SYSTEM 5b): 4:5 photo, bottom gradient, name, live badge, tiny credit. */
export function BeachPhotoTile({
  href,
  name,
  imagePath,
  imageCredit,
  live = false,
  favorite = false,
  className,
  priority = false,
  sizes = "180px",
  action,
}: Props) {
  const src = beachPhotoSrc(imagePath);
  const credit = src ? creditLabel(imageCredit) : null;
  const label = [name, favorite ? "מועדף" : null, live ? "חי" : null].filter(Boolean).join(", ");
  return (
    <div className={cn("relative shrink-0", className)}>
      <Link href={href} aria-label={label} className="tile motion-press group block w-full">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className="object-cover"
          />
        ) : null}
        <span className="photo-overlay-tile" aria-hidden />
        {live ? (
          <span className="tile-badge absolute start-2 top-2" aria-hidden>
            <span className="size-1.5 rounded-full bg-coral" />
            חי
          </span>
        ) : null}
        {favorite ? (
          <Star
            aria-hidden
            className="absolute end-2 top-2 size-5 fill-white stroke-white drop-shadow"
            strokeWidth={1.75}
          />
        ) : null}
        <span className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-2.5 pb-5">
          <span className="tile-title line-clamp-2 text-start">{name}</span>
        </span>
        {credit ? <span className="credit max-w-[90%] truncate">{credit}</span> : null}
      </Link>
      {action ? <div className="absolute end-1 top-1">{action}</div> : null}
    </div>
  );
}
