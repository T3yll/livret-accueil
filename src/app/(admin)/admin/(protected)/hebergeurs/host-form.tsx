"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextArea } from "@/components/ui/field";
import { formKey, initialFormState, initialValue, type FormState } from "@/lib/forms";
import type { Tables } from "@/types/database";
import { saveHost } from "./actions";

export function HostForm({ host }: { host?: Tables<"hosts"> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveHost.bind(null, host?.id ?? null),
    initialFormState,
  );
  const e = state.fieldErrors;

  return (
    <form key={formKey(state)} action={action} className="flex max-w-xl flex-col gap-4">
      <Field label="Nom de l'établissement" name="name" defaultValue={initialValue(state, "name", host?.name)} error={e.name} required />
      <Field label="Personne à contacter" name="contact_name" defaultValue={initialValue(state, "contact_name", host?.contact_name)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Téléphone" name="phone" type="tel" defaultValue={initialValue(state, "phone", host?.phone)} />
        <Field label="Email" name="email" type="email" defaultValue={initialValue(state, "email", host?.email)} error={e.email} />
      </div>
      <TextArea label="Notes internes" name="notes" defaultValue={initialValue(state, "notes", host?.notes)} hint="Jamais visibles par les voyageurs." />
      {state.error && (
        <p role="alert" className="text-sm text-favorite">
          {state.error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
