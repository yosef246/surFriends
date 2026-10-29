/* Shared pieces for "ימי" the seal. 4 colors + white. Flat fills, 4px ink outline. */

export const INK = "#0A2540";
export const BLUE = "#38B6DC";
export const ORANGE = "#FF7A1A";
export const WHITE = "#FFFFFF";

export type MascotProps = {
  /** Rendered width/height in px. Designed for 96-200. */
  size?: number;
  className?: string;
};

type Eyes = "happy" | "look" | "worried";
type Mouth = "smile" | "flat" | "oh";

/** Head centred on x=100, y=78 (viewBox 200x200). Move with `dy`. */
export function SealHead({ eyes, mouth, dy = 0 }: { eyes: Eyes; mouth: Mouth; dy?: number }) {
  return (
    <g transform={`translate(0 ${dy})`} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="100" cy="78" rx="46" ry="40" fill={BLUE} stroke={INK} strokeWidth="4" />
      <ellipse cx="100" cy="94" rx="24" ry="17" fill={WHITE} />
      <ellipse cx="68" cy="88" rx="7" ry="4.5" fill={ORANGE} opacity=".55" />
      <ellipse cx="132" cy="88" rx="7" ry="4.5" fill={ORANGE} opacity=".55" />
      <ellipse cx="100" cy="86" rx="7" ry="5" fill={INK} />
      <g fill={INK}>
        <circle cx="88" cy="95" r="1.6" />
        <circle cx="91" cy="99" r="1.6" />
        <circle cx="112" cy="95" r="1.6" />
        <circle cx="109" cy="99" r="1.6" />
      </g>

      {eyes === "happy" && (
        <g>
          <circle cx="82" cy="69" r="5.5" fill={INK} />
          <circle cx="118" cy="69" r="5.5" fill={INK} />
          <circle cx="84" cy="67" r="1.8" fill={WHITE} />
          <circle cx="120" cy="67" r="1.8" fill={WHITE} />
        </g>
      )}
      {eyes === "look" && (
        <g>
          <circle cx="80" cy="69" r="9" fill={WHITE} stroke={INK} strokeWidth="3" />
          <circle cx="120" cy="69" r="9" fill={WHITE} stroke={INK} strokeWidth="3" />
          <circle cx="82" cy="74" r="4.5" fill={INK} />
          <circle cx="122" cy="74" r="4.5" fill={INK} />
        </g>
      )}
      {eyes === "worried" && (
        <g>
          <circle cx="80" cy="69" r="9" fill={WHITE} stroke={INK} strokeWidth="3" />
          <circle cx="120" cy="69" r="9" fill={WHITE} stroke={INK} strokeWidth="3" />
          <circle cx="80" cy="69" r="2.8" fill={INK} />
          <circle cx="120" cy="69" r="2.8" fill={INK} />
          <path d="M69 59 L90 52 M131 59 L110 52" stroke={INK} strokeWidth="3.5" fill="none" />
        </g>
      )}

      {mouth === "smile" && (
        <g>
          <path d="M90 100 Q100 114 110 100 Z" fill={INK} stroke={INK} strokeWidth="2" />
          <ellipse cx="100" cy="106" rx="4.5" ry="2.6" fill={ORANGE} />
        </g>
      )}
      {mouth === "flat" && <path d="M92 103 H108" stroke={INK} strokeWidth="3.5" fill="none" />}
      {mouth === "oh" && <ellipse cx="100" cy="105" rx="5" ry="6" fill={INK} />}
    </g>
  );
}
