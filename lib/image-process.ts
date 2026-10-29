import { MAX_IMAGE_BYTES } from "@/lib/reports";

export const IMAGE_READ_ERROR = "לא הצלחנו לקרוא את התמונה. נסו JPG או PNG";
export const IMAGE_TOO_BIG_ERROR = "התמונה לא מתאימה. אפשר JPG, PNG או WEBP עד 5MB";

const MAX_SIDE = 1600;
const QUALITY = 0.8;

export class ImageProcessError extends Error {}

type Decoded = { source: CanvasImageSource; width: number; height: number; close: () => void };

async function decode(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch {
      /* fall through to <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode(); // modern browsers apply EXIF orientation to <img> by default
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} };
  } catch {
    throw new ImageProcessError(IMAGE_READ_ERROR);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Decode (EXIF-aware), downscale to <=1600px longest side, re-encode JPEG ~0.8. */
export async function processImage(file: File): Promise<Blob> {
  if (file.type && !file.type.startsWith("image/")) throw new ImageProcessError(IMAGE_READ_ERROR);
  const d = await decode(file);
  try {
    if (!d.width || !d.height) throw new ImageProcessError(IMAGE_READ_ERROR);
    const scale = Math.min(1, MAX_SIDE / Math.max(d.width, d.height));
    const w = Math.max(1, Math.round(d.width * scale));
    const h = Math.max(1, Math.round(d.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ImageProcessError(IMAGE_READ_ERROR);
    ctx.fillStyle = "#fff"; // JPEG has no alpha; avoid a black background for PNG/WEBP
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(d.source, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", QUALITY));
    if (!blob) throw new ImageProcessError(IMAGE_READ_ERROR);
    if (blob.size > MAX_IMAGE_BYTES) throw new ImageProcessError(IMAGE_TOO_BIG_ERROR);
    return blob;
  } finally {
    d.close();
  }
}
