// 대시보드 이벤트 목록의 탭 내 메모리 캐시. 새로고침하면 초기화된다.
const FRESH_DURATION_MS = 60 * 1000

// events가 null이면 캐시 없음. session은 캐시를 비울 때마다 증가해 화면이 다시 조회하게 한다.
let snapshot = { events: null, count: 0, fetchedAt: 0, session: 0 }
// 캐시가 바뀔 때마다 증가한다. 조회 시작 이후 값이 바뀌었으면 그 응답은 버린다.
let version = 0
let pendingLoad = null
const listeners = new Set()

const setSnapshot = (next) => {
  snapshot = next
  listeners.forEach((listener) => listener())
}

const markChanged = () => {
  version += 1
  pendingLoad = null
}

export const subscribeEventListCache = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getEventListCache = () => snapshot

export const isEventListCacheFresh = () =>
  snapshot.events !== null && Date.now() - snapshot.fetchedAt < FRESH_DURATION_MS

// 진행 중인 조회가 있으면 공유한다. 조회 도중 캐시가 바뀌었으면 응답을 반영하지 않는다.
export const loadEventList = (fetchEventList) => {
  if (pendingLoad) return pendingLoad

  const startedVersion = version
  const request = fetchEventList().then(({ events, count }) => {
    if (version !== startedVersion) return
    pendingLoad = null
    setSnapshot({ ...snapshot, events, count, fetchedAt: Date.now() })
  })
  request.catch(() => {
    if (pendingLoad === request) pendingLoad = null
  })

  pendingLoad = request
  return request
}

// 생성 성공 시 목록은 유지하되 다음 진입 때 다시 조회하게 한다.
export const invalidateEventListCache = () => {
  markChanged()
  if (snapshot.events !== null) setSnapshot({ ...snapshot, fetchedAt: 0 })
}

// 제목 수정·삭제는 유효 시간을 연장하지 않으므로 fetchedAt을 그대로 둔다.
export const updateCachedEventTitle = (eventId, eventTitle) => {
  if (snapshot.events === null) return
  markChanged()
  setSnapshot({
    ...snapshot,
    events: snapshot.events.map((event) =>
      event.id === eventId ? { ...event, eventTitle } : event,
    ),
  })
}

export const removeCachedEvent = (eventId) => {
  if (snapshot.events === null) return
  markChanged()
  const events = snapshot.events.filter((event) => event.id !== eventId)
  const removedCount = snapshot.events.length - events.length
  setSnapshot({ ...snapshot, events, count: Math.max(snapshot.count - removedCount, 0) })
}

export const clearEventListCache = () => {
  markChanged()
  setSnapshot({ events: null, count: 0, fetchedAt: 0, session: snapshot.session + 1 })
}
