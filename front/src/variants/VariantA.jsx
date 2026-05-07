import { useState, useMemo } from 'react'
import Icon from '../components/Icon.jsx'
import MapView from '../components/MapView.jsx'
import EventCard from '../components/EventCard.jsx'
import EventDetail from '../components/EventDetail/index.jsx'
import { EVENT_TYPES, THEMES } from '../data/constants.js'
import { useNearbyEvents } from '../hooks/useEvents.js'

export default function VariantA({ theme, compact, showTypes, popupDesign }) {
  const th = THEMES[theme]
  const [search, setSearch]           = useState('')
  const [activeTypes, setActiveTypes] = useState([])
  const [radius, setRadius]           = useState(10)
  const [dateFrom, setDateFrom]       = useState('')
  const [selectedEv, setSelectedEv]   = useState(null)

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
    <div style={{ display: 'flex', height: '100%', background: th.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* SIDEBAR */}
      <div style={{
        width: 420, flexShrink: 0, background: th.sidebar,
        borderRight: `1px solid ${th.border}`,
        display: 'flex', flexDirection: 'column', zIndex: 10,
        boxShadow: '4px 0 24px rgba(0,0,0,.07)',
      }}>
        {/* HEADER */}
        <div style={{
          padding: '18px 20px 16px',
          background: '#fff',
          borderBottom: `1px solid ${th.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: th.light,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="mappin" size={18} color={th.accent} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17, color: th.text, letterSpacing: '-0.4px' }}>EventMap</div>
              <div style={{ fontSize: 11, color: th.muted, fontWeight: 500 }}>Découvrez autour de vous</div>
            </div>
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
              <Icon name="search" size={14} color={th.muted} />
            </div>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un événement..."
              style={{
                width: '100%', padding: '10px 12px 10px 34px',
                borderRadius: 10, border: `1.5px solid ${th.border}`,
                background: th.bg,
                fontSize: 13, outline: 'none', color: th.text,
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${th.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: th.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Rayon de recherche</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="range" min={1} max={30} value={radius} onChange={e => setRadius(+e.target.value)} style={{ flex: 1, accentColor: th.accent }} />
            <span style={{ minWidth: 40, textAlign: 'right', fontWeight: 700, color: th.accent, fontSize: 14 }}>{radius} km</span>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: th.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, marginTop: 14 }}>Date minimum</div>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${th.border}`, background: th.bg, fontSize: 13, color: th.text, outline: 'none' }} />

          {showTypes && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: th.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, marginTop: 14 }}>Type d'événement</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.entries(EVENT_TYPES).map(([key, val]) => {
                  const active = activeTypes.includes(key)
                  return (
                    <button key={key} onClick={() => toggleType(key)} style={{
                      padding: '5px 10px', borderRadius: 20, border: `1.5px solid ${active ? val.color : th.border}`,
                      background: active ? val.color + '18' : th.pill,
                      color: active ? val.color : th.pillText,
                      fontWeight: active ? 700 : 500, fontSize: 12, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Icon name={val.icon} size={11} color={active ? val.color : th.pillText} /> {val.label}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 0 0' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0 16px 12px',
            borderBottom: `1px solid ${th.border}`,
            marginBottom: 4,
          }}>
            <span style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '.08em',
              textTransform: 'uppercase', color: th.muted,
            }}>
              Événements à proximité
            </span>
            <span style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '.06em',
              textTransform: 'uppercase', color: th.accent,
            }}>
              {loading ? '…' : `${filtered.length} résultat${filtered.length !== 1 ? 's' : ''}`}
            </span>
          </div>
          {loading && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: th.muted, fontSize: 13 }}>
              Chargement…
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: th.muted, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Icon name="search" size={28} color={th.border} /></div>
              Aucun événement trouvé
            </div>
          )}
          {filtered.map(ev => (
            <EventCard key={ev.id} ev={ev} selected={selectedEv?.id === ev.id}
              onSelect={e => setSelectedEv(e)} theme={theme} compact={compact} radius={ev.dist} />
          ))}
        </div>
      </div>

      {/* MAP */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView events={filtered} selectedId={selectedEv?.id} onSelect={e => setSelectedEv(e)} theme={theme} radius={radius} />
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: '#fff', borderRadius: 10, padding: '8px 14px',
          boxShadow: '0 2px 12px rgba(0,0,0,.12)',
          fontSize: 12, fontWeight: 600, color: th.text,
          display: 'flex', alignItems: 'center', gap: 6, zIndex: 400,
        }}>
          <Icon name="layers" size={14} color={th.accent} />
          {filtered.length} événement{filtered.length !== 1 ? 's' : ''}
        </div>
        {selectedEv && <EventDetail ev={selectedEv} onClose={() => setSelectedEv(null)} theme={theme} popupDesign={popupDesign} />}
      </div>
    </div>
  )
}
