import { Arm, Hand, INK, SKIN, SKIN_SHADE, TURQ, AQUA, WHITE, SurferHead, Torso, type MascotProps } from "./parts";

/** Crouched leg: ink outline under a skin stroke, hip -> knee -> foot. */
function Leg({ d }: { d: string }) {
  return (
    <g fill="none">
      <path d={d} stroke={INK} strokeWidth="15" />
      <path d={d} stroke={SKIN} strokeWidth="8" />
    </g>
  );
}

/**
 * גל riding: crouched on a horizontal board, arms out for balance. viewBox 200x220 (the board sits at the
 * bottom edge, so the loader can put it right on a wave). Plain SVG: also rendered by next/og for the
 * iOS startup image.
 */
export function MascotSurf({ size = 160, className }: MascotProps) {
  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={(size * 220) / 200}
      className={className}
      role="img"
      aria-label="גל, הגולש של surFriends, רוכב על גל"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* board */}
      <path
        d="M10 203 Q100 190 192 199 Q200 205 189 210 Q100 218 18 211 Q4 208 10 203Z"
        fill={WHITE}
        stroke={INK}
        strokeWidth="3.5"
      />
      <path d="M30 205 Q100 198 172 203" stroke={TURQ} strokeWidth="5" fill="none" />
      {/* legs + feet */}
      <Leg d="M88 170 L74 184 L70 197" />
      <Leg d="M112 170 L128 182 L134 197" />
      <ellipse cx="68" cy="199" rx="11" ry="5" fill={SKIN_SHADE} stroke={INK} strokeWidth="3.5" />
      <ellipse cx="136" cy="199" rx="11" ry="5" fill={SKIN_SHADE} stroke={INK} strokeWidth="3.5" />
      <Torso />
      {/* arms out for balance */}
      <Arm d="M80 114 Q60 110 40 100" />
      <Hand cx={38} cy={99} />
      <Arm d="M120 114 Q140 124 162 126" />
      <Hand cx={164} cy={126} />
      <SurferHead mouth="grin" />
      {/* spray behind the tail */}
      <path d="M190 186 q6 -6 4 -14 M182 182 q4 -5 2 -10" stroke={AQUA} strokeWidth="3" fill="none" />
    </svg>
  );
}
