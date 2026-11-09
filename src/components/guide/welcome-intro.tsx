"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { curator } from "@/config/brand";
import { useStay } from "@/lib/use-stay";
import { AudioPlayer } from "./audio-player";
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
  hosts: string | null;
  audio: { src: string; lang: string } | null;
  transcript: string | null;
};

// L'accueil personnifié : apparaît une seule fois, à la première ouverture, jamais bloquant.
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

function WelcomeDialog({ slug, hosts, audio, transcript, onClose }: Omit<Props, "slug"> & { slug: string; onClose: () => void }) {
  const t = useTranslations("Welcome");
  const dialog = useRef<HTMLDialogElement>(null);
  const { stay, save } = useStay(slug);
  const [step, setStep] = useState<"hello" | "dates">("hello");

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
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-background p-6 text-text backdrop:bg-text/50"
    >
      {step === "hello" ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <CuratorAvatar size={88} />
          <h2 id="welcome-title" className="text-[28px] leading-tight">
            {t("greeting", { name: curator.name })}
          </h2>
          <p>{hosts ? t("intro", { hosts }) : t("introNoHosts")}</p>
          {audio && <AudioPlayer src={audio.src} lang={audio.lang} title={t("listen", { name: curator.name })} transcript={transcript} />}
          <div className="flex w-full flex-col gap-1">
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
