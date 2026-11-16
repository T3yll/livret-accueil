"use client";

import { CloudOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { curator } from "@/config/brand";
import { useStay } from "@/lib/use-stay";
import { useOnline, WelcomeVideo } from "./welcome-video";
import { CuratorAvatar } from "./curator-avatar";
import { StayForm } from "./stay-sheet";

const OPEN_EVENT = "welcome-open";
const SEEN_EVENT = "welcome-seen";
const seenKey = (slug: string) => `welcome-seen:${slug}`;
function readSeen(slug: string) {
  try {
    return localStorage.getItem(seenKey(slug)) === "1";
  } catch {
    return true; // stockage indisponible : on n'impose pas l'accueil à chaque page
  }
}

function subscribeSeen(callback: () => void) {
  window.addEventListener(SEEN_EVENT, callback);
  return () => window.removeEventListener(SEEN_EVENT, callback);
}

// Depuis le portrait de Rémi sur l'accueil du livret.
export function openWelcome() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Props = {
  slug: string;
  video: { src: string; lang: string } | null;
  transcript: string | null;
};

// L'accueil personnifié : apparaît une seule fois, à la première ouverture, jamais bloquant.
// Pas de choix de langue : le livret s'ouvre déjà dans celle du téléphone (en-tête Accept-Language,
// lu par le proxy), et le bouton FR/EN reste en haut de page.
export function WelcomeIntro({ slug, ...content }: Props) {
  const seen = useSyncExternalStore(
    subscribeSeen,
    () => readSeen(slug),
    () => true,
  );
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const onOpen = () => setReopened(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  if (seen && !reopened) return null;

  const close = () => {
    try {
      localStorage.setItem(seenKey(slug), "1");
    } catch {
      // stockage indisponible : l'accueil reviendra à la prochaine ouverture
    }
    window.dispatchEvent(new Event(SEEN_EVENT));
    setReopened(false);
  };

  return <WelcomeDialog slug={slug} onClose={close} {...content} />;
}

function WelcomeDialog({
  slug,
  video,
  transcript,
  onClose,
}: Omit<Props, "slug"> & { slug: string; onClose: () => void }) {
  const t = useTranslations("Welcome");
  const dialog = useRef<HTMLDialogElement>(null);
  const { stay, save } = useStay(slug);
  const [step, setStep] = useState<"hello" | "dates">("hello");
  const online = useOnline();
  const showVideo = video !== null && online;

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const skipButton = (
    <button
      type="button"
      onClick={onClose}
      className="min-h-11 rounded-xl px-4 text-[15px] font-semibold text-primary focus-visible:outline-2 focus-visible:outline-primary"
    >
      {t("skip")}
    </button>
  );

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="welcome-title"
      className={`m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-3xl bg-background text-text shadow-2xl backdrop:bg-text/60 backdrop:backdrop-blur-sm ${
        step === "hello" && showVideo ? "p-0" : "p-6"
      }`}
    >
      {step === "hello" ? (
        <div className="flex flex-col items-center text-center">
          {showVideo ? (
            <WelcomeVideo
              src={video.src}
              lang={video.lang}
              label={t("watch", { name: curator.name })}
              title={
                <h2 id="welcome-title" className="text-[26px] leading-tight text-white drop-shadow">
                  {t("greeting", { name: curator.name })}
                </h2>
              }
            />
          ) : (
            <>
              <CuratorAvatar size={64} />
              <h2 id="welcome-title" className="mt-4 text-[28px] leading-tight">
                {t("greeting", { name: curator.name })}
              </h2>
            </>
          )}
          <div className={`flex w-full flex-col gap-1 ${showVideo ? "px-5 pt-3 pb-4" : "pt-4"}`}>
            {video && !online && (
              <p className="flex items-center justify-center gap-2 pb-1 text-sm text-muted">
                <CloudOff size={16} aria-hidden />
                {t("videoOffline")}
              </p>
            )}
            {transcript && (
              <details open={!online} className="pb-2 text-sm">
                <summary className="mx-auto flex min-h-11 w-fit cursor-pointer items-center rounded-lg px-3 font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary">
                  {t("transcript")}
                </summary>
                <p lang={video?.lang} className="max-h-40 overflow-y-auto rounded-xl bg-stone p-3 text-left text-[15px] whitespace-pre-line">
                  {transcript}
                </p>
              </details>
            )}
            {/* Dates déjà connues (lien de l'hébergeur) : on ne repose pas la question. */}
            <button
              type="button"
              onClick={() => (stay ? onClose() : setStep("dates"))}
              className="min-h-12 rounded-xl bg-primary px-4 text-[15px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {stay ? t("start") : t("continue")}
            </button>
            {skipButton}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 id="welcome-title" className="text-center text-[28px] leading-tight">
            {t("datesQuestion")}
          </h2>
          <StayForm
            stay={stay}
            submitLabel={t("datesSubmit")}
            onSubmit={(next) => {
              save(next);
              onClose();
            }}
          />
          {skipButton}
        </div>
      )}
    </dialog>
  );
}
