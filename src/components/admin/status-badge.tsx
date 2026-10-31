import type { Enums } from "@/types/database";

export function StatusBadge({ status }: { status: Enums<"property_status"> }) {
  return status === "published" ? (
    <span className="rounded-full bg-open px-2.5 py-1 text-sm font-semibold text-white">Publié</span>
  ) : (
    <span className="rounded-full bg-stone px-2.5 py-1 text-sm font-semibold text-muted">Brouillon</span>
  );
}
