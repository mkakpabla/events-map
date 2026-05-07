import Icon from './Icon.jsx'
import { THEMES } from '../data/constants.js'

export default function TweaksPanel({ tweaks, onChange, visible, onClose }) {
  const th = THEMES[tweaks.theme]
  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      background: '#fff', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,.18)',
      padding: '20px', width: 260, fontFamily: 'system-ui,sans-serif',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Tweaks</span>
        <button onClick={onClose} style={{ border: 'none', background: '#f3f4f6', borderRadius: 8, padding: 6, cursor: 'pointer' }}>
          <Icon name="close" size={14} color="#6b7280" />
        </button>
      </div>

      {/* Variant */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Variation</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['A', 'B', 'C'].map(v => (
            <button key={v} onClick={() => onChange('variant', v)} style={{
              flex: 1, padding: '7px', borderRadius: 8, border: `2px solid ${tweaks.variant === v ? th.accent : '#e5e7eb'}`,
              background: tweaks.variant === v ? th.light : '#f9fafb',
              fontWeight: 700, fontSize: 13,
              color: tweaks.variant === v ? th.accent : '#374151', cursor: 'pointer',
            }}>
              {v === 'A' ? 'Sidebar' : v === 'B' ? 'Immersif' : 'Split'}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Couleur accent</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries({ indigo: '#6366f1', rose: '#f43f5e', emerald: '#10b981' }).map(([k, c]) => (
            <button key={k} onClick={() => onChange('theme', k)} style={{
              flex: 1, height: 32, borderRadius: 8, background: c,
              border: `3px solid ${tweaks.theme === k ? '#111' : 'transparent'}`, cursor: 'pointer',
            }} />
          ))}
        </div>
      </div>

      {/* Compact cards */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Cartes compactes</span>
        <button onClick={() => onChange('compactCards', !tweaks.compactCards)} style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: tweaks.compactCards ? th.accent : '#d1d5db', position: 'relative', transition: 'background .2s',
        }}>
          <div style={{
            position: 'absolute', top: 3, left: tweaks.compactCards ? 22 : 3, width: 18, height: 18,
            borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
          }} />
        </button>
      </div>

      {/* Popup design */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Design popup carte</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { k: 'P1', label: 'Bulle',    desc: 'Tooltip'  },
            { k: 'P2', label: 'Latérale', desc: 'Glass'    },
            { k: 'P3', label: 'Tiroir',   desc: '2 étapes' },
          ].map(({ k, label, desc }) => (
            <button key={k} onClick={() => onChange('popupDesign', k)} style={{
              flex: 1, padding: '6px 4px', borderRadius: 8,
              border: `2px solid ${tweaks.popupDesign === k ? th.accent : '#e5e7eb'}`,
              background: tweaks.popupDesign === k ? th.light : '#f9fafb',
              cursor: 'pointer', textAlign: 'center',
            }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: tweaks.popupDesign === k ? th.accent : '#374151' }}>{label}</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Show types */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Filtres par type</span>
        <button onClick={() => onChange('showTypes', !tweaks.showTypes)} style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: tweaks.showTypes ? th.accent : '#d1d5db', position: 'relative', transition: 'background .2s',
        }}>
          <div style={{
            position: 'absolute', top: 3, left: tweaks.showTypes ? 22 : 3, width: 18, height: 18,
            borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
          }} />
        </button>
      </div>
    </div>
  )
}
