"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type Labels = { copy: string; copied: string; failed: string };

// Copie en un geste, avec un retour lu par les lecteurs d'écran.
// Les libellés arrivent en props : pas besoin d'envoyer les traductions au navigateur.
export function CopyButton({ value, labels }: { value: string; labels: Labels }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("failed");
    }
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
