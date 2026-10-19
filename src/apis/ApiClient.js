import axios from 'axios'
import { toast } from 'sonner'
import {
  clearAuthSession,
  getAuthSessionId,
  getStoredAccessToken,
  isProtectedPath,
  refreshAuthSession,
  setAuthSession,
} from '../utils/authStorage'
import { AuthUnauthorizedError, createAuthRefresher } from '../utils/authRefresh'
import { isLocalPreviewMode, LOCAL_PREVIEW_READ_ONLY_MESSAGE } from '../mocks/localPreview'

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_DOMAIN,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// ------------------------------
// 중복 요청 방지
// ------------------------------
const pendingRequests = new Map()
const getRequestKey = (config) => {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

// ------------------------------
// Refresh Token 로직
// ------------------------------
// 실패해도 reject 하지 않고 상태 코드를 돌려준다. 네트워크 오류·타임아웃만 reject 되어 재시도 대상이 된다.
const postAuth = (path, { timeoutMs }) =>
  axios
    .post(
      `${import.meta.env.VITE_SERVER_DOMAIN}${path}`,
      {},
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        timeout: timeoutMs,
        validateStatus: () => true,
      },
    )
    .then((res) => ({ status: res.status, accessToken: res.data?.accessToken }))

export const authRefresher = createAuthRefresher({
  session: {
    getAccessToken: getStoredAccessToken,
    getEpoch: getAuthSessionId,
    saveAccessToken: refreshAuthSession,
    startSession: (accessToken) => setAuthSession({ accessToken }),
    clear: clearAuthSession,
  },
  transport: {
    refresh: (options) => postAuth('/jwt/refresh', options),
    exchange: (options) => postAuth('/jwt/exchange', options),
  },
  locks: navigator.locks,
  sleep: (ms) => new Promise((resolve) => window.setTimeout(resolve, ms)),
})

export const recoverAuthSession = () => authRefresher.recover()
export const exchangeAuthSession = () => authRefresher.exchange()

// 401 로 세션이 지워졌을 때만 로그인 화면으로 보낸다. 일시 오류는 화면이 재시도 안내를 띄운다.
export const handleAuthFailure = (error) => {
  if (!(error instanceof AuthUnauthorizedError) || !isProtectedPath()) return

  toast.error('로그인 시간이 만료되었습니다. 다시 로그인해주세요.', {
    duration: 1800,
  })

  window.setTimeout(() => {
    window.location.href = '/login'
  }, 250)
}

// ------------------------------
// 요청 인터셉터
// ------------------------------
api.interceptors.request.use(
  async (config) => {
    const requireAuth = config.requireAuth ?? false
    if (requireAuth && isLocalPreviewMode) {
      return Promise.reject(new Error(LOCAL_PREVIEW_READ_ONLY_MESSAGE))
    }

    const key = getRequestKey(config)
    if (pendingRequests.has(key)) return Promise.reject(new Error('중복 요청 차단됨'))
    pendingRequests.set(key, true)
    // 전송 중 config.data 가 문자열로 바뀌어 키를 다시 계산하면 달라지므로 처음 키를 보관한다.
    config._requestKey = key

    if (requireAuth) {
      try {
        const accessToken = await authRefresher.getUsableAccessToken()
        config._authToken = accessToken
        config._authEpoch = getAuthSessionId()
        config.headers.Authorization = `Bearer ${accessToken}`
      } catch (authError) {
        // 요청을 보내지 않으므로 여기서 중복 요청 기록을 지운다.
        pendingRequests.delete(key)
        handleAuthFailure(authError)
        return Promise.reject(authError)
      }
    }

    return config
  },
  (err) => Promise.reject(err),
)

api.interceptors.response.use(
  (res) => {
    pendingRequests.delete(res.config._requestKey)
    return res.data
  },
  async (err) => {
    const originalRequest = err.config
    if (originalRequest) {
      pendingRequests.delete(originalRequest._requestKey)
    }

    // 보호된 요청의 401 에만 갱신을 연결하고, 원래 요청은 한 번만 다시 보낸다.
    if (err.response?.status === 401 && originalRequest?.requireAuth && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        await authRefresher.recoverFromUnauthorized({
          token: originalRequest._authToken,
          epoch: originalRequest._authEpoch,
        })
      } catch (authError) {
        handleAuthFailure(authError)
        return Promise.reject(authError)
      }

      // 요청 인터셉터가 최신 토큰을 다시 붙인다.
      return api(originalRequest)
    }

    return Promise.reject(err)
  },
)

export default api
