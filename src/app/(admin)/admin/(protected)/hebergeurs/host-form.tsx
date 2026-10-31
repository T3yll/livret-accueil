"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextArea } from "@/components/ui/field";
import { initialFormState, type FormState } from "@/lib/forms";
import type { Tables } from "@/types/database";
import { saveHost } from "./actions";

export function HostForm({ host }: { host?: Tables<"hosts"> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveHost.bind(null, host?.id ?? null),
    initialFormState,
  );
  const e = state.fieldErrors;

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <Field label="Nom de l'établissement" name="name" defaultValue={host?.name} error={e.name} required />
      <Field label="Personne à contacter" name="contact_name" defaultValue={host?.contact_name ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Téléphone" name="phone" type="tel" defaultValue={host?.phone ?? ""} />
        <Field label="Email" name="email" type="email" defaultValue={host?.email ?? ""} error={e.email} />
      </div>
      <TextArea label="Notes internes" name="notes" defaultValue={host?.notes ?? ""} hint="Jamais visibles par les voyageurs." />
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
