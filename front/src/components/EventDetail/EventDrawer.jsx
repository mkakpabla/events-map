import { useEffect } from 'react'
import Icon from '../Icon.jsx'
import { EVENT_TYPES, THEMES } from '../../data/constants.js'
import { formatDate } from '../../utils/helpers.js'

export default function EventDrawer({ ev, onClose, theme }) {
  const t  = EVENT_TYPES[ev.type]
  const th = THEMES[theme]

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const eventUrl = ev.source_url || `/api/v1/events/${ev.id}`

  return (
    <>
      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes drawerFadeOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 800,
          background: 'rgba(15,23,42,.2)',
          backdropFilter: 'blur(1px)',
          animation: 'drawerFadeOverlay .2s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: 360, zIndex: 900,
        background: '#fff',
        borderRadius: '18px 0 0 18px',
        boxShadow: '-6px 0 40px rgba(0,0,0,.14)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'drawerSlideIn .28s cubic-bezier(.25,.46,.45,.94)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>

        {/* ── COVER ── */}
        <div style={{
          height: 180, flexShrink: 0, position: 'relative',
          background: `${t.color}12`,
          borderBottom: `1px solid ${t.color}22`,
          overflow: 'hidden',
        }}>
          {/* Photo de l'événement si disponible */}
          {ev.image_url ? (
            <img
              src={ev.image_url}
              alt={ev.name}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <>
              {/* Cercle décoratif (fallback sans image) */}
              <div style={{
                position: 'absolute', top: -60, right: -60,
                width: 240, height: 240, borderRadius: '50%',
                background: `${t.color}0a`,
              }} />
              {/* Icône centrale (fallback sans image) */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -58%)',
                opacity: .12,
              }}>
                <Icon name={t.icon} size={120} color={t.color} />
              </div>
            </>
          )}

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 30, height: 30, borderRadius: 8,
              border: `1px solid ${th.border}`, background: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="close" size={13} color={th.muted} />
          </button>

          {/* Badge type */}
          <div style={{
            position: 'absolute', top: 14, left: 16,
            fontSize: 10, fontWeight: 800, letterSpacing: '.07em',
            textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6,
            background: t.color + '18', color: t.color,
            border: `1px solid ${t.color}28`,
          }}>
            {t.label}
          </div>

          {/* Titre + icône en bas */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '10px 16px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: '#fff',
              border: `1.5px solid ${t.color}28`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 2px 8px ${t.color}20`,
            }}>
              <Icon name={t.icon} size={20} color={t.color} />
            </div>
            <div style={{
              fontWeight: 800, fontSize: 16, color: th.text,
              lineHeight: 1.2, letterSpacing: '-0.3px',
            }}>
              {ev.name}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 8px' }}>

          {/* Infos clés */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {[
              { icon: 'calendar', label: 'Date', val: formatDate(ev.date) },
              { icon: 'mappin',   label: 'Lieu', val: ev.venue },
            ].map(item => (
              <div key={item.icon} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 13px', borderRadius: 12,
                background: th.bg, border: `1px solid ${th.border}`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: th.light,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={item.icon} size={14} color={th.accent} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: th.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 1 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: th.text }}>{item.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: th.muted, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>
              À propos
            </div>
            <p style={{ fontSize: 13.5, color: th.text, lineHeight: 1.65, margin: '0 0 20px' }}>
              {ev.desc}
            </p>
          </div>

          {/* Lien événement */}
          {eventUrl && (
            <a
              href={eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600, color: th.accent,
                textDecoration: 'none',
                padding: '0 0 2px',
                borderBottom: `1.5px solid ${th.accent}50`,
              }}
            >
              Voir l'événement
              <Icon name="chevronRight" size={12} color={th.accent} />
            </a>
          )}
        </div>
      </div>
    </>
  )
}
