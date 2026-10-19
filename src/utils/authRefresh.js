import { getTokenExpiresAt, REFRESH_THRESHOLD_MS } from './authToken.js'

// 브라우저 전역에 의존하지 않도록 세션 저장소·전송·잠금·시간을 주입받는다(authRefresh.test.js 참고).
// 연결은 apis/ApiClient.js 에서 한다.

// 모든 탭의 refresh·exchange 가 같은 이름의 배타 잠금을 쓴다.
export const AUTH_LOCK_NAME = 'hubspace-auth'
export const AUTH_REQUEST_TIMEOUT_MS = 10 * 1000
// 최초 요청 뒤의 재시도 간격. 시도는 최초 요청 포함 최대 3회.
export const AUTH_RETRY_DELAYS_MS = [1000, 3000]

// 서버가 refresh 쿠키를 거부했다(401). 세션을 지우고 다시 로그인해야 한다.
export class AuthUnauthorizedError extends Error {
  constructor() {
    super('로그인이 만료되었습니다. 다시 로그인해주세요.')
    this.name = 'AuthUnauthorizedError'
  }
}

// 네트워크 오류·타임아웃·5xx 로 갱신하지 못했다. 세션은 유지한다.
export class AuthUnavailableError extends Error {
  constructor() {
    super('로그인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.')
    this.name = 'AuthUnavailableError'
  }
}

// 요청 중에 로그아웃·재로그인으로 세션이 바뀌었다. 이전 세션의 응답을 현재 세션에 적용하지 않는다.
export class AuthSessionChangedError extends Error {
  constructor() {
    super('로그인 세션이 바뀌어 요청을 취소했습니다.')
    this.name = 'AuthSessionChangedError'
  }
}

/**
 * @param session   { getAccessToken, getEpoch, saveAccessToken(token), startSession(token), clear() }
 *                  epoch 는 로그인·세션 삭제마다 바뀌는 값이다. 같은 세션 안의 토큰 갱신에서는 바뀌지 않는다.
 * @param transport { refresh({ timeoutMs }), exchange({ timeoutMs }) } → { status, accessToken }.
 *                  네트워크 오류·타임아웃이면 reject 한다.
 * @param locks     navigator.locks. 없으면 탭 사이 조율 없이 실행한다.
 */
export const createAuthRefresher = ({ session, transport, locks, sleep, now = Date.now }) => {
  let inflight = null
  // 'unavailable': 일시 오류로 갱신하지 못했고 쓸 수 있는 access 토큰도 없다. 화면이 재시도 안내를 띄운다.
  let status = 'idle'
  const listeners = new Set()

  const setStatus = (next) => {
    if (status === next) return
    status = next
    listeners.forEach((listener) => listener())
  }

  const remaining = (token) => (token ? getTokenExpiresAt(token) - now() : 0)
  const isUsable = (token) => remaining(token) > 0
  const isFresh = (token) => remaining(token) > REFRESH_THRESHOLD_MS

  const withLock = (task) =>
    locks ? locks.request(AUTH_LOCK_NAME, { mode: 'exclusive' }, task) : task()

  // 401 은 바로 실패, 네트워크 오류·타임아웃·5xx 만 retryDelays 간격으로 다시 시도한다.
  const send = async (call, retryDelays) => {
    for (let attempt = 0; ; attempt += 1) {
      const result = await call({ timeoutMs: AUTH_REQUEST_TIMEOUT_MS }).catch(() => null)

      if (result?.status === 401) throw new AuthUnauthorizedError()
      if (result && result.status < 500) {
        if (result.status >= 200 && result.status < 300 && result.accessToken) return result.accessToken
        // 다시 보내도 같은 결과일 응답(401 이외의 4xx, 토큰 없는 2xx)
        throw new AuthUnavailableError()
      }
      if (attempt >= retryDelays.length) throw new AuthUnavailableError()
      await sleep(retryDelays[attempt])
    }
  }

  // epoch 는 갱신을 요청한 시점의 세션이다. 잠금을 기다리는 동안 로그인·세션 삭제가 일어났으면
  // 다른 세션의 토큰을 돌려주지 않는다(이전 계정의 요청이 새 계정 토큰으로 재전송되지 않게).
  const runRefresh = (staleToken, epoch) =>
    withLock(async () => {
      if (session.getEpoch() !== epoch) throw new AuthSessionChangedError()

      // 잠금을 기다리는 동안 다른 탭이 같은 세션의 새 토큰을 저장했으면 그 토큰을 쓴다(localStorage 는 탭끼리 공유된다).
      const latest = session.getAccessToken()
      if (latest && latest !== staleToken && isFresh(latest)) return latest

      try {
        const accessToken = await send(transport.refresh, AUTH_RETRY_DELAYS_MS)
        if (session.getEpoch() !== epoch) throw new AuthSessionChangedError()
        session.saveAccessToken(accessToken)
        return accessToken
      } catch (error) {
        if (error instanceof AuthUnauthorizedError && session.getEpoch() === epoch) {
          session.clear()
        }
        throw error
      }
    })

  // 탭 안의 같은 세션 갱신 요청(타이머, 페이지 진입, API 401)은 진행 중인 하나의 Promise 를 공유한다.
  // 세션이 바뀐 뒤의 요청은 이전 세션의 갱신에 합류하지 않고 잠금 뒤에 따로 실행한다.
  const refresh = (staleToken = session.getAccessToken()) => {
    const epoch = session.getEpoch()
    if (!inflight || inflight.epoch !== epoch) {
      const promise = runRefresh(staleToken, epoch)
        .then(
          (token) => {
            setStatus('idle')
            return token
          },
          (error) => {
            const stillUsable = isUsable(session.getAccessToken())
            setStatus(error instanceof AuthUnavailableError && !stillUsable ? 'unavailable' : 'idle')
            throw error
          },
        )
        .finally(() => {
          if (inflight?.promise === promise) inflight = null
        })
      inflight = { epoch, promise }
    }
    return inflight.promise
  }

  return {
    refresh,

    // 페이지 진입: 쓸 수 있는 access 토큰이 없을 때만 refresh 쿠키로 복구한다.
    // 재전송할 요청이 없으므로, 확인 중에 다른 탭에서 로그인했다면 그 세션을 그대로 쓴다.
    recover: () => {
      const token = session.getAccessToken()
      if (isUsable(token)) {
        // 다른 탭이 복구해 토큰만 저장된 경우에도 이 탭의 복구 오류 상태를 풀어 준다.
        setStatus('idle')
        return Promise.resolve(token)
      }

      return refresh().catch((error) => {
        const current = session.getAccessToken()
        if (error instanceof AuthSessionChangedError && isUsable(current)) return current
        throw error
      })
    },

    // 페이지 복귀·온라인 전환: 복구에 실패한 상태이거나 갱신 시점이 지났을 때만 다시 시도한다.
    resume: () => {
      const token = session.getAccessToken()
      if (status === 'unavailable' || (token && !isFresh(token))) return refresh()
      return Promise.resolve(token)
    },

    // 보호된 요청 직전: 만료가 가까우면 갱신하되, 일시 오류면 아직 유효한 토큰을 그대로 쓴다.
    getUsableAccessToken: async () => {
      const token = session.getAccessToken()
      if (isFresh(token)) return token

      try {
        return await refresh()
      } catch (error) {
        const current = session.getAccessToken()
        if (error instanceof AuthUnavailableError && isUsable(current)) return current
        throw error
      }
    },

    // 보호된 요청이 401 을 받았을 때. token·epoch 는 그 요청을 보낼 때의 값이다.
    recoverFromUnauthorized: ({ token, epoch }) => {
      if (session.getEpoch() !== epoch) return Promise.reject(new AuthSessionChangedError())

      const latest = session.getAccessToken()
      if (latest && latest !== token && isUsable(latest)) return Promise.resolve(latest)
      return refresh(token)
    },

    // 소셜 로그인 직후 OAuth 임시 쿠키 교환. 다른 탭의 refresh 와 같은 잠금을 쓴다.
    exchange: () =>
      withLock(async () => {
        const accessToken = await send(transport.exchange, [])
        session.startSession(accessToken)
        setStatus('idle')
        return accessToken
      }),

    getStatus: () => status,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
