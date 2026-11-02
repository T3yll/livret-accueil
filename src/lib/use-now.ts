"use client";

import { useEffect, useState } from "react";

// Heure courante côté navigateur. Le premier rendu reprend l'heure du serveur (pas d'écart
// à l'hydratation), puis on passe à l'heure réelle : indispensable quand la page vient du
// cache hors connexion et a pu être rendue la veille. Mise à jour chaque minute ensuite.
export function useNow(serverIso: string): Date {
  const [now, setNow] = useState(() => new Date(serverIso));
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);
  return now;
}
