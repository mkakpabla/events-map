import { useState, useMemo } from 'react'
import Icon from '../components/Icon.jsx'
import MapView from '../components/MapView.jsx'
import EventCard from '../components/EventCard.jsx'
import EventDetail from '../components/EventDetail/index.jsx'
import { EVENT_TYPES, THEMES } from '../data/constants.js'
import { useNearbyEvents } from '../hooks/useEvents.js'

export default function VariantC({ theme, compact, showTypes, popupDesign }) {
  const th = THEMES[theme]
  const [search, setSearch]           = useState('')
  const [activeTypes, setActiveTypes] = useState([])
  const [radius, setRadius]           = useState(15)
  const [selectedEv, setSelectedEv]   = useState(null)
  const [viewMode, setViewMode]       = useState('split')
  const [dateFrom, setDateFrom]       = useState('')

  const { events: rawEvents, loading } = useNearbyEvents({ radius, dateFrom })

  const filtered = useMemo(() => {
    return rawEvents.filter(ev => {
      if (activeTypes.length && !activeTypes.includes(ev.type)) return false
      if (search && !ev.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [rawEvents, activeTypes, search])

  const toggleType = t => setActiveTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: th.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* NAV */}
      <header style={{
        background: '#ffffff',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', gap: 14, height: 60, flexShrink: 0, zIndex: 10,
        boxShadow: `0 2px 12px rgba(0,0,0,.07)`,
        borderBottom: `1px solid ${th.border}`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Orbes décoratifs */}
        <div style={{
          position: 'absolute', top: -30, right: 80, width: 120, height: 120,
          borderRadius: '50%', background: `${th.accent}08`, pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0, position: 'relative' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: th.light,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 2px 8px ${th.ring}`,
          }}>
            <Icon name="mappin" size={16} color={th.accent} />
          </div>
          <span style={{ fontWeight: 900, fontSize: 17, color: th.text, letterSpacing: '-0.4px' }}>EventMap</span>
        </div>

        <div style={{ flex: 1, maxWidth: 440, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
            <Icon name="search" size={14} color={th.muted} />
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, lieu..."
            style={{
              width: '100%', padding: '9px 12px 9px 33px',
              borderRadius: 10, border: `1.5px solid ${th.border}`,
              background: th.bg,
              fontSize: 13, outline: 'none', color: th.text,
              fontFamily: 'inherit',
            }} />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: th.bg, borderRadius: 9,
          border: `1.5px solid ${th.border}`, padding: '7px 10px',
        }}>
          <Icon name="calendar" size={14} color={th.muted} />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{
              border: 'none', background: 'transparent',
              fontSize: 13, color: th.text, outline: 'none',
              fontFamily: 'inherit',
            }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="locate" size={14} color={th.muted} />
          <input type="range" min={1} max={30} value={radius} onChange={e => setRadius(+e.target.value)} style={{ width: 80, accentColor: th.accent }} />
          <span style={{ fontWeight: 800, color: th.accent, fontSize: 13, minWidth: 36 }}>{radius}km</span>
        </div>

        <div style={{ display: 'flex', gap: 2, background: th.pill, borderRadius: 9, padding: 3 }}>
          {[{ k: 'split', icon: 'layers' }, { k: 'map', icon: 'mappin' }, { k: 'list', icon: 'list' }].map(({ k, icon }) => (
            <button key={k} onClick={() => setViewMode(k)} style={{
              padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: viewMode === k ? '#fff' : 'transparent',
              color: viewMode === k ? th.accent : th.muted,
              boxShadow: viewMode === k ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
            }}>
              <Icon name={icon} size={15} />
            </button>
          ))}
        </div>

        <button style={{ padding: '7px', borderRadius: 9, border: `1.5px solid ${th.border}`, background: th.bg, cursor: 'pointer', position: 'relative' }}>
          <Icon name="bell" size={16} color={th.muted} />
          <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#fbbf24', border: `2px solid #fff` }} />
        </button>
      </header>

      {/* TYPE FILTER BAR */}
      {showTypes && (
        <div style={{
          background: '#fff', borderBottom: `1px solid ${th.border}`,
          padding: '8px 24px', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,.04)',
        }}>
          <button onClick={() => setActiveTypes([])} style={{
            padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${activeTypes.length === 0 ? th.accent : th.border}`,
            background: activeTypes.length === 0 ? th.light : '#fff',
            color: activeTypes.length === 0 ? th.accent : th.pillText,
            fontWeight: 600, fontSize: 12, cursor: 'pointer', flexShrink: 0,
          }}>Tous</button>
          {Object.entries(EVENT_TYPES).map(([key, val]) => {
            const active = activeTypes.includes(key)
            return (
              <button key={key} onClick={() => toggleType(key)} style={{
                padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${active ? val.color : th.border}`,
                background: active ? val.color + '18' : '#fff',
                color: active ? val.color : th.pillText,
                fontWeight: active ? 700 : 500, fontSize: 12, cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Icon name={val.icon} size={11} color={active ? val.color : th.pillText} /> {val.label}
              </button>
            )
          })}
          <span style={{
            marginLeft: 'auto', fontSize: 12, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center',
            background: th.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* BODY */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {(viewMode === 'split' || viewMode === 'list') && (
          <div style={{
            width: viewMode === 'list' ? '100%' : 360, flexShrink: 0, overflowY: 'auto',
            padding: '0',
            borderRight: viewMode === 'split' ? `1px solid ${th.border}` : 'none',
            background: '#fff',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px 12px',
              borderBottom: `1px solid ${th.border}`,
              position: 'sticky', top: 0, background: '#fff', zIndex: 2,
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: th.muted }}>
                Événements à proximité
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: th.accent }}>
                {loading ? '…' : `${filtered.length} résultat${filtered.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: th.muted, fontSize: 14 }}>Chargement…</div>
            )}
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: th.muted }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Icon name="mappin" size={32} color={th.border} /></div>
                <div style={{ fontSize: 14 }}>Aucun événement dans ce rayon</div>
              </div>
            )}
            {filtered.map(ev => (
              <EventCard key={ev.id} ev={ev} selected={selectedEv?.id === ev.id}
                onSelect={e => setSelectedEv(e)} theme={theme} compact={compact} radius={ev.dist} />
            ))}
          </div>
        )}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div style={{ flex: 1, position: 'relative' }}>
            <MapView events={filtered} selectedId={selectedEv?.id} onSelect={e => setSelectedEv(e)} theme={theme} radius={radius} />
            {selectedEv && <EventDetail ev={selectedEv} onClose={() => setSelectedEv(null)} theme={theme} popupDesign={popupDesign} />}
          </div>
        )}
        {viewMode === 'list' && selectedEv && (
          <EventDetail ev={selectedEv} onClose={() => setSelectedEv(null)} theme={theme} popupDesign={popupDesign} />
        )}
      </div>
    </div>
  )
}
