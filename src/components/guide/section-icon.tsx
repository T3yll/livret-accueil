import { DoorOpen, Flame, House, Info, KeyRound, Phone, Wifi, type LucideIcon } from "lucide-react";
import type { SectionType } from "@/lib/sections";

// Jeu d'icônes de la DA (lucide-react).
export const SECTION_ICONS: Record<SectionType, LucideIcon> = {
  arrival: KeyRound,
  wifi: Wifi,
  house: House,
  equipment: Flame,
  departure: DoorOpen,
  contacts: Phone,
  practical: Info,
};

export function IconBadge({ icon: Icon, size = 20 }: { icon: LucideIcon; size?: number }) {
  return (
    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-stone text-primary">
      <Icon size={size} strokeWidth={1.75} aria-hidden />
    </span>
  );
}
