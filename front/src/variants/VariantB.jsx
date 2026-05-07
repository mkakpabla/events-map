import { useState, useMemo } from 'react'
import Icon from '../components/Icon.jsx'
import MapView from '../components/MapView.jsx'
import EventDetail from '../components/EventDetail/index.jsx'
import { EVENT_TYPES, THEMES } from '../data/constants.js'
import { formatDate } from '../utils/helpers.js'
import { useNearbyEvents } from '../hooks/useEvents.js'

export default function VariantB({ theme, showTypes, popupDesign }) {
  const th = THEMES[theme]
  const [search, setSearch]           = useState('')
  const [activeTypes, setActiveTypes] = useState([])
  const [radius, setRadius]           = useState(10)
  const [selectedEv, setSelectedEv]   = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const { events: rawEvents, loading } = useNearbyEvents({ radius })

  const filtered = useMemo(() => {
    return rawEvents.filter(ev => {
      if (activeTypes.length && !activeTypes.includes(ev.type)) return false
      if (search && !ev.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [rawEvents, activeTypes, search])

  const toggleType = t => setActiveTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])

  return (
    <div style={{ position: 'relative', height: '100%', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <MapView events={filtered} selectedId={selectedEv?.id} onSelect={e => { setSelectedEv(e); setShowFilters(false) }} theme={theme} radius={radius} />
      </div>

      {/* TOP BAR */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16, zIndex: 500,
        background: 'rgba(255,255,255,.96)',
        backdropFilter: 'blur(12px)',
        borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.12)',
        padding: '12px 16px',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: th.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="mappin" size={16} color="#fff" />
          </div>
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
              <Icon name="search" size={14} color={th.muted} />
            </div>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 9, border: `1.5px solid ${th.border}`, background: th.bg, fontSize: 13, outline: 'none', color: th.text }}
            />
          </div>
          <button
            onClick={() => { setShowFilters(p => !p); setSelectedEv(null) }}
            style={{
              padding: '8px 12px', borderRadius: 9, border: `1.5px solid ${showFilters ? th.accent : th.border}`,
              background: showFilters ? th.light : '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13,
              color: showFilters ? th.accent : th.text,
            }}
          >
            <Icon name="sliders" size={14} color={showFilters ? th.accent : th.text} />
            Filtres {activeTypes.length > 0 ? `(${activeTypes.length})` : ''}
          </button>
        </div>

        {showTypes && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}>
            {Object.entries(EVENT_TYPES).map(([key, val]) => {
              const active = activeTypes.includes(key)
              return (
                <button key={key} onClick={() => toggleType(key)} style={{
                  padding: '4px 10px', borderRadius: 20, border: `1.5px solid ${active ? val.color : th.border}`,
                  background: active ? val.color + '18' : '#fff',
                  color: active ? val.color : th.pillText,
                  fontWeight: active ? 700 : 500, fontSize: 12, cursor: 'pointer',
                  whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Icon name={val.icon} size={11} color={active ? val.color : th.pillText} /> {val.label}
                </button>
              )
            })}
          </div>
        )}

        {showFilters && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${th.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: th.muted, textTransform: 'uppercase', marginBottom: 8 }}>Rayon</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="range" min={1} max={30} value={radius} onChange={e => setRadius(+e.target.value)} style={{ flex: 1, accentColor: th.accent }} />
              <span style={{ fontWeight: 700, color: th.accent, fontSize: 14, minWidth: 40 }}>{radius} km</span>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SHEET */}
      {!selectedEv && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 500,
          background: 'rgba(255,255,255,.96)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 24px rgba(0,0,0,.12)',
          maxHeight: '42%',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '12px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${th.border}` }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: th.text }}>{filtered.length} événement{filtered.length !== 1 ? 's' : ''} à proximité</span>
            <span style={{ fontSize: 12, color: th.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="locate" size={12} color={th.muted} />≤ {radius}km
            </span>
          </div>
          <div style={{ overflowX: 'auto', display: 'flex', gap: 12, padding: '12px 16px', flex: 1 }}>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', color: th.muted, fontSize: 13, padding: '0 8px' }}>Chargement…</div>
            )}
            {!loading && filtered.map(ev => {
              const t = EVENT_TYPES[ev.type]
              return (
                <div key={ev.id} onClick={() => setSelectedEv(ev)} style={{
                  minWidth: 180, background: th.card, borderRadius: 12, border: `1.5px solid ${th.border}`,
                  padding: '12px', cursor: 'pointer', flexShrink: 0,
                }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `linear-gradient(135deg,${t.color}18,${t.color}35)`, border: `1.5px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6, flexShrink: 0, boxShadow: `0 2px 8px ${t.color}25` }}>
                    <Icon name={t.icon} size={18} color={t.color} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: th.text, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</div>
                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: t.color + '18', color: t.color, fontWeight: 600 }}>{t.label}</span>
                  <div style={{ fontSize: 11, color: th.muted, marginTop: 6 }}>{ev.dist.toFixed(1)}km • {formatDate(ev.date)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {selectedEv && <EventDetail ev={selectedEv} onClose={() => setSelectedEv(null)} theme={theme} popupDesign={popupDesign} />}
    </div>
  )
}
