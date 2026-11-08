// iOS startup images ("apple-touch-startup-image"): what an installed PWA shows while the first page loads,
// instead of a blank black/white screen. It mirrors the first frame of the in-app splash (deep ocean, גל on a
// wave, centred) so the hand-off to the animated splash is seamless. iOS only uses an image whose size matches
// the device exactly, hence one entry per iPhone screen (portrait).

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { MascotSurf } from "@/components/mascot/MascotSurf";

/** next/og (satori) accepts only intrinsic elements inside <svg>: expand the mascot's function components. */
function flatten(node: ReactNode): ReactNode {
  if (!isValidElement(node)) return node;
  const el = node as ReactElement<{ children?: ReactNode }>;
  if (typeof el.type === "function") return flatten((el.type as (p: unknown) => ReactNode)(el.props));
  const kids = el.props.children;
  return kids === undefined ? el : cloneElement(el, undefined, ...Children.toArray(kids).map(flatten));
}

/** CSS points width x height, device pixel ratio. */
export const IPHONE_SCREENS = [
  { w: 440, h: 956, r: 3 }, // 16/17 Pro Max
  { w: 430, h: 932, r: 3 }, // 14/15 Pro Max, 15/16 Plus
  { w: 428, h: 926, r: 3 }, // 12/13 Pro Max, 14 Plus
  { w: 402, h: 874, r: 3 }, // 16/17 Pro, 17
  { w: 393, h: 852, r: 3 }, // 14 Pro, 15, 15 Pro, 16
  { w: 390, h: 844, r: 3 }, // 12, 13, 14, 12/13 Pro
  { w: 414, h: 896, r: 3 }, // XS Max, 11 Pro Max
  { w: 414, h: 896, r: 2 }, // XR, 11
  { w: 375, h: 812, r: 3 }, // X, XS, 11 Pro, 12/13 mini
  { w: 414, h: 736, r: 3 }, // 6/7/8 Plus
  { w: 375, h: 667, r: 2 }, // SE 2/3, 6/7/8
] as const;

export const pixelSize = (s: { w: number; h: number; r: number }) => `${s.w * s.r}x${s.h * s.r}`;
export const ALLOWED_SPLASH_SIZES = new Set(IPHONE_SCREENS.map(pixelSize));

export function startupImages() {
  return IPHONE_SCREENS.map((s) => ({
    url: `/apple-splash/${pixelSize(s)}`,
    media: `(device-width: ${s.w}px) and (device-height: ${s.h}px) and (-webkit-device-pixel-ratio: ${s.r}) and (orientation: portrait)`,
  }));
}

const WAVE = "M0 40 Q150 0 300 40 T600 40 T900 40 T1200 40 T1500 40 T1800 40 T2100 40 T2400 40 V100 H0 Z";

/** Edge-faded wave (one period), like the in-app loader's masked band. */
function WaveBand({ width, height, opacity, id }: { width: number; height: number; opacity: number; id: string }) {
  return (
    <svg width={width} height={height} viewBox="0 0 1200 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" x2="1200" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.18" stopColor="#fff" stopOpacity={opacity} />
          <stop offset="0.82" stopColor="#fff" stopOpacity={opacity} />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={WAVE} fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * Startup image art at device pixels; `scale` = device pixel ratio so sizes match the CSS loader
 * (240x176 box, rider 32pt above the band). The bottom padding lifts the loader to where it sits in the
 * splash, above the wordmark.
 */
export function AppleSplashArt({ width, height, scale }: { width: number; height: number; scale: number }) {
  const u = (n: number) => n * scale;
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: u(154),
        background: "#0a3d73",
      }}
    >
      <div style={{ display: "flex", position: "relative", width: u(240), height: u(176) }}>
        <div style={{ display: "flex", position: "absolute", left: 0, bottom: u(8) }}>
          <WaveBand width={u(240)} height={u(48)} opacity={0.35} id="back" />
        </div>
        <div style={{ display: "flex", position: "absolute", left: 0, bottom: 0 }}>
          <WaveBand width={u(240)} height={u(40)} opacity={0.8} id="front" />
        </div>
        <div style={{ display: "flex", position: "absolute", left: u(54), bottom: u(32) }}>
          {flatten(<MascotSurf size={u(132)} />)}
        </div>
      </div>
    </div>
  );
}
