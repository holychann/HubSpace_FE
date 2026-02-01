import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_DOMAIN,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // 쿠키 포함
})

// 중복 요청 방지
const pendingRequests = new Map()
const getRequestKey = (config) => {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const key = getRequestKey(config)
    if (pendingRequests.has(key)) return Promise.reject(new Error('중복 요청 차단됨'))
    pendingRequests.set(key, true)

    // 기본값: 인증 필요 없음
    const requireAuth = config.requireAuth ?? false
    if (requireAuth) {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (err) => Promise.reject(err),
)

// Refresh Token 로직
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => {
    pendingRequests.delete(getRequestKey(res.config))
    return res.data
  },
  async (err) => {
    const originalRequest = err.config
    pendingRequests.delete(getRequestKey(originalRequest))

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject })).then(
          (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          },
        )
      }

      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const res = await axios.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/jwt/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        const { accessToken, refreshToken: newRefreshToken } = res.data
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        processQueue(null, accessToken)
        isRefreshing = false

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(err)
  },
)

export default api
