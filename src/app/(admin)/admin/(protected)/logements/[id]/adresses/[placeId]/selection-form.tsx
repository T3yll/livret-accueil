"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/field";
import { formKey, initialFormState, initialValue, type FormState } from "@/lib/forms";
import { saveSelection } from "../actions";

type Selection = { is_favorite: boolean; comment_fr: string | null; comment_en: string | null };

export function SelectionForm({
  propertyId,
  placeId,
  selection,
}: {
  propertyId: string;
  placeId: string;
  selection: Selection;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveSelection.bind(null, propertyId, placeId),
    initialFormState,
  );

  return (
    <form key={formKey(state)} action={action} className="flex flex-col gap-6">
      <label className="flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          name="is_favorite"
          defaultChecked={state.values ? state.values.is_favorite === "on" : selection.is_favorite}
          className="size-5 accent-favorite"
        />
        <span className="font-semibold">Coup de cœur de l&apos;hôte</span>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-heading text-2xl">Le mot de l&apos;hôte</legend>
        <p className="text-sm text-muted">
          Affiché sur la fiche, dans l&apos;encart coup de cœur. Ex. « Allez-y le jeudi soir, la terrasse est magique. »
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextArea label="Français" name="comment_fr" lang="fr" rows={3} defaultValue={initialValue(state, "comment_fr", selection.comment_fr)} />
          <TextArea label="English" name="comment_en" lang="en" rows={3} defaultValue={initialValue(state, "comment_en", selection.comment_en)} />
        </div>
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
        {state.error && (
          <p role="alert" className="text-sm text-favorite">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
