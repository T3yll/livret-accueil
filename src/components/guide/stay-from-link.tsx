"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { parseStay } from "@/lib/stay";
import { saveStay, todayInParis } from "@/lib/use-stay";

// Dates reçues par le lien (…/g/<slug>?du=2026-12-12&au=2026-12-15), mises par l'hébergeur dans
// son message de pré-séjour. Une fois retenues, elles sortent de l'adresse : recharger la page
// n'écrase pas une modification faite ensuite par le voyageur.
export function StayFromLink({ slug }: { slug: string }) {
  const params = useSearchParams();
  const from = params.get("du");
  const to = params.get("au");

  useEffect(() => {
    if (from === null && to === null) return;
    const stay = parseStay(from, to, todayInParis());
    if (stay) saveStay(slug, stay);

    const url = new URL(window.location.href);
    url.searchParams.delete("du");
    url.searchParams.delete("au");
    window.history.replaceState(null, "", url);
  }, [slug, from, to]);

  return null;
}
