import { ImageResponse } from "next/og";
import { PwaIconArt } from "@/lib/pwa-icon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<PwaIconArt size={64} />, size);
}
