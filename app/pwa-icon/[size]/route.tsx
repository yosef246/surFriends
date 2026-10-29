import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { PwaIconArt } from "@/lib/pwa-icon";

const SIZES = new Set([96, 180, 192, 512]);

/** /pwa-icon/192, /pwa-icon/512 (manifest + notifications), /pwa-icon/96?badge=1 (monochrome notification badge). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const { size: raw } = await params;
  const size = Number(raw);
  if (!SIZES.has(size)) return new Response("Not found", { status: 404 });
  const badge = request.nextUrl.searchParams.get("badge") === "1";
  const res = new ImageResponse(<PwaIconArt size={size} badge={badge} />, { width: size, height: size });
  res.headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  return res;
}
