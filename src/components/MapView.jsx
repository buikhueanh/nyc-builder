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

export default function MapView({ parties, onPinClick, focus }) {
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

  // Fly to a requested location (e.g. a just-added party). The center is shifted
  // so the pin stays visible beside the SidePanel (right on desktop, bottom sheet
  // on mobile) instead of hiding underneath it.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !focus?.coordinates) return
    const { lat, lng } = focus.coordinates
    const zoom = Math.max(map.getZoom(), 15)
    const size = map.getSize()
    const point = map.project([lat, lng], zoom)
    if (window.matchMedia('(min-width: 768px)').matches) {
      point.x += Math.min(size.x * 0.22, 220) // desktop: panel on the right
    } else {
      point.y -= Math.min(size.y * 0.22, 180) // mobile: bottom sheet
    }
    map.flyTo(map.unproject(point, zoom), zoom, { duration: 0.8 })
  }, [focus])

  return <div ref={containerRef} className="h-full w-full" aria-label="Watch party map" />
}
