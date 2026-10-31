import Image from "next/image";
import type { Locale } from "@/i18n/routing";
import { mediaUrl } from "@/lib/guide-view";
import { localized } from "@/lib/localized";
import type { MediaItem } from "@/lib/sections";

// Photos d'une section, chargées en différé et redimensionnées par next/image.
export function Photos({ items, locale }: { items: MediaItem[]; locale: Locale }) {
  if (items.length === 0) return null;
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <Image
          key={item.path}
          src={mediaUrl(item.path)}
          alt={localized(item, "alt", locale) ?? ""}
          width={640}
          height={480}
          sizes="(max-width: 640px) 100vw, 640px"
          className="aspect-[4/3] w-full rounded-2xl object-cover"
        />
      ))}
    </div>
  );
}
