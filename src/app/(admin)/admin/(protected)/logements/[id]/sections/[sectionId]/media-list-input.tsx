"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { MediaItem } from "@/lib/sections";
import { createClient, publicMediaUrl } from "@/lib/supabase/client";

const ACCEPTED = "image/jpeg,image/png,image/webp,image/avif";

const input =
  "min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-base " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary";

// Photos d'une section : envoyées directement vers Supabase Storage, puis la liste
// (chemin + textes alternatifs) part avec le formulaire dans un champ caché JSON.
export function MediaListInput({ initial, pathPrefix }: { initial: MediaItem[]; pathPrefix: string }) {
  const [items, setItems] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileId = useId();

  async function upload(files: FileList) {
    setUploading(true);
    setError(null);
    const supabase = createClient();
    for (const file of Array.from(files)) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${pathPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${extension}`;
      const { error } = await supabase.storage
        .from("media")
        .upload(path, file, { cacheControl: "31536000", contentType: file.type });
      if (error) {
        setError("Envoi impossible pour une photo. Formats : JPEG, PNG, WebP ; 25 Mo max.");
        continue;
      }
      setItems((current) => [...current, { path }]);
    }
    setUploading(false);
  }

  const update = (index: number, patch: Partial<MediaItem>) =>
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="media" value={JSON.stringify(items)} />

      {items.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((item, index) => (
            <li key={item.path} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3">
              <Image
                src={publicMediaUrl(item.path)}
                alt=""
                width={400}
                height={300}
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Description (FR)
                <input
                  lang="fr"
                  className={input}
                  value={item.alt_fr ?? ""}
                  onChange={(e) => update(index, { alt_fr: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Description (EN)
                <input
                  lang="en"
                  className={input}
                  value={item.alt_en ?? ""}
                  onChange={(e) => update(index, { alt_en: e.target.value })}
                />
              </label>
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                className="min-h-11 self-start rounded-lg px-3 text-sm font-semibold text-favorite hover:bg-favorite-bg"
              >
                Retirer la photo
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor={fileId} className="text-sm font-semibold">
          Ajouter des photos
        </label>
        <input
          id={fileId}
          type="file"
          accept={ACCEPTED}
          multiple
          disabled={uploading}
          onChange={(event) => {
            if (event.target.files?.length) upload(event.target.files);
            event.target.value = "";
          }}
          className="text-sm file:mr-3 file:min-h-11 file:rounded-xl file:border file:border-border file:bg-surface file:px-4 file:font-semibold"
        />
        {uploading && <p role="status" className="text-sm text-muted">Envoi en cours…</p>}
        {error && <p role="alert" className="text-sm text-favorite">{error}</p>}
        <p className="text-sm text-muted">
          Les descriptions sont lues par les lecteurs d&apos;écran. Pensez à enregistrer après l&apos;ajout.
        </p>
      </div>
    </div>
  );
}
