/**
 * Public geocode for Wahdat Colony, Multan. Used only until a pin is saved.
 */
export const WAHDAT_COLONY_PIN = { lat: 30.2054412, lng: 71.4892754 };

export interface MapPin {
  lat: number;
  lng: number;
}

export function mapsQuery(address: string): string {
  const trimmed = address.trim();
  return /pakistan/i.test(trimmed) ? trimmed : `${trimmed}, Pakistan`;
}

export function isValidMapPin(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function isStudioAddress(address: string): boolean {
  return /wahdat/i.test(address) && /multan/i.test(address);
}

/** Saved coordinates win. Otherwise the Multan studio neighborhood is the starting pin. */
export function activeMapPin(address: string, lat?: number, lng?: number): MapPin {
  if (isValidMapPin(lat, lng)) return { lat, lng: lng as number };
  if (isStudioAddress(address)) return WAHDAT_COLONY_PIN;
  return WAHDAT_COLONY_PIN;
}

export function googleMapsEmbedUrl(address: string, pin?: MapPin | null): string {
  const label = encodeURIComponent(mapsQuery(address));
  const point = pin && isValidMapPin(pin.lat, pin.lng) ? pin : isStudioAddress(address) ? WAHDAT_COLONY_PIN : null;
  if (point) {
    return `https://maps.google.com/maps?q=${point.lat},${point.lng}+(${label})&z=17&hl=en&output=embed`;
  }
  return `https://maps.google.com/maps?q=${label}&z=16&hl=en&output=embed`;
}

export function googleMapsPlaceUrl(address: string, pin?: MapPin | null): string {
  if (pin && isValidMapPin(pin.lat, pin.lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${pin.lat},${pin.lng}`;
  }
  if (isStudioAddress(address)) {
    return `https://www.google.com/maps/search/?api=1&query=${WAHDAT_COLONY_PIN.lat},${WAHDAT_COLONY_PIN.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery(address))}`;
}

export function googleMapsDirectionsUrl(address: string, pin?: MapPin | null): string {
  if (pin && isValidMapPin(pin.lat, pin.lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`;
  }
  if (isStudioAddress(address)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${WAHDAT_COLONY_PIN.lat},${WAHDAT_COLONY_PIN.lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery(address))}`;
}
