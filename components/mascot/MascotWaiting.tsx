import { BLUE, INK, ORANGE, WHITE, SealHead, type MascotProps } from "./parts";

/** ימי sits on his board, staring at a flat sea. For empty states. */
export function MascotWaiting({ size = 160, className }: MascotProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="ימי, כלב הים, יושב על הלוח ומחכה לגלים"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* waiting dots */}
      <g fill={INK}>
        <circle cx="152" cy="30" r="3.5" />
        <circle cx="164" cy="30" r="3.5" />
        <circle cx="176" cy="30" r="3.5" />
      </g>
      {/* body, sitting */}
      <ellipse cx="100" cy="122" rx="42" ry="42" fill={BLUE} stroke={INK} strokeWidth="4" />
      <ellipse cx="100" cy="130" rx="26" ry="28" fill={WHITE} />
      {/* flippers resting */}
      <ellipse cx="60" cy="132" rx="10" ry="20" transform="rotate(20 60 132)" fill={BLUE} stroke={INK} strokeWidth="4" />
      <ellipse cx="140" cy="132" rx="10" ry="20" transform="rotate(-20 140 132)" fill={BLUE} stroke={INK} strokeWidth="4" />
      <SealHead eyes="look" mouth="flat" dy={-16} />
      {/* board in front of the lower body */}
      <path
        d="M10 160 C50 146 150 146 190 160 C150 174 50 174 10 160Z"
        fill={ORANGE}
        stroke={INK}
        strokeWidth="4"
      />
      <path d="M44 160 H156" stroke={WHITE} strokeWidth="4" fill="none" />
      {/* flat sea */}
      <path d="M6 184 Q28 180 50 184 T94 184 T138 184 T194 184" stroke={BLUE} strokeWidth="5" fill="none" />
      <path d="M26 196 Q48 192 70 196 T114 196 T158 196" stroke={BLUE} strokeWidth="5" fill="none" opacity=".55" />
    </svg>
  );
}
