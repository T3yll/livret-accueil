import type { TodayStatus } from "@/lib/opening-hours";

// Badge d'ouverture : toujours texte + couleur, jamais la couleur seule (DA).
const STYLES: Record<TodayStatus["state"], string> = {
  open: "text-open",
  always: "text-open",
  closed: "text-closed",
  appointment: "text-info",
  unknown: "text-info",
};

export function OpenBadge({ status, label }: { status: TodayStatus; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${STYLES[status.state]}`}>
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-current" />
      {label}
    </span>
  );
}
