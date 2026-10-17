import { useEffect, useState, useSyncExternalStore } from 'react'
import { toast } from 'sonner'
import { apiGetPrivate } from '../../../utils/ApiUtil'
import {
  getEventListCache,
  isEventListCacheFresh,
  loadEventList,
  removeCachedEvent,
  subscribeEventListCache,
  updateCachedEventTitle,
} from '../../../utils/eventListCache'

const fetchEventList = async () => {
  const res = await apiGetPrivate('/v1/events')
  const payload = res?.data ?? res
  const eventList = Array.isArray(payload?.events) ? payload.events : []
  const totalCount = typeof payload?.count === 'number' ? payload.count : eventList.length
  return { events: eventList, count: totalCount }
}

export const useFetchEvents = () => {
  const cache = useSyncExternalStore(subscribeEventListCache, getEventListCache)
  // 캐시가 비워진 뒤에는 이전 세션의 조회 오류를 보여주지 않는다.
  const [failure, setFailure] = useState({ session: -1, message: null })
  const { session } = cache

  useEffect(() => {
    if (isEventListCacheFresh()) return

    let isMounted = true
    const hasCache = getEventListCache().events !== null

    loadEventList(fetchEventList).catch((err) => {
      if (!isMounted) return

      // 캐시가 있으면 기존 목록을 유지하고, 다음 진입 때 다시 조회한다.
      if (hasCache) {
        toast.error('이벤트 목록을 갱신하지 못했습니다.', { duration: 2000 })
        return
      }
      setFailure({ session, message: err?.message ?? '이벤트 목록을 불러오지 못했습니다' })
    })

    return () => {
      isMounted = false
    }
  }, [session])

  const error = failure.session === session ? failure.message : null
  const events = cache.events ?? []
  const loading = cache.events === null && !error

  return {
    events,
    count: cache.count,
    loading,
    error,
    updateEventTitleLocally: updateCachedEventTitle,
    removeEventLocally: removeCachedEvent,
  }
}
