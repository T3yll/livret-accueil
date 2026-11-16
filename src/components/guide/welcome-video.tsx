"use client";

import { Play, RotateCcw } from "lucide-react";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CuratorAvatar } from "./curator-avatar";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

// La vidéo n'est pas gardée hors connexion (trop lourde) : sans réseau, l'accueil revient au portrait.
export function useOnline() {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

type Props = { src: string; lang: string; label: string; title: ReactNode };

// Vidéo d'accueil en haut de la fenêtre, bord à bord, façon « story ». Rien n'est téléchargé avant
// la lecture (preload="metadata", « #t=0.1 » pour afficher la première image). Pas de commandes natives :
// un grand bouton lecture, un appui sur la vidéo la met en pause, une fine barre montre l'avancement.
// À l'arrêt, le portrait et le titre s'affichent en bas de l'image.
export function WelcomeVideo({ src, lang, label, title }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"idle" | "playing" | "paused" | "ended">("idle");
  const [progress, setProgress] = useState(0);
  const playing = state === "playing";

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => setState("paused"));
    else el.pause();
  };

  return (
    <div className="relative h-[52dvh] max-h-[560px] min-h-64 w-full overflow-hidden bg-text">
      <video
        ref={video}
        playsInline
        preload="metadata"
        src={`${src}#t=0.1`}
        lang={lang}
        aria-label={label}
        onClick={toggle}
        onPlay={() => setState("playing")}
        onPause={(e) => !e.currentTarget.ended && setState("paused")}
        onEnded={() => setState("ended")}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration) setProgress(el.currentTime / el.duration);
        }}
        className="h-full w-full object-cover"
      />

      {/* Voile, portrait et titre : visibles tant que la vidéo ne joue pas. */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20 transition-opacity duration-300 ${
          playing ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-3 px-5 pb-5 text-left text-white transition-opacity duration-300 ${
          playing ? "opacity-0" : "opacity-100"
        }`}
      >
        <CuratorAvatar size={44} />
        {title}
      </div>

      {!playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label={label}
          className="absolute top-[62%] left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg backdrop-blur transition-transform active:scale-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {state === "ended" ? <RotateCcw size={28} aria-hidden /> : <Play size={30} className="ml-1" fill="currentColor" aria-hidden />}
        </button>
      )}

      {state !== "idle" && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/25" aria-hidden>
          <div className="h-full bg-white" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
    </div>
  );
}
