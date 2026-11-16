"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient, publicMediaUrl } from "@/lib/supabase/client";

const CONTENT_TYPES: Record<string, string> = { mp4: "video/mp4", mov: "video/quicktime", m4v: "video/mp4" };
// Limite du stockage (plan gratuit de Supabase) : vérifiée avant l'envoi pour un message clair.
const MAX_MB = 50;

type Props = {
  name: string; // champ caché qui reçoit le chemin du fichier
  label: string;
  initialPath: string;
  pathPrefix: string; // ex. properties/<id>/welcome-video-fr
};

// Vidéo envoyée directement du navigateur vers Supabase Storage ; le chemin part avec le formulaire.
export function VideoInput({ name, label, initialPath, pathPrefix }: Props) {
  const [path, setPath] = useState(initialPath);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileId = useId();

  async function upload(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const contentType = CONTENT_TYPES[extension];
    if (!contentType) return setError("Format non pris en charge : envoyez une vidéo MP4 ou MOV (iPhone).");
    const sizeMb = file.size / 1024 / 1024;
    if (sizeMb > MAX_MB) {
      return setError(
        `Vidéo trop lourde (${Math.round(sizeMb)} Mo, ${MAX_MB} Mo au maximum). Filmez en 720p et en moins d'une minute.`,
      );
    }

    setUploading(true);
    setError(null);
    const newPath = `${pathPrefix}-${Date.now()}.${extension}`;
    const { error } = await createClient().storage.from("media").upload(newPath, file, {
      cacheControl: "31536000",
      contentType,
    });
    setUploading(false);
    if (error) setError("Envoi impossible. Vérifiez votre connexion et réessayez.");
    else setPath(newPath);
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={path} />
      <label htmlFor={fileId} className="text-sm font-semibold">
        {label}
      </label>
      {path && (
        <div className="flex flex-wrap items-end gap-3">
          {/* « #t=0.1 » : affiche la première image sans télécharger la vidéo. */}
          <video controls playsInline preload="metadata" src={`${publicMediaUrl(path)}#t=0.1`} className="max-h-80 rounded-xl bg-stone" />
          <Button type="button" variant="secondary" onClick={() => setPath("")}>
            Retirer
          </Button>
        </div>
      )}
      <input
        id={fileId}
        type="file"
        accept=".mp4,.mov,.m4v,video/mp4,video/quicktime"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
        }}
        className="text-sm file:mr-3 file:min-h-11 file:rounded-xl file:border file:border-border file:bg-surface file:px-4 file:font-semibold"
      />
      {uploading && (
        <p role="status" className="text-sm text-muted">
          Envoi en cours… Une vidéo peut prendre une à deux minutes : gardez la page ouverte.
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
