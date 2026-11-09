"use client";

import { useTranslations } from "next-intl";
import { curator } from "@/config/brand";
import { CuratorAvatar } from "./curator-avatar";
import { openWelcome } from "./welcome-intro";

// Le portrait de Rémi rouvre son message d'accueil.
export function WelcomeReopen({ size }: { size: number }) {
  const t = useTranslations("Welcome");
  return (
    <button
      type="button"
      onClick={openWelcome}
      aria-label={t("reopen", { name: curator.name })}
      className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <CuratorAvatar size={size} />
    </button>
  );
}
