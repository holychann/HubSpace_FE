import { useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthEventName, hasValidSession } from '../../../utils/authStorage'
import { isLocalPreviewMode } from '../../../mocks/localPreview'

const startGoogleLogin = () => {
  window.location.href = `${import.meta.env.VITE_SERVER_DOMAIN}/oauth2/authorization/google`
}

const subscribeToSession = (onChange) => {
  const authEventName = getAuthEventName()
  window.addEventListener(authEventName, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(authEventName, onChange)
    window.removeEventListener('storage', onChange)
  }
}

// 홈과 문의하기 화면이 함께 쓴다. 로그인 상태면 대시보드로, 아니면 Google 로그인으로 보낸다.
export function usePublicSession() {
  const navigate = useNavigate()
  const validSession = useSyncExternalStore(subscribeToSession, hasValidSession)
  const hasSession = isLocalPreviewMode || validSession

  const handleStart = () => {
    if (hasSession) navigate('/dashboard')
    else startGoogleLogin()
  }

  return { hasSession, handleStart }
}
