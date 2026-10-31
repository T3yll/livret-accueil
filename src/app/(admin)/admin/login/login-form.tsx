"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Mot de passe" name="password" type="password" autoComplete="current-password" required />
      {state.error && (
        <p role="alert" className="text-sm text-favorite">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
