"use client";

import { useActionState } from "react";
import { KEY_HANDOVER_LABELS, PROVIDED_LABELS, SECTION_BODY_HINTS } from "@/components/admin/section-labels";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea } from "@/components/ui/field";
import { formKey, initialFormState, initialValue, type FormState } from "@/lib/forms";
import { KEY_HANDOVER, parseMedia, parseMediaJson, parseSectionData, PROVIDED_ITEMS } from "@/lib/sections";
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
    <form key={formKey(state)} action={action} className="flex flex-col gap-8">
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

      {section.type === "prepare" && (
        <>
          <fieldset className="flex max-w-3xl flex-col gap-4">
            <legend className="mb-2 font-heading text-2xl">Ce qui est fourni</legend>
            <p className="text-sm text-muted">« Non précisé » : l&apos;élément n&apos;apparaît pas dans le livret.</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {PROVIDED_ITEMS.map((item) => (
                <Select key={item} label={PROVIDED_LABELS[item]} name={`provided_${item}`} defaultValue={v(`provided_${item}`)}>
                  <option value="">Non précisé</option>
                  <option value="yes">Fourni</option>
                  <option value="no">À apporter</option>
                </Select>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Machine à café (FR)" name="coffee_maker_fr" lang="fr" defaultValue={v("coffee_maker_fr")} hint="Ex. Nespresso, cafetière à filtre" />
              <Field label="Coffee maker (EN)" name="coffee_maker_en" lang="en" defaultValue={v("coffee_maker_en")} hint="Ex. Nespresso, filter coffee maker" />
            </div>
            <label className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                name="dry_toilets"
                defaultChecked={state.values ? state.values.dry_toilets === "on" : Boolean(stored.dry_toilets)}
                className="size-5 accent-primary"
              />
              <span>Toilettes sèches</span>
            </label>
          </fieldset>

          <fieldset className="flex max-w-3xl flex-col gap-4">
            <legend className="mb-2 font-heading text-2xl">À ne pas oublier</legend>
            <p className="text-sm text-muted">Une chose par ligne, 10 mots maximum. Ex. « Un pull pour les soirées fraîches ».</p>
            <div className="grid gap-4 lg:grid-cols-2">
              <TextArea label="Français" name="bring_fr" lang="fr" rows={5} defaultValue={v("bring_fr")} />
              <TextArea label="English" name="bring_en" lang="en" rows={5} defaultValue={v("bring_en")} />
            </div>
          </fieldset>

          <fieldset className="flex max-w-3xl flex-col gap-4">
            <legend className="mb-2 font-heading text-2xl">Venir en train</legend>
            <p className="text-sm text-muted">L&apos;itinéraire en voiture s&apos;affiche automatiquement depuis l&apos;adresse du logement.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Gare la plus proche" name="station" defaultValue={v("station")} hint="Ex. Gourdon" />
              <Field
                label="Trajet gare → logement (minutes en voiture)"
                name="station_minutes"
                inputMode="numeric"
                defaultValue={v("station_minutes")}
                error={e.station_minutes}
              />
              <Field label="Taxi conseillé (FR)" name="taxi_fr" lang="fr" defaultValue={v("taxi_fr")} hint="Ex. À réserver la veille : Taxi Dupont, 05 65 00 00 00" />
              <Field label="Taxi (EN)" name="taxi_en" lang="en" defaultValue={v("taxi_en")} />
            </div>
          </fieldset>
        </>
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
          initial={state.values?.media ? parseMediaJson(state.values.media) : parseMedia(section.media)}
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
