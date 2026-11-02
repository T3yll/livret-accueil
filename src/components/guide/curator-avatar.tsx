import Image from "next/image";
import { curator } from "@/config/brand";

// Portrait de la personne qui signe les coups de cœur ; sans photo, son initiale.
// Cercle doré : décor (l'or n'est jamais utilisé pour du texte).
export function CuratorAvatar({ size = 40 }: { size?: number }) {
  const ring = "shrink-0 rounded-full ring-2 ring-accent ring-offset-2 ring-offset-background";
  if (curator.photo) {
    return <Image src={curator.photo} alt="" width={size} height={size} className={`${ring} object-cover`} style={{ width: size, height: size }} />;
  }
  return (
    <span
      aria-hidden
      className={`${ring} inline-flex items-center justify-center bg-primary font-heading text-white`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {curator.name.charAt(0)}
    </span>
  );
}
