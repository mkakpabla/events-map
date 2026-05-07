// Maps our semantic icon names to Font Awesome 6 class names
const FA_MAP = {
  search:       'fa-magnifying-glass',
  filter:       'fa-sliders',
  calendar:     'fa-calendar-days',
  mappin:       'fa-location-dot',
  close:        'fa-xmark',
  locate:       'fa-crosshairs',
  list:         'fa-list',
  layers:       'fa-layer-group',
  star:         'fa-star',
  chevronRight: 'fa-chevron-right',
  sliders:      'fa-sliders',
  bell:         'fa-bell',
  envelope:     'fa-envelope',
  heart:        'fa-heart',
}

/**
 * Renders a Font Awesome 6 solid icon.
 * `name` can be a semantic alias (e.g. "mappin") or a direct FA class (e.g. "fa-music").
 */
export default function Icon({ name, size = 16, color = 'currentColor' }) {
  const cls = (name && name.startsWith('fa-')) ? name : (FA_MAP[name] ?? 'fa-circle-question')
  return (
    <i
      className={`fa-solid ${cls}`}
      style={{ fontSize: size, color, lineHeight: 1, display: 'inline-block', verticalAlign: 'middle' }}
    />
  )
}
