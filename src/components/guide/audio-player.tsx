"use client";

import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

const clock = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// Lecteur sobre, aux couleurs de la DA. preload="none" : rien n'est téléchargé tant qu'on n'écoute pas
// (réseau faible) ; l'enregistrement hors connexion est géré par le service worker.
export function AudioPlayer({ src, lang, title, transcript }: { src: string; lang: string; title: string; transcript?: string | null }) {
  const t = useTranslations("Welcome");
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-3 rounded-2xl bg-stone p-2 pr-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? t("pause") : title}
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {playing ? <Pause size={22} fill="currentColor" aria-hidden /> : <Play size={22} fill="currentColor" className="ml-0.5" aria-hidden />}
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={current}
            aria-label={title}
            onChange={(e) => {
              const value = Number(e.target.value);
              setCurrent(value);
              if (audio.current) audio.current.currentTime = value;
            }}
            className="h-6 w-full accent-primary"
          />
          <span className="text-sm text-muted tabular-nums">
            {clock(current)}
            {duration > 0 && ` / ${clock(duration)}`}
          </span>
        </div>
      </div>
      <audio
        ref={audio}
        src={src}
        lang={lang}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
      />
      {transcript && (
        <details className="text-left text-sm">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-primary">{t("transcript")}</summary>
          <p lang={lang} className="pb-2 whitespace-pre-line">
            {transcript}
          </p>
        </details>
      )}
    </div>
  );
}
