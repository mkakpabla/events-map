import { useState, useEffect, useRef } from 'react'
import { fetchNearby } from '../api/events.js'
import { haversine } from '../utils/helpers.js'

const CENTER = { lat: 6.137, lng: 1.222 }

export function useNearbyEvents({ radius, dateFrom = '', dateTo = '' }) {
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    fetchNearby({
      lat:      CENTER.lat,
      lng:      CENTER.lng,
      radius,
      dateFrom: dateFrom || undefined,
      dateTo:   dateTo   || undefined,
      signal:   controller.signal,
    })
      .then(data => {
        if (controller.signal.aborted) return
        const withDist = data
          .map(ev => ({ ...ev, dist: haversine(CENTER.lat, CENTER.lng, ev.lat, ev.lng) }))
          .sort((a, b) => a.dist - b.dist)
        setEvents(withDist)
        setError(null)
      })
      .catch(err => {
        if (controller.signal.aborted) return
        setError(err)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [radius, dateFrom, dateTo])

  return { events, loading, error }
}
