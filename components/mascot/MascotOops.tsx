import { AQUA, Arm, Hand, INK, StandingLegs, SurferHead, TURQ, Torso, WHITE, Frame, type MascotProps } from "./parts";

/** גל wipes out: shades slipping down his nose, sweat drop, snapped board. For errors/offline. */
export function MascotOops({ size = 160, className }: MascotProps) {
  return (
    <Frame size={size} className={className} label="אופס, גל הגולש הופתע והלוח נשבר">
      {/* snapped board halves */}
      <g transform="translate(40 168) rotate(-18)">
        <path d="M-36 0 C-24 -13 8 -13 20 -7 L12 -3 L21 2 L11 5 L17 10 C4 13 -24 12 -36 0Z" fill={WHITE} stroke={INK} strokeWidth="3.5" />
        <path d="M-30 0 H4" stroke={TURQ} strokeWidth="4" fill="none" />
      </g>
      <g transform="translate(160 170) rotate(22) scale(-1 1)">
        <path d="M-34 0 C-22 -12 6 -12 18 -6 L10 -2 L19 3 L9 6 L15 10 C2 12 -22 11 -34 0Z" fill={WHITE} stroke={INK} strokeWidth="3.5" />
        <path d="M-28 0 H2" stroke={TURQ} strokeWidth="4" fill="none" />
      </g>
      <StandingLegs />
      <Torso />
      {/* both arms up in surprise */}
      <Arm d="M80 113 Q62 112 56 94" />
      <Hand cx={55} cy={90} r={7} />
      <Arm d="M120 113 Q138 112 144 94" />
      <Hand cx={145} cy={90} r={7} />
      <SurferHead shades="slipped" mouth="oh" />
      {/* sweat drop */}
      <path d="M150 38 q9 11 0 18 q-9 -7 0 -18Z" fill={AQUA} stroke={INK} strokeWidth="3" />
      <path d="M24 56 l6 6 M36 48 l2 8 M16 70 l8 2" stroke={INK} strokeWidth="3" fill="none" />
    </Frame>
  );
}
