"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea } from "@/components/ui/field";
import { initialFormState, initialValue, type FormState } from "@/lib/forms";
import type { Tables } from "@/types/database";
import { saveProperty } from "./actions";
import { CoverPhotoInput } from "./cover-photo-input";

type Props = {
  property?: Tables<"properties">;
  hosts: Pick<Tables<"hosts">, "id" | "name">[];
  defaultHostId?: string;
};

export function PropertyForm({ property, hosts, defaultHostId }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveProperty.bind(null, property?.id ?? null),
    initialFormState,
  );
  const e = state.fieldErrors;

  return (
    <form action={action} className="flex flex-col gap-8">
      <fieldset className="flex max-w-2xl flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Identité</legend>
        <Select
          label="Hébergeur"
          name="host_id"
          defaultValue={initialValue(state, "host_id", property?.host_id ?? defaultHostId)}
          error={e.host_id}
          required
        >
          <option value="" disabled>
            Choisir…
          </option>
          {hosts.map((host) => (
            <option key={host.id} value={host.id}>
              {host.name}
            </option>
          ))}
        </Select>
        <Field label="Nom du logement" name="name" defaultValue={initialValue(state, "name", property?.name)} error={e.name} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Téléphone de contact" name="contact_phone" type="tel" defaultValue={initialValue(state, "contact_phone", property?.contact_phone)} />
          <Field
            label="Email de contact"
            name="contact_email"
            type="email"
            defaultValue={initialValue(state, "contact_email", property?.contact_email)}
            error={e.contact_email}
          />
        </div>
      </fieldset>

      <fieldset className="flex max-w-2xl flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Adresse</legend>
        <Field label="Adresse" name="address" defaultValue={initialValue(state, "address", property?.address)} />
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <Field label="Code postal" name="postal_code" inputMode="numeric" defaultValue={initialValue(state, "postal_code", property?.postal_code)} />
          <Field label="Commune" name="city" defaultValue={initialValue(state, "city", property?.city)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Latitude"
            name="lat"
            inputMode="decimal"
            defaultValue={initialValue(state, "lat", property?.lat)}
            error={e.lat}
            hint="Ex. 44.7372"
          />
          <Field
            label="Longitude"
            name="lng"
            inputMode="decimal"
            defaultValue={initialValue(state, "lng", property?.lng)}
            error={e.lng}
            hint="Ex. 1.3833"
          />
        </div>
        <p className="text-sm text-muted">
          Coordonnées : sur openstreetmap.org, clic droit sur le logement → « Afficher l&apos;adresse ».
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Message d&apos;accueil</legend>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextArea label="Français" name="welcome_fr" lang="fr" rows={5} defaultValue={initialValue(state, "welcome_fr", property?.welcome_fr)} />
          <TextArea label="English" name="welcome_en" lang="en" rows={5} defaultValue={initialValue(state, "welcome_en", property?.welcome_en)} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-heading text-2xl">Photo principale</legend>
        {property ? (
          <CoverPhotoInput property={property} state={state} />
        ) : (
          <p className="text-sm text-muted">La photo s&apos;ajoute après la création du logement.</p>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : property ? "Enregistrer" : "Créer le logement"}
        </Button>
        {state.saved && !pending && (
          <p role="status" className="text-sm text-open">
            Modifications enregistrées.
          </p>
        )}
        {state.error && (
          <p role="alert" className="text-sm text-favorite">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
