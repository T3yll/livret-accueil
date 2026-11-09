"use client";

import { AudioInput } from "@/components/admin/audio-input";
import { TextArea } from "@/components/ui/field";

type Values = { audio_path_fr: string; audio_path_en: string; transcript_fr: string; transcript_en: string };

// Note vocale FR/EN et sa transcription, pour une fiche équipement ou un modèle de la bibliothèque.
// Champs envoyés : audio_path_fr, audio_path_en, transcript_fr, transcript_en.
export function VoiceNoteFields({ values, pathPrefix }: { values: Values; pathPrefix: string }) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-2 font-heading text-2xl">Note vocale</legend>
      <p className="max-w-2xl text-sm text-muted">
        Facultative. Expliquez l&apos;appareil comme si vous étiez à côté du voyageur (30 secondes à 1 minute). Elle
        s&apos;affiche avant le texte et s&apos;écoute aussi sans réseau. Mémo vocal d&apos;iPhone (M4A), MP3 ou AAC.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <AudioInput
            name="audio_path_fr"
            label="Note vocale en français"
            initialPath={values.audio_path_fr}
            pathPrefix={`${pathPrefix}-fr`}
          />
          <TextArea
            label="Transcription en français"
            name="transcript_fr"
            lang="fr"
            rows={4}
            defaultValue={values.transcript_fr}
            hint="Le texte de la note, pour ceux qui ne peuvent pas écouter."
          />
        </div>
        <div className="flex flex-col gap-4">
          <AudioInput
            name="audio_path_en"
            label="Note vocale en anglais"
            initialPath={values.audio_path_en}
            pathPrefix={`${pathPrefix}-en`}
          />
          <TextArea label="Transcription en anglais" name="transcript_en" lang="en" rows={4} defaultValue={values.transcript_en} />
        </div>
      </div>
    </fieldset>
  );
}
