"use client";

import { useActionState, useState } from "react";
import { CATEGORY_LABELS, OPENING_MODE_LABELS } from "@/components/admin/place-labels";
import { SinglePhotoInput } from "@/components/admin/single-photo-input";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea } from "@/components/ui/field";
import { formKey, initialFormState, initialValue, type FormState } from "@/lib/forms";
import { parseJsonField, type ClosuresInput, type HoursInput } from "@/lib/place-schedule";
import type { Enums, Tables } from "@/types/database";
import { savePlace } from "./actions";
import { ClosuresEditor, HoursEditor } from "./schedule-editor";

type Props = {
  place?: Tables<"places">;
  hours: HoursInput;
  closures: ClosuresInput;
  today: string; // date du jour à Paris, pour le bouton « vérifié aujourd'hui »
};

export function PlaceForm({ place, hours, closures, today }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    savePlace.bind(null, place?.id ?? null),
    initialFormState,
  );
  const e = state.fieldErrors;
  const v = (name: keyof Tables<"places">) => initialValue(state, name, place?.[name] as string | number | null);

  return (
    <form key={formKey(state)} action={action} className="flex flex-col gap-8">
      <PlaceFields state={state} place={place} hours={hours} closures={closures} today={today} v={v} e={e} />

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : place ? "Enregistrer" : "Créer l'adresse"}
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

function PlaceFields({
  state,
  place,
  hours,
  closures,
  today,
  v,
  e,
}: Props & { state: FormState; v: (name: keyof Tables<"places">) => string; e: Record<string, string> }) {
  const [mode, setMode] = useState(v("opening_mode") || "schedule");
  const [verifiedAt, setVerifiedAt] = useState(v("hours_verified_at"));

  // Après une erreur, les horaires repartent de la dernière saisie, pas de la base.
  const initialHours = state.values?.hours ? ((parseJsonField(state.values.hours) as HoursInput) ?? hours) : hours;
  const initialClosures = state.values?.closures
    ? ((parseJsonField(state.values.closures) as ClosuresInput) ?? closures)
    : closures;

  return (
    <>
      <fieldset className="flex max-w-2xl flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Identité</legend>
        <Field label="Nom" name="name" defaultValue={v("name")} error={e.name} required />
        <Select label="Catégorie" name="category" defaultValue={v("category")} error={e.category} required>
          <option value="" disabled>
            Choisir…
          </option>
          {(Object.keys(CATEGORY_LABELS) as Enums<"place_category">[]).map((key) => (
            <option key={key} value={key}>
              {CATEGORY_LABELS[key]}
            </option>
          ))}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Téléphone" name="phone" type="tel" defaultValue={v("phone")} />
          <Field label="Site web" name="website" type="url" defaultValue={v("website")} error={e.website} />
        </div>
        <Field
          label="Lien « Réserver » (facultatif)"
          name="booking_url"
          type="url"
          defaultValue={v("booking_url")}
          error={e.booking_url}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Description</legend>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextArea label="Français" name="description_fr" lang="fr" rows={4} defaultValue={v("description_fr")} />
          <TextArea label="English" name="description_en" lang="en" rows={4} defaultValue={v("description_en")} />
        </div>
      </fieldset>

      <fieldset className="flex max-w-2xl flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Adresse</legend>
        <Field label="Adresse" name="address" defaultValue={v("address")} />
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <Field label="Code postal" name="postal_code" inputMode="numeric" defaultValue={v("postal_code")} />
          <Field label="Commune" name="city" defaultValue={v("city")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Latitude" name="lat" inputMode="decimal" defaultValue={v("lat")} error={e.lat} required hint="Ex. 44.7372" />
          <Field label="Longitude" name="lng" inputMode="decimal" defaultValue={v("lng")} error={e.lng} required hint="Ex. 1.3833" />
        </div>
        <p className="text-sm text-muted">
          Coordonnées : sur openstreetmap.org, clic droit sur le lieu → « Afficher l&apos;adresse ».
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Horaires</legend>
        <div className="max-w-md">
          <Select label="Type d'horaires" name="opening_mode" value={mode} onChange={(event) => setMode(event.target.value)}>
            {(Object.keys(OPENING_MODE_LABELS) as Enums<"opening_mode">[]).map((key) => (
              <option key={key} value={key}>
                {OPENING_MODE_LABELS[key]}
              </option>
            ))}
          </Select>
        </div>
        {mode === "schedule" ? (
          <HoursEditor initial={initialHours} error={e.hours} />
        ) : (
          // Les plages saisies restent dans le formulaire mais ne sont pas enregistrées hors mode « horaires ».
          <input type="hidden" name="hours" value={JSON.stringify(initialHours)} />
        )}
        <div className="flex max-w-md flex-wrap items-end gap-3">
          <div className="flex-1">
            <Field
              label="Horaires vérifiés le"
              name="hours_verified_at"
              type="date"
              value={verifiedAt}
              onChange={(event) => setVerifiedAt(event.target.value)}
              error={e.hours_verified_at}
              hint="Sans date, le livret affiche « horaires à vérifier »."
            />
          </div>
          <Button type="button" variant="secondary" onClick={() => setVerifiedAt(today)}>
            Aujourd&apos;hui
          </Button>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Fermetures</legend>
        <ClosuresEditor initial={initialClosures} error={e.closures} />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Photo</legend>
        {place ? (
          <SinglePhotoInput
            name="photo_path"
            altNames={{ fr: "photo_alt_fr", en: "photo_alt_en" }}
            initialPath={v("photo_path")}
            initialAlt={{ fr: v("photo_alt_fr"), en: v("photo_alt_en") }}
            pathPrefix={`places/${place.id}/photo`}
          />
        ) : (
          <p className="text-sm text-muted">La photo s&apos;ajoute après la création de l&apos;adresse.</p>
        )}
      </fieldset>
    </>
  );
}
