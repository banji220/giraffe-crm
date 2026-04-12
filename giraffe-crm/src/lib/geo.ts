/**
 * Mapbox reverse geocoding and address utilities.
 * Used when the user taps the map to create a new house —
 * we turn their tap coordinates into a real street address.
 */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

export interface GeocodedAddress {
  streetNumber: string
  streetName: string
  city: string
  state: string
  postalCode: string
  fullAddress: string
  /** Snapped coordinates — center of the matched address (more accurate than tap) */
  snappedLng: number | null
  snappedLat: number | null
}

/**
 * Reverse geocode a lat/lng to a street address via Mapbox.
 * Returns null if the geocode fails or returns no results.
 */
export async function reverseGeocode(
  lng: number,
  lat: number
): Promise<GeocodedAddress | null> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=address&limit=1&access_token=${MAPBOX_TOKEN}`
    const res = await fetch(url)

    if (!res.ok) return null

    const data = await res.json()

    if (!data.features || data.features.length === 0) return null

    const feature = data.features[0]
    const context = feature.context || []

    // Extract address components from Mapbox's context array
    const getComponent = (id: string): string =>
      context.find((c: any) => c.id.startsWith(id))?.text ?? ''

    // Use Mapbox's snapped center point — this is on the actual building/parcel,
    // not wherever the user's finger happened to land
    const center = feature.center as [number, number] | undefined

    return {
      streetNumber: feature.address ?? '',
      streetName: feature.text ?? '',
      city: getComponent('place'),
      state: getComponent('region'),
      postalCode: getComponent('postcode'),
      fullAddress: feature.place_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      snappedLng: center?.[0] ?? null,
      snappedLat: center?.[1] ?? null,
    }
  } catch {
    return null
  }
}

/**
 * Build a short display address from components.
 * "1119 E Balboa Blvd" — no city/state, for tight UI spaces.
 */
export function shortAddress(streetNumber: string | null, streetName: string | null): string {
  if (streetNumber && streetName) return `${streetNumber} ${streetName}`
  if (streetName) return streetName
  return 'Unknown address'
}
