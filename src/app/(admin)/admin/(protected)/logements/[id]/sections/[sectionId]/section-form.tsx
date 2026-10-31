"use client";

import { useActionState } from "react";
import { KEY_HANDOVER_LABELS, SECTION_BODY_HINTS } from "@/components/admin/section-labels";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea } from "@/components/ui/field";
import { initialFormState, initialValue, type FormState } from "@/lib/forms";
import { KEY_HANDOVER, parseMedia, parseSectionData } from "@/lib/sections";
import type { Tables } from "@/types/database";
import { saveSection } from "../actions";
import { MediaListInput } from "./media-list-input";

const TEXT_HINT = "Une ligne vide sépare deux paragraphes ; « - » en début de ligne crée une liste.";

export function SectionForm({ propertyId, section }: { propertyId: string; section: Tables<"guide_sections"> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveSection.bind(null, propertyId, section.id, section.type),
    initialFormState,
  );
  const e = state.fieldErrors;
  // Valeurs en base, à plat : les champs de `data` se lisent comme les colonnes.
  const stored: Record<string, string | boolean | null | undefined> = {
    title_fr: section.title_fr,
    title_en: section.title_en,
    body_fr: section.body_fr,
    body_en: section.body_en,
    ...(parseSectionData(section.type, section.data) as Record<string, string | boolean | undefined>),
  };
  const v = (name: string) => {
    const value = stored[name];
    return initialValue(state, name, typeof value === "boolean" ? null : value);
  };

  return (
    <form action={action} className="flex flex-col gap-8">
      {section.type === "equipment" && (
        <fieldset className="grid gap-4 lg:grid-cols-2">
          <legend className="sr-only">Nom de l&apos;équipement</legend>
          <Field label="Nom (FR)" name="title_fr" lang="fr" defaultValue={v("title_fr")} hint="Ex. Poêle à bois" required />
          <Field label="Name (EN)" name="title_en" lang="en" defaultValue={v("title_en")} hint="Ex. Wood stove" />
        </fieldset>
      )}

      {section.type === "arrival" && (
        <fieldset className="flex max-w-2xl flex-col gap-4">
          <legend className="mb-2 font-heading text-2xl">Infos d&apos;arrivée</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Arrivée à partir de" name="checkin_from" type="time" defaultValue={v("checkin_from")} error={e.checkin_from} />
            <Field
              label="Arrivée jusqu'à (facultatif)"
              name="checkin_until"
              type="time"
              defaultValue={v("checkin_until")}
              error={e.checkin_until}
            />
          </div>
          <Select label="Remise des clés" name="key_handover" defaultValue={v("key_handover")}>
            <option value="">Non précisé</option>
            {KEY_HANDOVER.map((key) => (
              <option key={key} value={key}>
                {KEY_HANDOVER_LABELS[key]}
              </option>
            ))}
          </Select>
          <Field
            label="Code d'accès (boîte à clés, portail…)"
            name="access_code"
            autoComplete="off"
            defaultValue={v("access_code")}
            hint="Affiché uniquement dans la section Arrivée, jamais sur l'accueil du livret."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <TextArea label="Parking (FR)" name="parking_fr" lang="fr" rows={2} defaultValue={v("parking_fr")} />
            <TextArea label="Parking (EN)" name="parking_en" lang="en" rows={2} defaultValue={v("parking_en")} />
          </div>
          <Field
            label="Lien vers une vidéo d'accès (facultatif)"
            name="video_url"
            type="url"
            inputMode="url"
            defaultValue={v("video_url")}
            error={e.video_url}
            hint="Ex. vidéo YouTube non répertoriée. Elle s'ouvrira dans l'application du voyageur."
          />
        </fieldset>
      )}

      {section.type === "wifi" && (
        <fieldset className="flex max-w-2xl flex-col gap-4">
          <legend className="mb-2 font-heading text-2xl">Réseau</legend>
          <label className="flex min-h-11 items-center gap-3">
            <input
              type="checkbox"
              name="no_wifi"
              defaultChecked={state.values ? state.values.no_wifi === "on" : Boolean(stored.no_wifi)}
              className="size-5 accent-primary"
            />
            <span>Pas de Wi-Fi dans ce logement</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom du réseau" name="ssid" autoComplete="off" defaultValue={v("ssid")} />
            <Field label="Mot de passe" name="password" autoComplete="off" defaultValue={v("password")} />
          </div>
        </fieldset>
      )}

      {section.type === "departure" && (
        <fieldset className="flex max-w-xs flex-col gap-4">
          <legend className="mb-2 font-heading text-2xl">Départ</legend>
          <Field label="Départ avant" name="checkout_time" type="time" defaultValue={v("checkout_time")} error={e.checkout_time} />
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Texte</legend>
        <p className="text-sm text-muted">
          {SECTION_BODY_HINTS[section.type]} {TEXT_HINT}
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextArea label="Français" name="body_fr" lang="fr" rows={8} defaultValue={v("body_fr")} />
          <TextArea label="English" name="body_en" lang="en" rows={8} defaultValue={v("body_en")} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Photos</legend>
        <MediaListInput
          initial={parseMedia(section.media)}
          pathPrefix={`properties/${propertyId}/sections/${section.id}`}
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
