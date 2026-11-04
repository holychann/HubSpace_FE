import { useCallback, useEffect, useState } from 'react'
import { apiGetPrivate } from '../../../utils/ApiUtil'
import { sortByClosedAtDesc } from '../utils/closedEventDate'

// 종료 목록은 자주 보는 화면이 아니고 서버도 캐시하지 않으므로, 대시보드와 달리 들어올 때마다 새로 읽는다.
export const useFetchClosedEvents = () => {
  const [state, setState] = useState({ events: [], loading: true, error: null })

  useEffect(() => {
    let isMounted = true

    apiGetPrivate('/v1/events/closed')
      .then((res) => {
        if (!isMounted) return
        const payload = res?.data ?? res
        const events = Array.isArray(payload?.events) ? payload.events : []
        setState({ events: sortByClosedAtDesc(events), loading: false, error: null })
      })
      .catch((err) => {
        if (!isMounted) return
        setState({ events: [], loading: false, error: err?.message ?? '종료된 이벤트를 불러오지 못했습니다' })
      })

    return () => {
      isMounted = false
    }
  }, [])

  const removeEventLocally = useCallback((eventId) => {
    setState((prev) => ({ ...prev, events: prev.events.filter((event) => event.id !== eventId) }))
  }, [])

  return { ...state, removeEventLocally }
}
