// Distance à vol d'oiseau (formule de haversine), en kilomètres.
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// « 800 m », « 4,2 km », « 12 km » (format de la langue).
export function formatDistance(km: number, locale: string): string {
  const format = (value: number, unit: "meter" | "kilometer", digits: number) =>
    new Intl.NumberFormat(locale, { style: "unit", unit, maximumFractionDigits: digits }).format(value);
  if (km < 1) return format(Math.round((km * 1000) / 50) * 50, "meter", 0);
  return format(km, "kilometer", km < 10 ? 1 : 0);
}
