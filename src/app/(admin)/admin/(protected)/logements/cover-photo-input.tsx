"use client";

import Image from "next/image";
import { useState } from "react";
import { Field } from "@/components/ui/field";
import { createClient, publicMediaUrl } from "@/lib/supabase/client";
import { initialValue, type FormState } from "@/lib/forms";
import type { Tables } from "@/types/database";

const ACCEPTED = "image/jpeg,image/png,image/webp,image/avif";

// Envoie la photo directement du navigateur vers Supabase Storage (la règle
// d'accès du bucket « media » n'autorise que l'admin), puis renseigne le chemin
// dans un champ caché : il est enregistré avec le reste du formulaire.
export function CoverPhotoInput({ property, state }: { property: Tables<"properties">; state: FormState }) {
  const [path, setPath] = useState(initialValue(state, "cover_photo_path", property.cover_photo_path));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const newPath = `properties/${property.id}/cover-${Date.now()}.${extension}`;
    const { error } = await createClient().storage.from("media").upload(newPath, file, {
      cacheControl: "31536000",
      contentType: file.type,
    });
    setUploading(false);
    if (error) setError("Envoi impossible. Vérifiez le format (JPEG, PNG, WebP) et la taille (25 Mo max).");
    else setPath(newPath);
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="cover_photo_path" value={path} />
      {path && (
        <Image
          src={publicMediaUrl(path)}
          alt=""
          width={480}
          height={320}
          className="aspect-[3/2] w-full max-w-md rounded-2xl object-cover"
        />
      )}
      <div className="flex flex-col gap-1">
        <label htmlFor="cover-file" className="text-sm font-semibold">
          {path ? "Remplacer la photo" : "Choisir une photo"}
        </label>
        <input
          id="cover-file"
          type="file"
          accept={ACCEPTED}
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
          }}
          className="text-sm file:mr-3 file:min-h-11 file:rounded-xl file:border file:border-border file:bg-surface file:px-4 file:font-semibold"
        />
        {uploading && <p role="status" className="text-sm text-muted">Envoi en cours…</p>}
        {error && <p role="alert" className="text-sm text-favorite">{error}</p>}
        {path && !uploading && (
          <p className="text-sm text-muted">Pensez à enregistrer le formulaire pour conserver la photo.</p>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label="Description de la photo (FR)"
          name="cover_photo_alt_fr"
          lang="fr"
          defaultValue={initialValue(state, "cover_photo_alt_fr", property.cover_photo_alt_fr)}
          hint="Lue par les lecteurs d'écran. Ex. « Maison en pierre avec piscine »."
        />
        <Field
          label="Photo description (EN)"
          name="cover_photo_alt_en"
          lang="en"
          defaultValue={initialValue(state, "cover_photo_alt_en", property.cover_photo_alt_en)}
        />
      </div>
    </div>
  );
}
