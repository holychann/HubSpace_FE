import { clearEventListCache } from './eventListCache'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const EXPIRES_AT_KEY = 'authExpiresAt'
const AUTH_EVENT_NAME = 'auth-session-changed'
export const REFRESH_THRESHOLD_MS = 60 * 1000

// 백엔드 access token 만료 시간 기준
const SESSION_DURATION_MS = 60 * 60 * 1000

const PUBLIC_PATHS = ['/', '/login', '/cookie', '/search', '/result', '/privacy', '/terms']

const emitAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_EVENT_NAME))
}

export const isProtectedPath = (pathname = window.location.pathname) =>
  !PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

// 다른 탭에서 로그인·로그아웃·토큰 갱신이 일어나면 이 탭의 이벤트 목록 캐시를 버린다.
window.addEventListener('storage', (e) => {
  if (e.key === null || [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, EXPIRES_AT_KEY].includes(e.key)) {
    clearEventListCache()
  }
})

const writeAuthSession = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + SESSION_DURATION_MS))
  emitAuthChange()
}

// 새 로그인은 다른 계정일 수 있으므로 이전 세션의 이벤트 목록 캐시를 비운다.
export const setAuthSession = (session) => {
  clearEventListCache()
  writeAuthSession(session)
}

export const clearAuthSession = () => {
  clearEventListCache()
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
  emitAuthChange()
}

export const getAuthExpiresAt = () => Number(localStorage.getItem(EXPIRES_AT_KEY) || 0)

export const isAuthExpired = () => {
  const expiresAt = getAuthExpiresAt()
  if (!expiresAt) return true
  return Date.now() >= expiresAt
}

export const getRemainingSessionTime = () => {
  const expiresAt = getAuthExpiresAt()
  if (!expiresAt) return 0
  return Math.max(expiresAt - Date.now(), 0)
}

export const shouldRefreshAccessToken = () => {
  const remainingTime = getRemainingSessionTime()
  return remainingTime > 0 && remainingTime <= REFRESH_THRESHOLD_MS
}

export const getRefreshDelay = () => {
  const remainingTime = getRemainingSessionTime()
  if (remainingTime <= 0) return 0
  return Math.max(remainingTime - REFRESH_THRESHOLD_MS, 0)
}

export const getAccessToken = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (!accessToken) return null

  if (isAuthExpired()) {
    clearAuthSession()
    return null
  }

  return accessToken
}

export const hasValidSession = () => !!getAccessToken()

export const refreshAuthSession = (accessToken) => {
  if (!accessToken) return

  // 같은 세션의 토큰 갱신이므로 이벤트 목록 캐시는 유지한다.
  writeAuthSession({
    accessToken,
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  })
}

export const getAuthEventName = () => AUTH_EVENT_NAME
