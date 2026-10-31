"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type Labels = { copy: string; copied: string; failed: string };

// API moderne d'abord ; sinon l'ancienne méthode (champ temporaire + execCommand),
// encore utile sur certains navigateurs mobiles et vues intégrées.
async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      field.remove();
    }
  }
}

// Copie en un geste, avec un retour lu par les lecteurs d'écran.
// Les libellés arrivent en props : pas besoin d'envoyer les traductions au navigateur.
export function CopyButton({ value, labels }: { value: string; labels: Labels }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    const ok = await writeToClipboard(value);
    setStatus(ok ? "copied" : "failed");
    if (ok) setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[15px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {status === "copied" ? <Check size={20} aria-hidden /> : <Copy size={20} aria-hidden />}
        {status === "copied" ? labels.copied : labels.copy}
      </button>
      <p aria-live="polite" className="min-h-5 text-center text-sm text-muted">
        {status === "copied" ? labels.copied : status === "failed" ? labels.failed : ""}
      </p>
    </div>
  );
}
