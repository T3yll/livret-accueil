"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { House } from "lucide-react";
import { useEffect, useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { PlaceCategory } from "@/lib/places-view";
import { CATEGORY_ICONS } from "./place-icons";

type MapPlace = { id: string; name: string; lat: number; lng: number; category: PlaceCategory; is_favorite: boolean };

type Props = {
  origin: { lat: number; lng: number } | null;
  places: MapPlace[];
  selectedId: string | null;
  // Le détail du lieu choisi s'affiche hors de la carte (fiche résumée en bas de l'écran).
  onSelect: (id: string | null) => void;
  labels: { yourStay: string; favorite: string };
};

// Marqueurs de la DA : ronds ivoire, contour vert foncé, icône au centre ;
// pastille terre cuite pour les coups de cœur ; le logement et le lieu choisi en vert plein.
function markerIcon(category: PlaceCategory | "home", favorite: boolean, selected = false) {
  const Icon = category === "home" ? House : CATEGORY_ICONS[category];
  const filled = category === "home" || selected;
  const size = selected ? 42 : 34;
  const html = renderToStaticMarkup(
    <span
      style={{
        position: "relative",
        display: "flex",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9999px",
        border: "2px solid var(--color-primary)",
        background: filled ? "var(--color-primary)" : "var(--color-background)",
        color: filled ? "#fff" : "var(--color-primary)",
        boxShadow: "0 1px 3px rgb(0 0 0 / 0.25)",
      }}
    >
      <Icon size={selected ? 22 : 18} strokeWidth={2} aria-hidden />
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
  return L.divIcon({ html, className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

// Toucher le fond de carte referme la fiche résumée.
function ClearSelectionOnMapClick({ onClear }: { onClear: () => void }) {
  useMapEvents({ click: onClear });
  return null;
}

// Cadre la carte sur le logement et les adresses affichées une fois le conteneur à sa taille finale
// (en plein écran, il n'a pas encore sa hauteur quand Leaflet s'initialise).
function FitToPlaces({ bounds }: { bounds: L.LatLngBounds | undefined }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    // Marge pour qu'aucun marqueur ne passe sous les boutons de zoom ou au bord.
    if (bounds) map.fitBounds(bounds, { padding: [24, 24] });
  }, [map, bounds]);
  return null;
}

// Amène le lieu choisi au centre, pour qu'il ne reste pas caché sous la fiche résumée.
function PanToSelected({ place }: { place: MapPlace | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (!place) return;
    // Centre un peu au-dessus du milieu : la fiche occupe le bas de l'écran.
    const point = map.project([place.lat, place.lng]).add([0, map.getSize().y * 0.2]);
    map.panTo(map.unproject(point), { animate: true });
  }, [map, place]);
  return null;
}

export default function PlacesMap({ origin, places, selectedId, onSelect, labels }: Props) {
  const center = origin ?? (places[0] ? { lat: places[0].lat, lng: places[0].lng } : { lat: 44.8, lng: 1.4 });
  const selected = places.find((p) => p.id === selectedId);

  // Cadre la carte sur le logement et toutes les adresses affichées.
  const bounds = useMemo(() => {
    const points: [number, number][] = places.map((p) => [p.lat, p.lng]);
    if (origin) points.push([origin.lat, origin.lng]);
    return points.length > 1 ? L.latLngBounds(points) : undefined;
  }, [places, origin]);

  return (
    <MapContainer
      // Recrée la carte quand les filtres changent, pour recadrer sur les adresses visibles.
      key={places.map((p) => p.id).join(",")}
      center={[center.lat, center.lng]}
      zoom={13}
      className="size-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToPlaces bounds={bounds} />
      <ClearSelectionOnMapClick onClear={() => onSelect(null)} />
      <PanToSelected place={selected} />
      {origin && <Marker position={[origin.lat, origin.lng]} icon={markerIcon("home", false)} title={labels.yourStay} />}
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={markerIcon(place.category, place.is_favorite, place.id === selectedId)}
          title={place.is_favorite ? `${place.name} · ${labels.favorite}` : place.name}
          // Le lieu choisi passe au premier plan des marqueurs voisins.
          zIndexOffset={place.id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(place.id) }}
        />
      ))}
    </MapContainer>
  );
}
