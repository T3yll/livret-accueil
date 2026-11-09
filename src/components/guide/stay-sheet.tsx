"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { parseStay, type Stay } from "@/lib/stay";
import { todayInParis } from "@/lib/use-stay";

export type OpenFilter = "stay" | "today" | "all";

type Props = {
  stay: Stay | null;
  onSave: (stay: Stay | null) => void;
  onClose: () => void;
  // Sur la carte et la liste : choix de ce qu'on affiche, en plus des dates.
  filter?: { value: OpenFilter; onChange: (value: OpenFilter) => void };
};

// Fenêtre native (<dialog>) : au-dessus de la carte, Échap et focus gérés par le navigateur.
// Champs de date natifs : le téléphone affiche son propre calendrier.
export function StaySheet({ stay, onSave, onClose, filter }: Props) {
  const t = useTranslations("Stay");
  const dialog = useRef<HTMLDialogElement>(null);
  const [from, setFrom] = useState(stay?.from ?? "");
  const [to, setTo] = useState(stay?.to ?? "");
  const [invalid, setInvalid] = useState(false);
  const [today] = useState(todayInParis);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const submit = () => {
    const next = parseStay(from, to, today);
    if (!next) return setInvalid(true);
    onSave(next);
    filter?.onChange("stay");
    onClose();
  };

  const choices: OpenFilter[] = stay ? ["stay", "today", "all"] : ["today", "all"];

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="stay-title"
      className="m-auto mb-0 w-full max-w-[640px] rounded-t-2xl bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-text backdrop:bg-text/40 sm:mb-auto sm:rounded-2xl"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="stay-title" className="text-2xl leading-tight">
            {t("title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-full hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        {filter && (
          <div role="group" aria-label={t("show")} className="flex flex-col gap-2">
            {choices.map((choice) => (
              <button
                key={choice}
                type="button"
                aria-pressed={filter.value === choice}
                onClick={() => {
                  filter.onChange(choice);
                  onClose();
                }}
                className="min-h-11 rounded-xl border border-border px-4 text-left text-[15px] font-semibold hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-white"
              >
                {t(`filter.${choice}`)}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field
            label={t("from")}
            type="date"
            value={from}
            min={today}
            onChange={(e) => {
              const value = e.target.value;
              setFrom(value);
              setInvalid(false);
              // Départ proposé le jour de l'arrivée : évite un départ avant l'arrivée.
              if (value && (!to || to < value)) setTo(value);
            }}
          />
          <Field
            label={t("to")}
            type="date"
            value={to}
            min={from || today}
            onChange={(e) => {
              setTo(e.target.value);
              setInvalid(false);
            }}
          />
        </div>
        {invalid ? (
          <p role="alert" className="text-sm text-favorite">
            {t("invalid")}
          </p>
        ) : (
          <p className="text-sm text-muted">{t("hint")}</p>
        )}

        <div className="flex flex-col gap-2">
          <Button type="button" onClick={submit} className="min-h-12">
            {t("save")}
          </Button>
          {stay && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                onSave(null);
                filter?.onChange("all");
                onClose();
              }}
            >
              {t("clear")}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
