import { SinglePhotoInput } from "@/components/admin/single-photo-input";
import { initialValue, type FormState } from "@/lib/forms";
import type { Tables } from "@/types/database";

export function CoverPhotoInput({ property, state }: { property: Tables<"properties">; state: FormState }) {
  return (
    <SinglePhotoInput
      name="cover_photo_path"
      altNames={{ fr: "cover_photo_alt_fr", en: "cover_photo_alt_en" }}
      initialPath={initialValue(state, "cover_photo_path", property.cover_photo_path)}
      initialAlt={{
        fr: initialValue(state, "cover_photo_alt_fr", property.cover_photo_alt_fr),
        en: initialValue(state, "cover_photo_alt_en", property.cover_photo_alt_en),
      }}
      pathPrefix={`properties/${property.id}/cover`}
    />
  );
}
