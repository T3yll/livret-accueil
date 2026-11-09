"use client";

import { useActionState } from "react";
import { MediaListInput } from "@/components/admin/media-list-input";
import { VoiceNoteFields } from "@/components/admin/voice-note-fields";
import { Button } from "@/components/ui/button";
import { Field, TextArea } from "@/components/ui/field";
import { formKey, initialFormState, initialValue, type FormState } from "@/lib/forms";
import { parseMedia, parseMediaJson } from "@/lib/sections";
import type { Tables } from "@/types/database";
import { saveTemplate } from "../actions";

export function TemplateForm({ template }: { template: Tables<"equipment_templates"> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveTemplate.bind(null, template.id), initialFormState);
  const e = state.fieldErrors;
  const v = (name: "title_fr" | "title_en" | "body_fr" | "body_en" | "audio_path_fr" | "audio_path_en" | "transcript_fr" | "transcript_en") =>
    initialValue(state, name, template[name]);

  return (
    <form key={formKey(state)} action={action} className="flex flex-col gap-8">
      <fieldset className="grid gap-4 lg:grid-cols-2">
        <legend className="sr-only">Nom de l&apos;équipement</legend>
        <Field label="Nom (FR)" name="title_fr" lang="fr" defaultValue={v("title_fr")} error={e.title_fr} hint="Ex. Machine Nespresso" required />
        <Field label="Name (EN)" name="title_en" lang="en" defaultValue={v("title_en")} hint="Ex. Nespresso machine" />
      </fieldset>

      <VoiceNoteFields
        pathPrefix={`equipment-templates/${template.id}/voice`}
        values={{
          audio_path_fr: v("audio_path_fr"),
          audio_path_en: v("audio_path_en"),
          transcript_fr: v("transcript_fr"),
          transcript_en: v("transcript_en"),
        }}
      />

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Texte</legend>
        <p className="text-sm text-muted">
          Mode d&apos;emploi en quelques étapes. Une ligne vide sépare deux paragraphes ; « - » en début de ligne crée une liste.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextArea label="Français" name="body_fr" lang="fr" rows={8} defaultValue={v("body_fr")} />
          <TextArea label="English" name="body_en" lang="en" rows={8} defaultValue={v("body_en")} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Photos</legend>
        <p className="text-sm text-muted">Par exemple une photo du bouton à utiliser.</p>
        <MediaListInput
          initial={state.values?.media ? parseMediaJson(state.values.media) : parseMedia(template.media)}
          pathPrefix={`equipment-templates/${template.id}`}
        />
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {state.saved && !pending && (
          <p role="status" className="text-sm text-open">
            Modifications enregistrées.
          </p>
        )}
        {(state.error || Object.keys(e).length > 0) && (
          <p role="alert" className="text-sm text-favorite">
            {state.error ?? "Certains champs sont à corriger."}
          </p>
        )}
      </div>
    </form>
  );
}
