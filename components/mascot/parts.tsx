/* Shared pieces for "גל" (Gal), the surfer mascot. Flat fills, 3.5px ink outline, viewBox 200x200.
   Head centred on x=100, y=68. */

import type { ReactNode } from "react";

export const INK = "#062B4A";
export const SKIN = "#EDAA77";
export const SKIN_SHADE = "#D88F5C";
export const HAIR = "#F7DC8E";
export const HAIR_SHADE = "#E2B952";
export const LENS = "#0F3556";
export const SHIRT = "#0B6C9E";
export const SHORTS = "#06335C";
export const TURQ = "#1CC8DA";
export const AQUA = "#8FE3EE";
export const WHITE = "#FFFFFF";

export type MascotProps = {
  /** Rendered width/height in px. Designed for 96-220. */
  size?: number;
  className?: string;
};

/** Root <svg> wrapper so every pose shares viewBox + stroke defaults. */
export function Frame({
  size,
  className,
  label,
  children,
}: MascotProps & { label: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={label}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** Outlined limb: ink stroke under a skin stroke. */
export function Arm({ d }: { d: string }) {
  return (
    <g fill="none">
      <path d={d} stroke={INK} strokeWidth="13" />
      <path d={d} stroke={SKIN} strokeWidth="6.5" />
    </g>
  );
}

export function Hand({ cx, cy, r = 6.5 }: { cx: number; cy: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill={SKIN} stroke={INK} strokeWidth="3" />;
}

/** Vertical surfboard drawn around (0,0), 140 tall. Place with a transform. */
export function Board() {
  return (
    <g>
      <path d="M0 -70 C24 -46 24 46 0 70 C-24 46 -24 -46 0 -70Z" fill={WHITE} stroke={INK} strokeWidth="3.5" />
      <path d="M0 -54 V54" stroke={TURQ} strokeWidth="7" fill="none" />
      <path d="M-8 -10 Q0 -6 8 -10" stroke={AQUA} strokeWidth="3" fill="none" />
    </g>
  );
}

/** Neck + rash guard + board shorts. Standing. */
export function Torso() {
  return (
    <g>
      <ellipse cx="100" cy="108" rx="10" ry="7" fill={SKIN} stroke={INK} strokeWidth="3.5" />
      <path d="M80 109 Q100 117 120 109 L127 152 Q100 160 73 152 Z" fill={SHIRT} stroke={INK} strokeWidth="3.5" />
      <path d="M76 132 Q100 139 124 132" stroke={TURQ} strokeWidth="4.5" fill="none" />
      <path d="M86 112 Q100 122 114 112" stroke={TURQ} strokeWidth="3" fill="none" />
      <path d="M73 150 Q100 158 127 150 L131 174 L104 174 L100 166 L96 174 L69 174 Z" fill={SHORTS} stroke={INK} strokeWidth="3.5" />
      <path d="M71 168 H95 M105 168 H129" stroke={TURQ} strokeWidth="3" fill="none" />
    </g>
  );
}

export function StandingLegs() {
  return (
    <g>
      <rect x="79" y="172" width="15" height="17" rx="6" fill={SKIN} stroke={INK} strokeWidth="3.5" />
      <rect x="106" y="172" width="15" height="17" rx="6" fill={SKIN} stroke={INK} strokeWidth="3.5" />
      <ellipse cx="85" cy="191" rx="11" ry="5" fill={SKIN_SHADE} stroke={INK} strokeWidth="3.5" />
      <ellipse cx="115" cy="191" rx="11" ry="5" fill={SKIN_SHADE} stroke={INK} strokeWidth="3.5" />
    </g>
  );
}

type Mouth = "grin" | "smile" | "oh";

/** Head with messy sun-bleached hair + sunglasses.
    shades="slipped": glasses slid down the nose, eyes visible above them. */
export function SurferHead({
  shades = "on",
  mouth = "grin",
}: {
  shades?: "on" | "slipped";
  mouth?: Mouth;
}) {
  const slipped = shades === "slipped";
  const ly = slipped ? 74 : 61; // lens top
  return (
    <g>
      {/* ears + head */}
      <ellipse cx="62" cy="72" rx="5" ry="7" fill={SKIN_SHADE} stroke={INK} strokeWidth="3.5" />
      <ellipse cx="138" cy="72" rx="5" ry="7" fill={SKIN_SHADE} stroke={INK} strokeWidth="3.5" />
      <ellipse cx="100" cy="68" rx="38" ry="35" fill={SKIN} stroke={INK} strokeWidth="3.5" />
      <ellipse cx="73" cy="88" rx="6" ry="3.5" fill="#F28B6B" opacity=".5" />
      <ellipse cx="127" cy="88" rx="6" ry="3.5" fill="#F28B6B" opacity=".5" />

      {/* wide open eyes (only when the shades slipped) */}
      {slipped && (
        <g>
          <circle cx="83" cy="63" r="7" fill={WHITE} stroke={INK} strokeWidth="3" />
          <circle cx="117" cy="63" r="7" fill={WHITE} stroke={INK} strokeWidth="3" />
          <circle cx="84" cy="65" r="2.6" fill={INK} />
          <circle cx="116" cy="65" r="2.6" fill={INK} />
        </g>
      )}

      {/* hair: tufts first, then the fringe */}
      <path d="M86 33 C80 18 92 10 100 17 C102 8 114 10 114 20 C120 22 118 30 112 34Z" fill={HAIR} stroke={INK} strokeWidth="3.5" />
      <path d="M70 38 C58 30 62 20 74 25" fill={HAIR} stroke={INK} strokeWidth="3.5" />
      <path d="M61 66 C56 42 74 28 100 28 C126 28 144 42 139 66 C136 56 132 50 124 49 L118 56 L110 47 L102 57 L94 47 L86 56 L78 49 C70 52 64 58 61 66Z" fill={HAIR} stroke={INK} strokeWidth="3.5" />
      <path d="M92 36 L89 44 M108 36 L112 44 M76 36 L74 42" stroke={HAIR_SHADE} strokeWidth="2.5" fill="none" />

      {/* nose */}
      {!slipped && <path d="M100 78 q-4 6 1 8" stroke={SKIN_SHADE} strokeWidth="2.8" fill="none" />}

      {/* sunglasses */}
      <g>
        <path d={`M70 ${ly + 5} L62 ${ly + 3} M130 ${ly + 5} L138 ${ly + 3}`} stroke={INK} strokeWidth="3.5" fill="none" />
        <rect x="70" y={ly} width="26" height="17" rx="7" fill={LENS} stroke={INK} strokeWidth="3.5" />
        <rect x="104" y={ly} width="26" height="17" rx="7" fill={LENS} stroke={INK} strokeWidth="3.5" />
        <path d={`M96 ${ly + 6} H104`} stroke={INK} strokeWidth="3.5" fill="none" />
        <path d={`M76 ${ly + 8} L82 ${ly + 3}`} stroke={WHITE} strokeWidth="3" fill="none" />
        <path d={`M110 ${ly + 8} L116 ${ly + 3}`} stroke={WHITE} strokeWidth="3" fill="none" />
        <path d={`M79 ${ly + 13} H90 M113 ${ly + 13} H124`} stroke={TURQ} strokeWidth="2.5" opacity=".7" fill="none" />
      </g>

      {/* mouth */}
      {mouth === "grin" && (
        <g>
          <path d="M85 89 Q100 106 115 89 Z" fill="#7A2230" stroke={INK} strokeWidth="3" />
          <path d="M88 90.5 H112 Q110 95.5 100 95.5 Q90 95.5 88 90.5Z" fill={WHITE} />
        </g>
      )}
      {mouth === "smile" && <path d="M90 91 Q100 98 110 91" stroke={INK} strokeWidth="3.5" fill="none" />}
      {mouth === "oh" && <ellipse cx="100" cy="97" rx="4.5" ry="4" fill="#7A2230" stroke={INK} strokeWidth="3" />}
    </g>
  );
}
