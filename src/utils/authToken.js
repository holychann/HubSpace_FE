// 브라우저 전역(window, localStorage)을 쓰지 않는 토큰 계산. node --test 에서 그대로 불러온다.

// 만료까지 이 시간보다 적게 남으면 미리 갱신한다.
export const REFRESH_THRESHOLD_MS = 60 * 1000

// JWT payload 의 exp(초)를 밀리초로 돌려준다. 서명은 서버가 검증하므로 여기서는 읽기만 한다. 읽지 못하면 0.
export const getTokenExpiresAt = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const exp = JSON.parse(atob(payload)).exp
    return Number.isFinite(exp) ? exp * 1000 : 0
  } catch {
    return 0
  }
}
