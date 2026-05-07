import Icon from '../Icon.jsx'
import { EVENT_TYPES, THEMES } from '../../data/constants.js'
import { formatDate } from '../../utils/helpers.js'

export default function PopupP2({ ev, onClose, theme }) {
  const t  = EVENT_TYPES[ev.type]
  const th = THEMES[theme]

  return (
    <div style={{
      position: 'absolute', top: '50%', right: 20, transform: 'translateY(-50%)',
      zIndex: 1200, width: 300,
      animation: 'slideInRight .22s cubic-bezier(.25,.46,.45,.94)',
    }}>
      <style>{`
        @keyframes slideInRight {
          from { opacity:0; transform:translateY(-50%) translateX(30px) }
          to   { opacity:1; transform:translateY(-50%) translateX(0)    }
        }
      `}</style>
      <div style={{
        background: 'rgba(255,255,255,.92)',
        backdropFilter: 'blur(16px)',
        borderRadius: 20,
        boxShadow: '0 12px 48px rgba(0,0,0,.16)',
        border: '1px solid rgba(255,255,255,.8)',
        overflow: 'hidden',
      }}>
        <div style={{ background: `linear-gradient(135deg,${t.color}22,${th.accent}18)`, padding: '18px 18px 14px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'rgba(255,255,255,.7)', borderRadius: 8, padding: 5, cursor: 'pointer', display: 'flex' }}>
            <Icon name="close" size={13} color="#6b7280" />
          </button>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${t.color}22, ${t.color}40)`, border: `1.5px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, boxShadow: `0 4px 14px ${t.color}28` }}>
            <Icon name={t.icon} size={24} color={t.color} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: th.text, lineHeight: 1.2, marginBottom: 6, paddingRight: 28 }}>{ev.name}</div>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: t.color, color: '#fff' }}>{t.label}</span>
        </div>

        <div style={{ padding: '14px 18px 18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {[
              { icon: 'calendar', label: 'Date', val: formatDate(ev.date) },
              { icon: 'mappin',   label: 'Lieu', val: ev.venue },
            ].map(item => (
              <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: th.light, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={item.icon} size={13} color={th.accent} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: th.muted, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: th.text, fontWeight: 500 }}>{item.val}</div>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: th.muted, lineHeight: 1.55, marginBottom: 14 }}>{ev.desc}</p>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 10, border: `1.5px solid ${th.border}`, background: 'transparent', color: th.text, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              Fermer
            </button>
            <button style={{ flex: 2, padding: '9px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${t.color}, ${th.accent})`, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', boxShadow: `0 4px 12px ${th.ring}` }}>
              S'inscrire
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
