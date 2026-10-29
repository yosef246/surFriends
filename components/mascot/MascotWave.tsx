import { BLUE, INK, ORANGE, WHITE, SealHead, type MascotProps } from "./parts";

/** ימי waves hello, holding his board. For login and the hero card. */
export function MascotWave({ size = 160, className }: MascotProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="ימי, כלב הים של surFriends, מנופף לשלום"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* board, behind everything */}
      <g transform="translate(46 125) rotate(14)">
        <path
          d="M0 -62 C20 -40 20 40 0 62 C-20 40 -20 -40 0 -62Z"
          fill={ORANGE}
          stroke={INK}
          strokeWidth="4"
        />
        <path d="M0 -46 V46" stroke={WHITE} strokeWidth="4" fill="none" />
      </g>
      {/* tail flippers */}
      <ellipse cx="80" cy="190" rx="16" ry="7" transform="rotate(-10 80 190)" fill={BLUE} stroke={INK} strokeWidth="4" />
      <ellipse cx="120" cy="190" rx="16" ry="7" transform="rotate(10 120 190)" fill={BLUE} stroke={INK} strokeWidth="4" />
      {/* body */}
      <ellipse cx="100" cy="140" rx="46" ry="48" fill={BLUE} stroke={INK} strokeWidth="4" />
      <ellipse cx="100" cy="150" rx="28" ry="32" fill={WHITE} />
      {/* flipper holding the board */}
      <ellipse cx="56" cy="138" rx="11" ry="22" transform="rotate(25 56 138)" fill={BLUE} stroke={INK} strokeWidth="4" />
      {/* waving flipper */}
      <ellipse cx="154" cy="100" rx="11" ry="24" transform="rotate(35 154 100)" fill={BLUE} stroke={INK} strokeWidth="4" />
      <path d="M176 60 q9 7 3 18 M184 54 q12 10 5 24" stroke={INK} strokeWidth="3.5" fill="none" />
      <SealHead eyes="happy" mouth="smile" />
    </svg>
  );
}
