// Shared artwork for next/og ImageResponse: ocean gradient + two waves. Content stays inside the central
// ~60% so the same image works as a maskable icon. `badge` = white shape on transparent (Android status bar).

const WAVE_PATH = "M4 38 C 14 20, 26 20, 36 38 S 58 56, 68 38 S 90 20, 96 32";

export function PwaIconArt({ size, badge = false }: { size: number; badge?: boolean }) {
  const stroke = "#ffffff";
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: badge ? "transparent" : "linear-gradient(160deg, #1cc8da 0%, #0b6c9e 55%, #06335c 100%)",
      }}
    >
      <svg width={size * 0.64} height={size * 0.64} viewBox="0 0 100 100" fill="none">
        <path d={WAVE_PATH} stroke={stroke} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M4 66 C 14 48, 26 48, 36 66 S 58 84, 68 66 S 90 48, 96 60"
          stroke={stroke}
          strokeOpacity={badge ? 1 : 0.55}
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
