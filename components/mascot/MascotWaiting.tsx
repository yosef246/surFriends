import { AQUA, Arm, Hand, INK, SHIRT, SHORTS, SKIN, SKIN_SHADE, TURQ, WHITE, Frame, SurferHead, type MascotProps } from "./parts";

/** גל sits on his board on a flat sea, chin on hand, "..." bubble. For empty states. */
export function MascotWaiting({ size = 160, className }: MascotProps) {
  return (
    <Frame size={size} className={className} label="גל הגולש יושב על הלוח וממתין לגלים">
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
      {/* torso seated */}
      <ellipse cx="100" cy="108" rx="10" ry="7" fill={SKIN} stroke={INK} strokeWidth="3.5" />
      <path d="M80 109 Q100 117 120 109 L126 150 Q100 158 74 150 Z" fill={SHIRT} stroke={INK} strokeWidth="3.5" />
      <path d="M77 132 Q100 139 123 132" stroke={TURQ} strokeWidth="4.5" fill="none" />
      <path d="M74 146 Q100 154 126 146 L128 158 Q100 166 72 158 Z" fill={SHORTS} stroke={INK} strokeWidth="3.5" />
      {/* arm on knee + chin-on-hand arm */}
      <Arm d="M80 114 Q68 130 82 146" />
      <Hand cx={83} cy={147} />
      <Arm d="M120 114 Q140 124 122 104" />
      <Hand cx={114} cy={102} />
      <SurferHead mouth="smile" />
      {/* "..." thought bubble */}
      <circle cx="140" cy="54" r="3" fill={WHITE} stroke={INK} strokeWidth="2.5" />
      <circle cx="146" cy="46" r="4.5" fill={WHITE} stroke={INK} strokeWidth="2.5" />
      <rect x="146" y="12" width="46" height="26" rx="13" fill={WHITE} stroke={INK} strokeWidth="3.5" />
      <g fill={TURQ} stroke={INK} strokeWidth="1.5">
        <circle cx="159" cy="25" r="3.2" />
        <circle cx="169" cy="25" r="3.2" />
        <circle cx="179" cy="25" r="3.2" />
      </g>
    </Frame>
  );
}
