"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient, publicMediaUrl } from "@/lib/supabase/client";

const CONTENT_TYPES: Record<string, string> = { m4a: "audio/mp4", mp3: "audio/mpeg", aac: "audio/aac" };

type Props = {
  name: string; // champ caché qui reçoit le chemin du fichier
  label: string;
  initialPath: string;
  pathPrefix: string; // ex. properties/<id>/welcome-fr
};

// Note vocale envoyée directement du navigateur vers Supabase Storage, comme les photos :
// le chemin part avec le reste du formulaire.
export function AudioInput({ name, label, initialPath, pathPrefix }: Props) {
  const [path, setPath] = useState(initialPath);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileId = useId();

  async function upload(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const contentType = CONTENT_TYPES[extension];
    if (!contentType) return setError("Format non pris en charge : envoyez un fichier M4A, MP3 ou AAC.");

    setUploading(true);
    setError(null);
    const newPath = `${pathPrefix}-${Date.now()}.${extension}`;
    const { error } = await createClient().storage.from("media").upload(newPath, file, {
      cacheControl: "31536000",
      contentType,
    });
    setUploading(false);
    if (error) setError("Envoi impossible. Vérifiez la taille du fichier (25 Mo maximum) et réessayez.");
    else setPath(newPath);
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={path} />
      <label htmlFor={fileId} className="text-sm font-semibold">
        {label}
      </label>
      {path && (
        <div className="flex flex-wrap items-center gap-3">
          <audio controls preload="none" src={publicMediaUrl(path)} className="w-full max-w-md" />
          <Button type="button" variant="secondary" onClick={() => setPath("")}>
            Retirer
          </Button>
        </div>
      )}
      <input
        id={fileId}
        type="file"
        accept=".m4a,.mp3,.aac,audio/mp4,audio/x-m4a,audio/mpeg,audio/aac"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
        }}
        className="text-sm file:mr-3 file:min-h-11 file:rounded-xl file:border file:border-border file:bg-surface file:px-4 file:font-semibold"
      />
      {uploading && (
        <p role="status" className="text-sm text-muted">
          Envoi en cours…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-favorite">
          {error}
        </p>
      )}
      {path !== initialPath && !uploading && (
        <p className="text-sm text-info">N&apos;oubliez pas d&apos;enregistrer le formulaire pour conserver ce changement.</p>
      )}
    </div>
  );
}
