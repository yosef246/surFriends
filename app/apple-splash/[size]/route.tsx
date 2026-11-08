import { ImageResponse } from "next/og";
import { ALLOWED_SPLASH_SIZES, AppleSplashArt, IPHONE_SCREENS, pixelSize } from "@/lib/apple-splash";

/** /apple-splash/1170x2532 etc.: iOS startup images, one per iPhone screen (see lib/apple-splash). */
export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  if (!ALLOWED_SPLASH_SIZES.has(size)) return new Response("Not found", { status: 404 });
  const screen = IPHONE_SCREENS.find((s) => pixelSize(s) === size)!;
  const [width, height] = size.split("x").map(Number);
  const res = new ImageResponse(<AppleSplashArt width={width} height={height} scale={screen.r} />, { width, height });
  res.headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  return res;
}
