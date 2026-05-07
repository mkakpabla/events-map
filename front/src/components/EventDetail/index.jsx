import EventDrawer from './EventDrawer.jsx'

export default function EventDetail({ ev, onClose, theme }) {
  return <EventDrawer ev={ev} onClose={onClose} theme={theme} />
}
