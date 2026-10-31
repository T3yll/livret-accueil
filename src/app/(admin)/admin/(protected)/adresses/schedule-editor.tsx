"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { WEEKDAY_LABELS } from "@/components/admin/place-labels";
import type { ClosuresInput, HoursInput } from "@/lib/place-schedule";

const timeInput =
  "min-h-11 rounded-xl border border-border bg-surface px-2 text-base focus-visible:outline-2 focus-visible:outline-primary";
const smallButton =
  "inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary";
const iconButton =
  "inline-flex size-11 items-center justify-center rounded-lg text-favorite hover:bg-favorite-bg focus-visible:outline-2 focus-visible:outline-primary";

// Horaires de la semaine : plusieurs plages par jour (midi et soir).
// La liste part avec le formulaire dans le champ caché « hours » (JSON).
export function HoursEditor({ initial, error }: { initial: HoursInput; error?: string }) {
  const [ranges, setRanges] = useState(initial);

  const update = (index: number, patch: Partial<HoursInput[number]>) =>
    setRanges((current) => current.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const copyMondayToWeek = () =>
    setRanges((current) => {
      const monday = current.filter((r) => r.weekday === 1);
      return [1, 2, 3, 4, 5, 6, 7].flatMap((weekday) => monday.map((r) => ({ ...r, weekday })));
    });

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="hours" value={JSON.stringify(ranges)} />
      <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
        {WEEKDAY_LABELS.map((label, dayIndex) => {
          const weekday = dayIndex + 1;
          const dayRanges = ranges.map((r, index) => ({ r, index })).filter(({ r }) => r.weekday === weekday);
          return (
            <li key={weekday} className="flex flex-wrap items-center gap-3 px-3 py-2">
              <span className="w-24 font-semibold">{label}</span>
              <div className="flex flex-1 flex-col gap-2">
                {dayRanges.length === 0 && <span className="text-sm text-muted">Fermé</span>}
                {dayRanges.map(({ r, index }) => (
                  <div key={index} className="flex flex-wrap items-center gap-2">
                    <input
                      type="time"
                      aria-label={`${label}, ouverture`}
                      className={timeInput}
                      value={r.opens_at}
                      onChange={(e) => update(index, { opens_at: e.target.value })}
                    />
                    <span aria-hidden>–</span>
                    <input
                      type="time"
                      aria-label={`${label}, fermeture`}
                      className={timeInput}
                      value={r.closes_at}
                      onChange={(e) => update(index, { closes_at: e.target.value })}
                    />
                    <button
                      type="button"
                      className={iconButton}
                      aria-label={`Supprimer cette plage du ${label.toLowerCase()}`}
                      onClick={() => setRanges((current) => current.filter((_, i) => i !== index))}
                    >
                      <Trash2 size={18} aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={smallButton}
                onClick={() =>
                  setRanges((current) => [
                    ...current,
                    dayRanges.length === 0
                      ? { weekday, opens_at: "10:00", closes_at: "18:00" }
                      : { weekday, opens_at: "19:00", closes_at: "22:00" },
                  ])
                }
              >
                <Plus size={16} aria-hidden /> Plage
              </button>
            </li>
          );
        })}
      </ul>
      <div>
        <button type="button" className={smallButton} onClick={copyMondayToWeek}>
          Recopier les horaires du lundi sur toute la semaine
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-favorite">
          {error}
        </p>
      )}
    </div>
  );
}

// Périodes de fermeture (congés, fermeture d'hiver…). Champ caché « closures » (JSON).
export function ClosuresEditor({ initial, error }: { initial: ClosuresInput; error?: string }) {
  const [closures, setClosures] = useState(initial);

  const update = (index: number, patch: Partial<ClosuresInput[number]>) =>
    setClosures((current) => current.map((c, i) => (i === index ? { ...c, ...patch } : c)));

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="closures" value={JSON.stringify(closures)} />
      {closures.length === 0 && <p className="text-sm text-muted">Aucune fermeture prévue.</p>}
      <ul className="flex flex-col gap-3">
        {closures.map((c, index) => (
          <li key={index} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Du
                <input
                  type="date"
                  className={timeInput}
                  value={c.starts_on}
                  onChange={(e) => update(index, { starts_on: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Au (inclus)
                <input
                  type="date"
                  className={timeInput}
                  value={c.ends_on}
                  onChange={(e) => update(index, { ends_on: e.target.value })}
                />
              </label>
              <button
                type="button"
                className={`${iconButton} self-end`}
                aria-label="Supprimer cette fermeture"
                onClick={() => setClosures((current) => current.filter((_, i) => i !== index))}
              >
                <Trash2 size={18} aria-hidden />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Motif (FR)
                <input
                  lang="fr"
                  className={`${timeInput} px-3`}
                  value={c.reason_fr ?? ""}
                  placeholder="Ex. Fermeture annuelle"
                  onChange={(e) => update(index, { reason_fr: e.target.value || null })}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Reason (EN)
                <input
                  lang="en"
                  className={`${timeInput} px-3`}
                  value={c.reason_en ?? ""}
                  placeholder="E.g. Annual closure"
                  onChange={(e) => update(index, { reason_en: e.target.value || null })}
                />
              </label>
            </div>
          </li>
        ))}
      </ul>
      <div>
        <button
          type="button"
          className={smallButton}
          onClick={() => setClosures((current) => [...current, { starts_on: "", ends_on: "", reason_fr: null, reason_en: null }])}
        >
          <Plus size={16} aria-hidden /> Ajouter une fermeture
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-favorite">
          {error}
        </p>
      )}
    </div>
  );
}
