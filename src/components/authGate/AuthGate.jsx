import { useEffect, useState, useSyncExternalStore } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import LoadingSpinner from '../loadingSpinner/LoadingSpinner'
import { authRefresher, handleAuthFailure, recoverAuthSession } from '../../apis/ApiClient'
import { getAuthEventName, hasValidSession } from '../../utils/authStorage'
import { AuthUnavailableError } from '../../utils/authRefresh'
import { isLocalPreviewMode } from '../../mocks/localPreview'
import { ADMIN_DARK_PATHS, useHomeTheme } from '../../pages/homePage/utils/homeTheme'
import './AuthGate.css'

function AuthChecking({ theme }) {
  return (
    <div className='authGate' data-theme={theme}>
      <div className='authGate-panel'>
        <LoadingSpinner
          className='authGate-spinner'
          size={48}
          color='var(--auth-gate-spinner-color, var(--color-text))'
        />
        <p className='authGate-text'>로그인 상태를 확인하고 있습니다...</p>
      </div>
    </div>
  )
}

// 보호된 페이지 진입 시 access 토큰이 없거나 만료됐으면 refresh 쿠키로 복구한다.
// 401 이면 로그인 화면, 일시 오류면 주소와 세션을 유지한 채 재시도 안내를 띄운다.
export default function AuthGate({ children }) {
  const [phase, setPhase] = useState(() =>
    isLocalPreviewMode || hasValidSession() ? 'ready' : 'checking',
  )
  const recoveryStatus = useSyncExternalStore(authRefresher.subscribe, authRefresher.getStatus)
  // 확인 화면도 들어가려는 관리 화면과 같은 테마로 보여, 다크 화면 사이에 흰 화면이 끼지 않게 한다.
  const { pathname } = useLocation()
  const { theme } = useHomeTheme()
  const gateTheme = ADMIN_DARK_PATHS.includes(pathname) ? theme : 'light'

  useEffect(() => {
    if (phase !== 'checking') return undefined

    let active = true
    recoverAuthSession()
      .then(() => active && setPhase('ready'))
      .catch((error) => {
        if (!active) return
        if (error instanceof AuthUnavailableError) setPhase('unavailable')
        // 401, 또는 확인 중에 다른 탭에서 로그인·로그아웃해 세션이 바뀐 경우
        else setPhase(hasValidSession() ? 'ready' : 'unauthorized')
      })
    return () => {
      active = false
    }
  }, [phase])

  // 재시도 안내(전체 화면 또는 페이지 안 배너) 중에 페이지 복귀·온라인 전환(이 탭)이나 다른 탭에서 복구에 성공하면
  // 복구 오류 상태를 정상화한 뒤 화면을 연다. 다른 탭은 토큰만 저장하므로 상태를 직접 풀어야 배너가 남지 않는다.
  const awaitingRecovery = phase === 'unavailable' || recoveryStatus === 'unavailable'
  useEffect(() => {
    if (!awaitingRecovery) return undefined

    const openIfRecovered = () => {
      // 유효한 토큰이 있으면 recover 는 요청 없이 바로 성공한다.
      if (hasValidSession()) recoverAuthSession().then(() => setPhase('ready'))
    }
    const authEventName = getAuthEventName()
    window.addEventListener(authEventName, openIfRecovered)
    window.addEventListener('storage', openIfRecovered)
    return () => {
      window.removeEventListener(authEventName, openIfRecovered)
      window.removeEventListener('storage', openIfRecovered)
    }
  }, [awaitingRecovery])

  if (phase === 'checking') return <AuthChecking theme={gateTheme} />
  if (phase === 'unauthorized') return <Navigate to='/login' replace />
  if (phase === 'unavailable') {
    return (
      <div className='authGate' data-theme={gateTheme}>
        <div className='authGate-panel' role='alert'>
          <p className='authGate-text'>로그인 상태를 확인하지 못했습니다.</p>
          <p className='authGate-subtext'>네트워크 연결을 확인한 뒤 다시 시도해주세요.</p>
          <button type='button' className='authGate-retry' onClick={() => setPhase('checking')}>
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      {recoveryStatus === 'unavailable' && (
        <div className='authGate-banner' role='alert'>
          <span>로그인 상태를 확인하지 못했습니다. 연결을 확인한 뒤 다시 시도해주세요.</span>
          <button
            type='button'
            className='authGate-retry authGate-retry--small'
            onClick={() => recoverAuthSession().catch(handleAuthFailure)}
          >
            다시 시도
          </button>
        </div>
      )}
    </>
  )
}
