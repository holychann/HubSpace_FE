import { clearEventListCache } from './eventListCache'
import { getTokenExpiresAt, REFRESH_THRESHOLD_MS } from './authToken'
import { clearNicknameCache } from './nicknameCache'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const EXPIRES_AT_KEY = 'authExpiresAt'
// 로그인·세션 삭제마다 바뀐다. 이전 세션의 늦은 응답이 새 세션을 덮어쓰지 않게 비교한다.
const SESSION_ID_KEY = 'authSessionId'
const AUTH_EVENT_NAME = 'auth-session-changed'

// 백엔드 access token 만료 시간 기준. 토큰의 exp 를 읽지 못할 때만 쓴다.
const SESSION_DURATION_MS = 60 * 60 * 1000

const PUBLIC_PATHS = ['/', '/login', '/cookie', '/search', '/result', '/privacy', '/terms']

const emitAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_EVENT_NAME))
}

export const isProtectedPath = (pathname = window.location.pathname) =>
  !PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

// 소셜 로그인 직후 OAuth 임시 쿠키를 교환하는 화면. exchange 가 먼저 끝나야 하므로 여기서는 refresh 하지 않는다.
export const isExchangePath = (pathname = window.location.pathname) => pathname === '/cookie'

// 다른 탭에서 로그인·로그아웃·토큰 갱신이 일어나면 이 탭의 이벤트 목록 캐시를 버린다.
window.addEventListener('storage', (e) => {
  if (e.key === null || [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, EXPIRES_AT_KEY, SESSION_ID_KEY].includes(e.key)) {
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

  // 만료 판단은 토큰의 exp 로 한다. authExpiresAt 은 보조 정보로만 남긴다.
  localStorage.setItem(
    EXPIRES_AT_KEY,
    String(getTokenExpiresAt(localStorage.getItem(ACCESS_TOKEN_KEY)) || Date.now() + SESSION_DURATION_MS),
  )
  emitAuthChange()
}

// 새 로그인은 다른 계정일 수 있으므로 이전 세션의 이벤트 목록·닉네임 캐시를 비운다.
export const setAuthSession = (session) => {
  clearEventListCache()
  clearNicknameCache()
  localStorage.setItem(SESSION_ID_KEY, crypto.randomUUID())
  writeAuthSession(session)
}

export const clearAuthSession = () => {
  clearEventListCache()
  clearNicknameCache()
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
  localStorage.setItem(SESSION_ID_KEY, crypto.randomUUID())
  emitAuthChange()
}

export const getAuthSessionId = () => localStorage.getItem(SESSION_ID_KEY)

// 만료됐어도 지우지 않고 돌려준다. 만료 여부와 갱신은 호출하는 쪽이 판단한다.
export const getStoredAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)

export const getAuthExpiresAt = () =>
  getTokenExpiresAt(getStoredAccessToken()) || Number(localStorage.getItem(EXPIRES_AT_KEY) || 0)

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

export const getRefreshDelay = () => {
  const remainingTime = getRemainingSessionTime()
  if (remainingTime <= 0) return 0
  return Math.max(remainingTime - REFRESH_THRESHOLD_MS, 0)
}

// 만료된 토큰이면 null. 세션은 지우지 않는다(refresh 쿠키로 복구할 수 있다).
export const getAccessToken = () => {
  const accessToken = getStoredAccessToken()
  if (!accessToken || isAuthExpired()) return null
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
