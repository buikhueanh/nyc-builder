export const NYC_FALLBACK = { lat: 40.7128, lng: -74.006 }

// Address → coordinates via free Nominatim (OpenStreetMap). No API key needed.
// Always resolves: falls back to NYC center on no-result or any error.
export async function geocodeAddress(address) {
  const encoded = encodeURIComponent(`${address}, New York City`)
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    })
    const data = await response.json()
    if (!Array.isArray(data) || data.length === 0) {
      return { ...NYC_FALLBACK }
    }
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    }
  } catch {
    return { ...NYC_FALLBACK }
  }
}
