import { EMBLEM_STROKE_WIDTH, EMBLEM_VIEWBOX, emblemFills, emblemStrokes } from "@/config/emblem";

// Emblème décoratif, en or (couleur réservée au décor, jamais au texte).
export function Emblem({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox={EMBLEM_VIEWBOX}
      className={`text-accent ${className}`}
      fill="currentColor"
      stroke="currentColor"
      strokeLinecap="round"
    >
      {emblemStrokes.map((d) => (
        <path key={d} d={d} fill="none" strokeWidth={EMBLEM_STROKE_WIDTH} />
      ))}
      {emblemFills.map((d) => (
        <path key={d} d={d} stroke="none" />
      ))}
    </svg>
  );
}
