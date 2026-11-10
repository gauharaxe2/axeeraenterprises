/**
 * Public geocode for Wahdat Colony, Multan — the neighborhood of the
 * published headquarters at D-26. Google Maps uses this pin when the
 * address is that studio. A different address is searched by name.
 */
export const WAHDAT_COLONY_PIN = { lat: 30.2054412, lng: 71.4892754 };

export function mapsQuery(address: string): string {
  const trimmed = address.trim();
  return /pakistan/i.test(trimmed) ? trimmed : `${trimmed}, Pakistan`;
}

function isStudioAddress(address: string): boolean {
  return /wahdat/i.test(address) && /multan/i.test(address);
}

export function googleMapsEmbedUrl(address: string): string {
  const label = encodeURIComponent(mapsQuery(address));
  if (isStudioAddress(address)) {
    const { lat, lng } = WAHDAT_COLONY_PIN;
    return `https://maps.google.com/maps?q=${lat},${lng}+(${label})&z=16&hl=en&output=embed`;
  }
  return `https://maps.google.com/maps?q=${label}&z=16&hl=en&output=embed`;
}

export function googleMapsPlaceUrl(address: string): string {
  if (isStudioAddress(address)) {
    const { lat, lng } = WAHDAT_COLONY_PIN;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery(address))}`;
}

export function googleMapsDirectionsUrl(address: string): string {
  if (isStudioAddress(address)) {
    const { lat, lng } = WAHDAT_COLONY_PIN;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery(address))}`;
}
