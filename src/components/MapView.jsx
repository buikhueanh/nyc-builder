import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getTeamColor } from '../data/teams.js'

const NYC_CENTER = [40.7128, -74.006]

// Build an emoji "teardrop" divIcon colored by the team the host cheers for.
function makeIcon(party) {
  const emoji = party.hostType === 'restaurant' ? '🍽️' : '🏠'
  const color = getTeamColor(party.teamCheering)
  return L.divIcon({
    className: '', // avoid Leaflet's default styling
    html: `<div class="wp-pin" style="border-color:${color}"><span>${emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  })
}

export default function MapView({ parties, onPinClick }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const onPinClickRef = useRef(onPinClick)
  onPinClickRef.current = onPinClick

  // Initialize the map once.
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    const map = L.map(containerRef.current, {
      center: NYC_CENTER,
      zoom: 12,
      zoomControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Re-render markers whenever the (filtered) parties change.
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    layer.clearLayers()
    parties.forEach((party) => {
      const { lat, lng } = party.coordinates
      L.marker([lat, lng], { icon: makeIcon(party), title: party.hostName })
        .addTo(layer)
        .on('click', () => onPinClickRef.current?.(party))
    })
  }, [parties])

  return <div ref={containerRef} className="h-full w-full" aria-label="Watch party map" />
}
