// Beach photos live in /public/beaches (CC licensed, credits in public/beaches/CREDITS.md).

export type BeachPhoto = { path: string; credit: string | null };

/** Only local /beaches/*.jpg paths are rendered through next/image. Anything else falls back to the brand gradient. */
export function beachPhotoSrc(path: string | null | undefined): string | null {
  return typeof path === "string" && /^\/beaches\/[a-z0-9-]+\.(jpe?g|webp|png)$/i.test(path) ? path : null;
}

export const creditLabel = (credit: string | null | undefined) => (credit ? `© ${credit} · CC` : null);
