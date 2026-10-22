import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AppRouter } from './components/AppRouter'
import styles from './App.module.css'
import { Toaster } from 'sonner'
import { getAccessToken, getAuthEventName, getRefreshDelay, isExchangePath } from './utils/authStorage'
import { authRefresher, handleAuthFailure } from './apis/ApiClient'

function App() {
  const [fontStatus, setFontStatus] = useState(() => (document.fonts ? 'loading' : 'ready'))

  useEffect(() => {
    if (!document.fonts) return undefined

    let active = true
    const finish = (status) => {
      if (!active) return
      active = false
      window.clearTimeout(timeoutId)
      setFontStatus(status)
    }
    const timeoutId = window.setTimeout(() => finish('fallback'), 2000)
    const frameId = window.requestAnimationFrame(() => {
      // 숨긴 화면의 레이아웃을 계산해야 실제로 필요한 글자의 폰트 요청이 시작된다.
      document.body.getBoundingClientRect()
      document.fonts.ready.then(
        () => {
          const failed = Array.from(document.fonts).some((font) => font.status === 'error')
          finish(failed ? 'fallback' : 'ready')
        },
        () => finish('fallback'),
      )
    })

    return () => {
      active = false
      window.clearTimeout(timeoutId)
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    let timeoutId = null

    // /cookie 에서는 exchange 가 OAuth 임시 쿠키를 먼저 써야 하므로 갱신하지 않는다.
    // 일시 오류로 실패해도 여기서 다시 예약하지 않는다(즉시 반복 방지). 페이지 복귀·온라인 전환·재시도 버튼에서 다시 시도한다.
    const runAuthTask = (task) => {
      if (isExchangePath()) return
      task().catch(handleAuthFailure)
    }

    const scheduleAutoRefresh = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      // 만료 전 미리 갱신만 맡는다. 이미 만료된 토큰은 페이지 진입·복귀·API 요청에서 복구한다(401 처리가 겹치지 않게).
      if (!getAccessToken()) return

      // 갱신에 성공하면 세션 변경 이벤트로 다시 예약된다.
      timeoutId = window.setTimeout(() => runAuthTask(authRefresher.refresh), getRefreshDelay())
    }

    const resumeAuth = () => {
      if (document.visibilityState === 'hidden') return
      runAuthTask(authRefresher.resume)
    }

    scheduleAutoRefresh()

    const authEventName = getAuthEventName()
    window.addEventListener(authEventName, scheduleAutoRefresh)
    window.addEventListener('storage', scheduleAutoRefresh)
    document.addEventListener('visibilitychange', resumeAuth)
    window.addEventListener('online', resumeAuth)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      window.removeEventListener(authEventName, scheduleAutoRefresh)
      window.removeEventListener('storage', scheduleAutoRefresh)
      document.removeEventListener('visibilitychange', resumeAuth)
      window.removeEventListener('online', resumeAuth)
    }
  }, [])

  return (
    <div className={styles.app} data-font-status={fontStatus}>
      <RouterProvider router={AppRouter} />
      <Toaster
        className={styles.toaster}
        position='top-center'
        duration={2000}
        closeButton
        toastOptions={{
          className: styles.toast,
          style: {
            marginTop: '8px',
          },
        }}
      />
    </div>
  )
}

export default App
