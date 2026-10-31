"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { House } from "lucide-react";
import { useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "@/i18n/navigation";
import type { PlaceCategory } from "@/lib/places-view";
import { CATEGORY_ICONS } from "./place-icons";

type MapPlace = { id: string; name: string; lat: number; lng: number; category: PlaceCategory; is_favorite: boolean };

type Props = {
  slug: string;
  origin: { lat: number; lng: number } | null;
  places: MapPlace[];
  labels: { yourStay: string; seeDetails: string; favorite: string };
};

// Marqueurs de la DA : ronds ivoire, contour vert foncé, icône au centre ;
// pastille terre cuite pour les coups de cœur ; le logement en vert plein.
function markerIcon(category: PlaceCategory | "home", favorite: boolean) {
  const Icon = category === "home" ? House : CATEGORY_ICONS[category];
  const home = category === "home";
  const html = renderToStaticMarkup(
    <span
      style={{
        position: "relative",
        display: "flex",
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9999px",
        border: "2px solid var(--color-primary)",
        background: home ? "var(--color-primary)" : "var(--color-background)",
        color: home ? "#fff" : "var(--color-primary)",
        boxShadow: "0 1px 3px rgb(0 0 0 / 0.25)",
      }}
    >
      <Icon size={18} strokeWidth={2} aria-hidden />
      {favorite && (
        <span
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            width: 12,
            height: 12,
            borderRadius: "9999px",
            background: "var(--color-favorite)",
            border: "2px solid #fff",
          }}
        />
      )}
    </span>,
  );
  return L.divIcon({ html, className: "", iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -18] });
}

export default function PlacesMap({ slug, origin, places, labels }: Props) {
  const center = origin ?? (places[0] ? { lat: places[0].lat, lng: places[0].lng } : { lat: 44.8, lng: 1.4 });

  // Cadre la carte sur le logement et toutes les adresses affichées.
  const bounds = useMemo(() => {
    const points: [number, number][] = places.map((p) => [p.lat, p.lng]);
    if (origin) points.push([origin.lat, origin.lng]);
    return points.length > 1 ? L.latLngBounds(points) : undefined;
  }, [places, origin]);

  return (
    <div className="h-[60dvh] min-h-80 overflow-hidden rounded-2xl border border-border">
      <MapContainer
        // Recrée la carte quand les filtres changent, pour recadrer sur les adresses visibles.
        key={places.map((p) => p.id).join(",")}
        // Avec un centre, react-leaflet ignore le cadrage : on ne le donne que pour un point seul.
        center={bounds ? undefined : [center.lat, center.lng]}
        zoom={bounds ? undefined : 13}
        bounds={bounds}
        // Marge pour qu'aucun marqueur ne passe sous les boutons de zoom ou au bord.
        boundsOptions={{ padding: [48, 48] }}
        scrollWheelZoom={false}
        className="size-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={markerIcon("home", false)} title={labels.yourStay}>
            <Popup>{labels.yourStay}</Popup>
          </Marker>
        )}
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={markerIcon(place.category, place.is_favorite)}
            title={place.is_favorite ? `${place.name} · ${labels.favorite}` : place.name}
          >
            <Popup>
              <span className="flex flex-col gap-1 font-sans">
                <strong className="text-base">{place.name}</strong>
                {place.is_favorite && <span className="text-favorite">{labels.favorite}</span>}
                <Link href={`/g/${slug}/places/${place.id}`} className="font-semibold text-primary underline">
                  {labels.seeDetails}
                </Link>
              </span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
