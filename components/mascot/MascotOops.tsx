import { BLUE, INK, ORANGE, WHITE, SealHead, type MascotProps } from "./parts";

/** ימי, hands up, board snapped in two. For errors and offline. */
export function MascotOops({ size = 160, className }: MascotProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="ימי, כלב הים, נבהל, והלוח שלו נשבר"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* body */}
      <ellipse cx="100" cy="124" rx="44" ry="44" fill={BLUE} stroke={INK} strokeWidth="4" />
      <ellipse cx="100" cy="134" rx="27" ry="28" fill={WHITE} />
      {/* hands up */}
      <ellipse cx="54" cy="112" rx="10" ry="22" transform="rotate(-30 54 112)" fill={BLUE} stroke={INK} strokeWidth="4" />
      <ellipse cx="146" cy="112" rx="10" ry="22" transform="rotate(30 146 112)" fill={BLUE} stroke={INK} strokeWidth="4" />
      <SealHead eyes="worried" mouth="oh" dy={-16} />
      {/* sweat drop */}
      <path d="M158 36 C158 36 150 48 150 54 a8 8 0 0 0 16 0 C166 48 158 36 158 36Z" fill={WHITE} stroke={INK} strokeWidth="3" />
      {/* broken board */}
      <path
        d="M10 184 C26 166 62 160 96 166 L88 176 L98 184 L84 194 C54 198 28 196 10 184Z"
        fill={ORANGE}
        stroke={INK}
        strokeWidth="4"
      />
      <path
        d="M108 168 C140 160 172 166 190 184 C172 196 146 198 116 194 L104 186 L112 178Z"
        fill={ORANGE}
        stroke={INK}
        strokeWidth="4"
      />
      <path d="M30 182 H74 M132 182 H170" stroke={WHITE} strokeWidth="3.5" fill="none" />
    </svg>
  );
}
