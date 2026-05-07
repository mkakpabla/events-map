const BASE = '/api/v1'

function normalize(ev) {
  return {
    id:         ev._id,
    name:       ev.name,
    desc:       ev.description,
    date:       ev.date,
    type:       ev.type,
    lat:        ev.lat,
    lng:        ev.lng,
    venue:      ev.venue,
    source_url: ev.source_url || '',
    image_url:  ev.image_url  || '',
  }
}

export async function fetchNearby({ lat, lng, radius, dateFrom, dateTo, limit = 200, signal } = {}) {
  const params = new URLSearchParams({ lat, lng, radius, limit })
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo)   params.set('dateTo', dateTo)

  const res = await fetch(`${BASE}/events/nearby?${params}`, { signal })
  if (!res.ok) throw new Error(`Erreur API ${res.status}`)
  const data = await res.json()
  return data.map(normalize)
}

export async function fetchEvents({ type, dateFrom, dateTo, limit = 200, skip = 0, signal } = {}) {
  const params = new URLSearchParams({ limit, skip })
  if (type)     params.set('type', type)
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo)   params.set('dateTo', dateTo)

  const res = await fetch(`${BASE}/events/?${params}`, { signal })
  if (!res.ok) throw new Error(`Erreur API ${res.status}`)
  const data = await res.json()
  return data.map(normalize)
}
