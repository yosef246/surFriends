import { AQUA, Arm, Hand, INK, SHIRT, SHORTS, SKIN, SKIN_SHADE, TURQ, WHITE, Frame, SurferHead, type MascotProps } from "./parts";

/** Floating "Z" glyph (path, no font dependency). `.mascot-zzz` animates it with transform + opacity only. */
function Z({ x, y, s, i }: { x: number; y: number; s: number; i: number }) {
  return (
    <g className="mascot-zzz" style={{ ["--i" as string]: i }}>
      <path
        d={`M${x} ${y} H${x + s} L${x} ${y + s} H${x + s}`}
        fill="none"
        stroke={INK}
        strokeWidth={s > 12 ? 4.5 : 3.5}
        opacity=".9"
      />
      <path d={`M${x} ${y} H${x + s} L${x} ${y + s} H${x + s}`} fill="none" stroke={WHITE} strokeWidth={s > 12 ? 1.8 : 1.4} />
    </g>
  );
}

/** גל asleep: sits on his board, sunglasses pushed up, eyes closed, head drooping, floating "Z z z". For the night screen. */
export function MascotSleeping({ size = 160, className }: MascotProps) {
  return (
    <Frame size={size} className={className} label="גל ישן">
      {/* flat sea */}
      <ellipse cx="100" cy="180" rx="92" ry="13" fill={AQUA} stroke={INK} strokeWidth="3.5" />
      <path d="M40 180 q8 -4 16 0 M120 182 q8 -4 16 0 M84 176 q6 -3 12 0" stroke={INK} strokeWidth="2.5" fill="none" opacity=".5" />
      {/* board lying flat */}
      <path d="M14 162 C40 150 160 150 186 162 C160 174 40 174 14 162Z" fill={WHITE} stroke={INK} strokeWidth="3.5" />
      <path d="M30 162 H170" stroke={TURQ} strokeWidth="6" fill="none" />
      {/* legs dangling over the front */}
      <Arm d="M84 150 Q78 166 84 176" />
      <Arm d="M116 150 Q122 166 116 176" />
      <ellipse cx="84" cy="179" rx="9" ry="4" fill={SKIN_SHADE} stroke={INK} strokeWidth="3" />
      <ellipse cx="116" cy="179" rx="9" ry="4" fill={SKIN_SHADE} stroke={INK} strokeWidth="3" />
      {/* torso, slumped forward a little */}
      <ellipse cx="100" cy="108" rx="10" ry="7" fill={SKIN} stroke={INK} strokeWidth="3.5" />
      <path d="M80 109 Q100 117 120 109 L126 150 Q100 158 74 150 Z" fill={SHIRT} stroke={INK} strokeWidth="3.5" />
      <path d="M77 132 Q100 139 123 132" stroke={TURQ} strokeWidth="4.5" fill="none" />
      <path d="M74 146 Q100 154 126 146 L128 158 Q100 166 72 158 Z" fill={SHORTS} stroke={INK} strokeWidth="3.5" />
      {/* both arms hang onto the knees */}
      <Arm d="M80 114 Q68 130 82 146" />
      <Hand cx={83} cy={147} />
      <Arm d="M120 114 Q132 130 118 146" />
      <Hand cx={117} cy={147} />
      {/* head tilted, shades up on the hair, eyes shut */}
      <g transform="rotate(9 100 104)">
        <SurferHead shades="up" eyes="closed" mouth="smile" />
      </g>
      {/* Z z z */}
      <Z x={150} y={54} s={9} i={0} />
      <Z x={159} y={34} s={13} i={1} />
      <Z x={170} y={10} s={17} i={2} />
    </Frame>
  );
}
