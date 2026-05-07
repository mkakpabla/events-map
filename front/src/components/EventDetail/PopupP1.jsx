import Icon from '../Icon.jsx'
import { EVENT_TYPES, THEMES } from '../../data/constants.js'
import { formatDate } from '../../utils/helpers.js'

export default function PopupP1({ ev, onClose, theme }) {
  const t  = EVENT_TYPES[ev.type]
  const th = THEMES[theme]

  return (
    <div style={{
      position: 'absolute', bottom: '54%', left: '50%', transform: 'translateX(-50%)',
      zIndex: 1200, pointerEvents: 'auto',
      animation: 'popIn .2s cubic-bezier(.34,1.56,.64,1)',
    }}>
      <style>{`
        @keyframes popIn {
          from { opacity:0; transform:translateX(-50%) scale(.85) }
          to   { opacity:1; transform:translateX(-50%) scale(1)   }
        }
      `}</style>
      <div style={{
        background: '#fff', borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,.18)',
        width: 280, overflow: 'hidden',
        border: `1.5px solid ${th.border}`,
      }}>
        <div style={{ height: 4, background: `linear-gradient(90deg,${t.color},${th.accent})` }} />
        <div style={{ padding: '14px 14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: t.color + '15', border: `1.5px solid ${t.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={t.icon} size={18} color={t.color} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: th.text, lineHeight: 1.3 }}>{ev.name}</div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: t.color + '18', color: t.color }}>{t.label}</span>
              </div>
            </div>
            <button onClick={onClose} style={{ border: 'none', background: '#f3f4f6', borderRadius: 7, padding: 5, cursor: 'pointer', flexShrink: 0, display: 'flex' }}>
              <Icon name="close" size={13} color="#9ca3af" />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {[
              { icon: 'calendar', val: formatDate(ev.date) },
              { icon: 'mappin',   val: ev.venue.split(',')[0] },
            ].map(item => (
              <div key={item.icon} style={{ flex: 1, background: th.bg, borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name={item.icon} size={12} color={th.accent} />
                <span style={{ fontSize: 11, color: th.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.val}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: th.muted, lineHeight: 1.55, marginBottom: 12 }}>{ev.desc}</p>

          <button style={{
            width: '100%', padding: '11px', borderRadius: 12, border: 'none',
            background: `linear-gradient(135deg, ${t.color}, ${th.accent})`,
            color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer',
            boxShadow: `0 4px 16px ${th.ring}`,
            letterSpacing: '.01em',
          }}>
            S'inscrire →
          </button>
        </div>
        <div style={{
          position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
          borderTop: '10px solid #fff',
          filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.1))',
        }} />
      </div>
    </div>
  )
}
