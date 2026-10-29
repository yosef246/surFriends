import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { beachPhotoSrc, creditLabel } from "@/lib/beach-photo";
import { cn } from "@/lib/utils";

type Props = {
  /** Local /beaches/*.jpg path. Null or invalid = brand gradient. */
  imagePath: string | null;
  imageCredit?: string | null;
  /** First hero on the page: loads eagerly (LCP). */
  priority?: boolean;
  /** Coral meta line over the photo. */
  eyebrow?: ReactNode;
  /** Headline (white, display font). Pass an element to control the heading level. */
  title: ReactNode;
  /** Sub-line / actions under the title. */
  children?: ReactNode;
  /** Controls floating over the top of the photo (back link, favorite star). */
  topStart?: ReactNode;
  topEnd?: ReactNode;
  label?: string;
  className?: string;
};

/** PhotoHero (DESIGN_SYSTEM 5a): photo + bottom gradient + white headline + tiny credit linking to /credits. */
export function PhotoHero({
  imagePath,
  imageCredit,
  priority = false,
  eyebrow,
  title,
  children,
  topStart,
  topEnd,
  label,
  className,
}: Props) {
  const src = beachPhotoSrc(imagePath);
  const credit = src ? creditLabel(imageCredit) : null;
  return (
    <section aria-label={label} className={cn("hero-photo rounded-card", className)}>
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 576px) 100vw, 576px"
          className="object-cover"
        />
      ) : null}
      <div className="photo-overlay" aria-hidden />
      {topStart || topEnd ? (
        <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
          <div>{topStart}</div>
          <div>{topEnd}</div>
        </div>
      ) : null}
      <div className="relative z-10 flex flex-col items-start gap-1.5 pb-3">
        {eyebrow ? <div className="eyebrow eyebrow-light">{eyebrow}</div> : null}
        <div className="text-display font-display font-normal text-balance text-white drop-shadow sm:text-hero">{title}</div>
        {children}
      </div>
      {credit ? (
        <Link href="/credits" className="credit pointer-events-auto max-w-[70%] truncate">
          {credit}
        </Link>
      ) : null}
    </section>
  );
}
