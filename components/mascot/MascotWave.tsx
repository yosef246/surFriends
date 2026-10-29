import { Arm, Board, Frame, Hand, INK, SKIN, StandingLegs, SurferHead, Torso, type MascotProps } from "./parts";

/** גל waves a shaka, board under his arm. For login and the hero card. */
export function MascotWave({ size = 160, className }: MascotProps) {
  return (
    <Frame size={size} className={className} label="גל, הגולש של surFriends, מנופף בשאקה">
      {/* board, behind the body */}
      <g transform="translate(38 120) rotate(-10)">
        <Board />
      </g>
      <StandingLegs />
      <Torso />
      {/* arm holding the board */}
      <Arm d="M80 113 Q64 118 56 134" />
      <Hand cx={56} cy={136} />
      {/* shaka arm */}
      <Arm d="M120 113 Q146 118 158 94" />
      <g stroke={INK} strokeWidth="3" fill={SKIN}>
        <ellipse cx="146" cy="86" rx="3.8" ry="6.5" transform="rotate(-25 146 86)" />
        <ellipse cx="170" cy="80" rx="3.8" ry="6.5" transform="rotate(35 170 80)" />
        <circle cx="158" cy="88" r="8.5" />
      </g>
      <path d="M176 60 q7 6 3 16 M184 54 q10 9 5 22" stroke={INK} strokeWidth="3" fill="none" />
      <SurferHead mouth="grin" />
    </Frame>
  );
}
