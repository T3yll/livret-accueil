"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { House, LocateFixed } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { brandColors } from "@/config/brand";
import type { PlaceCategory } from "@/lib/places-view";
import { CATEGORY_ICONS } from "./place-icons";

type MapPlace = { id: string; name: string; lat: number; lng: number; category: PlaceCategory; is_favorite: boolean };

type Props = {
  origin: { lat: number; lng: number } | null;
  places: MapPlace[];
  selectedId: string | null;
  // Le détail du lieu choisi s'affiche hors de la carte (fiche résumée en bas de l'écran).
  onSelect: (id: string | null) => void;
  originLabel: string;
  labels: {
    yourStay: string;
    favorite: string;
    locateMe: string;
    showStay: string;
    youAreHere: string;
    locationDenied: string;
    locationUnavailable: string;
  };
};

type Position = { lat: number; lng: number; accuracy: number };

// Marqueurs de la DA : ronds ivoire, contour vert foncé, icône au centre ;
// pastille terre cuite pour les coups de cœur ; le logement et le lieu choisi en vert plein.
function markerIcon(category: PlaceCategory | "home", favorite: boolean, selected = false) {
  const Icon = category === "home" ? House : CATEGORY_ICONS[category];
  const home = category === "home";
  const filled = home || selected;
  const size = home ? 42 : selected ? 42 : 34;
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
        // Le logement se distingue des lieux choisis par un contour doré (décor, DA).
        border: home ? "3px solid var(--color-accent)" : "2px solid var(--color-primary)",
        background: filled ? "var(--color-primary)" : "var(--color-background)",
        color: filled ? "#fff" : "var(--color-primary)",
        boxShadow: "0 1px 3px rgb(0 0 0 / 0.25)",
      }}
    >
      <Icon size={size > 34 ? 22 : 18} strokeWidth={2} aria-hidden />
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

// Point bleu ardoise (couleur « information » de la DA) pour la position du voyageur.
const meIcon = L.divIcon({
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:var(--color-info);border:3px solid #fff;box-shadow:0 0 0 1px rgb(0 0 0 / 0.2),0 1px 4px rgb(0 0 0 / 0.3)"></span>',
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Position du voyageur en temps réel. Elle ne quitte jamais le téléphone : rien n'est envoyé ni enregistré.
// Le navigateur ne la demande qu'au bouton « Me localiser » ; si l'accès est déjà autorisé, elle s'affiche d'emblée.
function useLivePosition() {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<"denied" | "unavailable" | null>(null);
  const watchId = useRef<number | null>(null);
  const onFirstFix = useRef<((p: Position) => void) | null>(null);

  const start = (then?: (p: Position) => void) => {
    if (!("geolocation" in navigator)) return setError("unavailable");
    onFirstFix.current = then ?? null;
    if (watchId.current !== null) return;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        setPosition(p);
        setError(null);
        onFirstFix.current?.(p);
        onFirstFix.current = null;
      },
      (err) => {
        setError(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
        if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    );
  };

  useEffect(() => {
    let cancelled = false;
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((status) => {
        if (!cancelled && status.state === "granted") start();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return { position, error, start };
}

const mapButton =
  "inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-[0_1px_4px_rgb(0_0_0/0.2)] " +
  "focus-visible:outline-2 focus-visible:outline-primary";

export default function PlacesMap({ origin, places, selectedId, onSelect, originLabel, labels }: Props) {
  const [map, setMap] = useState<L.Map | null>(null);
  const live = useLivePosition();
  const center = origin ?? (places[0] ? { lat: places[0].lat, lng: places[0].lng } : { lat: 44.8, lng: 1.4 });
  const selected = places.find((p) => p.id === selectedId);

  // Cadre la carte sur le logement et toutes les adresses affichées.
  const bounds = useMemo(() => {
    const points: [number, number][] = places.map((p) => [p.lat, p.lng]);
    if (origin) points.push([origin.lat, origin.lng]);
    return points.length > 1 ? L.latLngBounds(points) : undefined;
  }, [places, origin]);

  const locate = () => {
    if (live.position) map?.setView([live.position.lat, live.position.lng], Math.max(map.getZoom(), 14));
    else live.start((p) => map?.setView([p.lat, p.lng], Math.max(map.getZoom(), 14)));
  };

  return (
    <div className="relative size-full">
      <MapContainer
        ref={setMap}
        // Recrée la carte quand les filtres changent, pour recadrer sur les adresses visibles.
        key={places.map((p) => p.id).join(",")}
        center={[center.lat, center.lng]}
        zoom={13}
        className="places-map size-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToPlaces bounds={bounds} />
        <ClearSelectionOnMapClick onClear={() => onSelect(null)} />
        <PanToSelected place={selected} />
        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={markerIcon("home", false)} title={labels.yourStay} zIndexOffset={500}>
            {/* Nom du logement affiché en permanence : on le repère d'un coup d'œil. */}
            <Tooltip permanent direction="bottom" offset={[0, 22]} className="font-sans font-semibold">
              {originLabel}
            </Tooltip>
          </Marker>
        )}
        {live.position && (
          <>
            <Circle
              center={[live.position.lat, live.position.lng]}
              radius={live.position.accuracy}
              pathOptions={{ color: brandColors.info, weight: 1, fillOpacity: 0.12 }}
              interactive={false}
            />
            <Marker position={[live.position.lat, live.position.lng]} icon={meIcon} title={labels.youAreHere} interactive={false} zIndexOffset={2000} />
          </>
        )}
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
      {/* Boutons de recentrage, sous les filtres, à droite (le zoom est à gauche). */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button type="button" onClick={locate} aria-label={labels.locateMe} title={labels.locateMe} className={mapButton}>
          <LocateFixed size={20} aria-hidden />
        </button>
        {origin && (
          <button
            type="button"
            onClick={() => map?.setView([origin.lat, origin.lng], Math.max(map.getZoom(), 14))}
            aria-label={labels.showStay}
            title={labels.showStay}
            className={mapButton}
          >
            <House size={20} aria-hidden />
          </button>
        )}
      </div>
      {live.error && (
        <p role="status" className="absolute top-3 right-16 left-16 z-[1000] rounded-xl bg-surface px-3 py-2 text-sm shadow-[0_1px_4px_rgb(0_0_0/0.2)]">
          {live.error === "denied" ? labels.locationDenied : labels.locationUnavailable}
        </p>
      )}
    </div>
  );
}
