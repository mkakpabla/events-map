import { useState } from 'react'
import Icon from '../Icon.jsx'
import { EVENT_TYPES, THEMES } from '../../data/constants.js'
import { formatDate } from '../../utils/helpers.js'

export default function PopupP3({ ev, onClose, theme }) {
  const t  = EVENT_TYPES[ev.type]
  const th = THEMES[theme]
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <style>{`
        @keyframes fadeUp     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes expandPanel{ from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {!expanded && (
        <div style={{
          position: 'absolute', bottom: '52%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 1200, animation: 'fadeUp .18s ease',
        }}>
          <div
            style={{
              background: '#fff', borderRadius: 40, padding: '8px 14px 8px 10px',
              boxShadow: '0 4px 20px rgba(0,0,0,.18)',
              display: 'flex', alignItems: 'center', gap: 9,
              border: `1.5px solid ${t.color}30`,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
            onClick={() => setExpanded(true)}
          >
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: t.color + '18', border: `1.5px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={t.icon} size={14} color={t.color} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: th.text }}>{ev.name}</div>
              <div style={{ fontSize: 11, color: th.muted }}>{formatDate(ev.date)}</div>
            </div>
            <div style={{ marginLeft: 4, width: 22, height: 22, borderRadius: '50%', background: th.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chevronRight" size={11} color="#fff" />
            </div>
            <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #fff' }} />
          </div>
        </div>
      )}

      {expanded && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1200,
          background: '#fff', borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,.15)',
          animation: 'expandPanel .25s cubic-bezier(.25,.46,.45,.94)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e5e7eb' }} />
          </div>
          <div style={{ padding: '12px 20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${t.color}25,${th.accent}18)`, border: `1.5px solid ${t.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 12px ${t.color}28` }}>
                  <Icon name={t.icon} size={22} color={t.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: th.text }}>{ev.name}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: t.color + '18', color: t.color }}>{t.label}</span>
                </div>
              </div>
              <button onClick={onClose} style={{ border: 'none', background: '#f3f4f6', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}>
                <Icon name="close" size={15} color="#9ca3af" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { icon: 'calendar', val: formatDate(ev.date) },
                { icon: 'mappin',   val: ev.venue.split(',')[0] },
              ].map(item => (
                <div key={item.icon} style={{ background: th.bg, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name={item.icon} size={14} color={th.accent} />
                  <span style={{ fontSize: 12, color: th.text }}>{item.val}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 13, color: th.muted, lineHeight: 1.6, marginBottom: 16 }}>{ev.desc}</p>

            <button style={{ width: '100%', padding: '13px', borderRadius: 13, border: 'none', background: `linear-gradient(90deg,${t.color},${th.accent})`, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', letterSpacing: '.01em' }}>
              S'inscrire à cet événement
            </button>
          </div>
        </div>
      )}
    </>
  )
}
