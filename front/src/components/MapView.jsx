import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { EVENT_TYPES, THEMES } from '../data/constants.js'

const CENTER = [6.137, 1.222]

export default function MapView({ events, selectedId, onSelect, theme, radius }) {
  const mapRef      = useRef(null)
  const mapInstance = useRef(null)
  const markersRef  = useRef({})
  const circleRef   = useRef(null)

  useEffect(() => {
    if (mapInstance.current) return
    const map = L.map(mapRef.current, { center: CENTER, zoom: 13, zoomControl: true })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CARTO',
      maxZoom: 19,
    }).addTo(map)
    mapInstance.current = map
    return () => { map.remove(); mapInstance.current = null }
  }, [])

  // Update radius circle
  useEffect(() => {
    const map = mapInstance.current
    if (!map) return
    if (circleRef.current) circleRef.current.remove()
    circleRef.current = L.circle(CENTER, {
      radius: radius * 1000,
      color: THEMES[theme].accent,
      fillColor: THEMES[theme].accent,
      fillOpacity: 0.06,
      weight: 2,
      dashArray: '6 4',
    }).addTo(map)
  }, [radius, theme])

  // Update markers
  useEffect(() => {
    const map = mapInstance.current
    if (!map) return
    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}

    const th = THEMES[theme]
    events.forEach(ev => {
      const t = EVENT_TYPES[ev.type]
      const isSelected = ev.id === selectedId
      const size = isSelected ? 44 : 36
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${isSelected ? th.accent : '#fff'};
          border:2.5px solid ${isSelected ? 'rgba(255,255,255,.5)' : t.color};
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 ${isSelected?6:3}px ${isSelected?20:10}px ${isSelected ? t.color+'66' : 'rgba(0,0,0,.15)'};
          cursor:pointer;transition:all .2s;
        "><i class="fa-solid ${t.icon}" style="font-size:${Math.round(size * 0.36)}px;color:${isSelected ? '#fff' : t.color};"></i></div>`,
        iconSize:   [size, size],
        iconAnchor: [size / 2, size / 2],
      })
      const marker = L.marker([ev.lat, ev.lng], { icon })
        .addTo(map)
        .on('click', () => onSelect(ev))
      markersRef.current[ev.id] = marker
    })
  }, [events, selectedId, theme])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}
