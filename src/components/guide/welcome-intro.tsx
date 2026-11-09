"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { curator } from "@/config/brand";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { useStay } from "@/lib/use-stay";
import { AudioPlayer } from "./audio-player";
import { CuratorAvatar } from "./curator-avatar";
import { StayForm } from "./stay-sheet";

const OPEN_EVENT = "welcome-open";
const SEEN_EVENT = "welcome-seen";
const seenKey = (slug: string) => `welcome-seen:${slug}`;
// Le changement de langue recharge la page : on retient qu'il faut reprendre après le choix de langue.
const resumeKey = (slug: string) => `welcome-resume:${slug}`;

function takeResume(slug: string) {
  try {
    const resume = sessionStorage.getItem(resumeKey(slug)) === "1";
    sessionStorage.removeItem(resumeKey(slug));
    return resume;
  } catch {
    return false;
  }
}

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
  // Première ouverture : la langue d'abord. Réouverture ou retour après le choix : directement le message.
  const [startStep, setStartStep] = useState<"language" | "hello">("language");

  useEffect(() => {
    const resume = setTimeout(() => {
      if (takeResume(slug)) setStartStep("hello");
    }, 0);
    const onOpen = () => {
      setStartStep("hello");
      setReopened(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      clearTimeout(resume);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [slug]);

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

  return <WelcomeDialog key={startStep} slug={slug} startStep={startStep} onClose={close} {...content} />;
}

function WelcomeDialog({
  slug,
  hosts,
  audio,
  transcript,
  startStep,
  onClose,
}: Omit<Props, "slug"> & { slug: string; startStep: "language" | "hello"; onClose: () => void }) {
  const t = useTranslations("Welcome");
  const tLanguage = useTranslations("LanguageSwitcher");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const dialog = useRef<HTMLDialogElement>(null);
  const { stay, save } = useStay(slug);
  const [step, setStep] = useState<"language" | "hello" | "dates">(startStep);

  const chooseLanguage = (code: Locale) => {
    if (code === locale) return setStep("hello");
    try {
      sessionStorage.setItem(resumeKey(slug), "1");
    } catch {
      // sans stockage, l'accueil repartira du choix de langue : pas grave
    }
    // @ts-expect-error -- les params de la route courante sont valides pour cette route
    router.replace({ pathname, params }, { locale: code });
  };

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
      {step === "language" ? (
        <div className="flex flex-col items-center gap-5 text-center">
          <CuratorAvatar size={72} />
          <h2 id="welcome-title" className="text-[28px] leading-tight">
            {t("chooseLanguage")}
          </h2>
          <div className="flex w-full flex-col gap-2">
            {routing.locales.map((code) => (
              <button
                key={code}
                type="button"
                lang={code}
                onClick={() => chooseLanguage(code)}
                className="min-h-14 rounded-xl border-2 border-border bg-surface px-4 text-lg font-semibold hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {tLanguage(code)}
              </button>
            ))}
          </div>
        </div>
      ) : step === "hello" ? (
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
