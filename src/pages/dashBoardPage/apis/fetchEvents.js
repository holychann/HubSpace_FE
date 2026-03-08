import { useEffect, useState } from 'react'
import { apiGetPrivate } from '../../../utils/ApiUtil'

export const useFetchEvents = () => {
  const [events, setEvents] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchEvents = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await apiGetPrivate('/v1/events')
        const payload = res?.data ?? res
        const eventList = Array.isArray(payload?.events) ? payload.events : []
        const totalCount = typeof payload?.count === 'number' ? payload.count : eventList.length

        if (!isMounted) return
        setEvents(eventList)
        setCount(totalCount)
      } catch (err) {
        if (!isMounted) return
        setError(err?.message ?? '이벤트 목록을 불러오지 못했습니다')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    }

    fetchEvents()

    return () => {
      isMounted = false
    }
  }, [])

  return { events, count, loading, error }
}
