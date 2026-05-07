import { useState } from 'react'
import Icon from './Icon.jsx'
import { EVENT_TYPES, THEMES } from '../data/constants.js'
import { formatDate } from '../utils/helpers.js'

export default function EventCard({ ev, selected, onSelect, theme, compact, radius: dist }) {
  const t  = EVENT_TYPES[ev.type]
  const th = THEMES[theme]
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(ev)}
      style={{
        padding: compact ? '10px 16px' : '14px 16px',
        background: selected ? th.light : hovered ? th.bg : '#fff',
        cursor: 'pointer',
        transition: 'background .15s',
        borderLeft: `3px solid ${selected ? th.accent : 'transparent'}`,
        display: 'flex', gap: 14, alignItems: 'flex-start',
        marginBottom: 2,
      }}
    >
      {/* Icône carrée arrondie */}
      <div style={{
        width: compact ? 40 : 48, height: compact ? 40 : 48,
        borderRadius: 13,
        background: `linear-gradient(135deg, ${t.color}15, ${t.color}32)`,
        border: `1.5px solid ${t.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        marginTop: 1,
      }}>
        <Icon name={t.icon} size={compact ? 16 : 20} color={t.color} />
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Ligne 1 : nom + badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
          <span style={{
            fontWeight: 700, fontSize: compact ? 13.5 : 15,
            color: th.text, lineHeight: 1.25,
            letterSpacing: '-0.3px', flex: 1, minWidth: 0,
          }}>
            {ev.name}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '.06em',
            textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 6, flexShrink: 0,
            background: t.color + '18', color: t.color,
            border: `1px solid ${t.color}28`,
            marginTop: 1,
          }}>
            {t.label}
          </span>
        </div>

        {/* Ligne 2 : lieu • distance */}
        <div style={{
          fontSize: 12, color: th.muted,
          display: 'flex', alignItems: 'center', gap: 4,
          marginBottom: compact ? 0 : 4,
        }}>
          <Icon name="mappin" size={11} color={th.muted} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
            {ev.venue}
          </span>
          {dist != null && (
            <>
              <span style={{ color: th.border, flexShrink: 0 }}>•</span>
              <span style={{ color: th.accent, fontWeight: 700, flexShrink: 0 }}>{dist.toFixed(1)} km</span>
            </>
          )}
        </div>

        {/* Ligne 3 : date */}
        {!compact && (
          <div style={{ fontSize: 12, color: selected ? th.accent : th.muted, display: 'flex', alignItems: 'center', gap: 4, fontWeight: selected ? 600 : 400 }}>
            <Icon name="calendar" size={11} color={selected ? th.accent : th.muted} />
            {formatDate(ev.date)}
          </div>
        )}
      </div>
    </div>
  )
}
