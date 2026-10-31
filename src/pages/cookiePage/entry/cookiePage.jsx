import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeAuthSession } from '../../../apis/ApiClient'
import { AuthUnauthorizedError } from '../../../utils/authRefresh'
import {
  consumeGoogleConsentReturnPath,
  hasPendingGoogleConsent,
} from '../../../utils/googleConsentStorage'
import LoadingSpinner from '../../../components/loadingSpinner/LoadingSpinner'
import { useHomeTheme } from '../../homePage/utils/homeTheme'
import './cookiePage.css'

export default function CookiePage() {
  const navigate = useNavigate()
  // 로그인한 뒤 거쳐 가는 화면이라, 앞뒤 화면(홈 → 대시보드)과 같은 테마로 보여 흰 화면이 끼지 않게 한다.
  const { theme } = useHomeTheme()

  useEffect(() => {
    const exchangeToken = async () => {
      const searchParams = new URLSearchParams(window.location.search)
      const oauthError = searchParams.get('oauthError')

      if (oauthError && hasPendingGoogleConsent()) {
        const returnPath = consumeGoogleConsentReturnPath() || '/newform'
        navigate(`${returnPath}?googleConsent=denied`, { replace: true })
        return
      }

      try {
        // 다른 탭의 refresh 와 같은 잠금 안에서 교환하고 새 세션을 저장한다.
        await exchangeAuthSession()

        const returnPath = consumeGoogleConsentReturnPath()
        navigate(returnPath ? `${returnPath}?googleConsent=success` : '/dashboard', {
          replace: true,
        })
      } catch (err) {
        const msg = err instanceof AuthUnauthorizedError ? '인증 실패' : '소셜 로그인 실패'
        alert(msg)
        navigate('/login', { replace: true })
      }
    }

    exchangeToken()
  }, [navigate])

  return (
    <div className='cookiePage' data-theme={theme}>
      <div className='cookiePage-loading'>
        <LoadingSpinner
          className='cookiePage-spinner'
          size={48}
          color='var(--cookie-page-spinner-color, var(--color-text))'
        />
        <p className='cookiePage-text'>로그인 중입니다...</p>
      </div>
    </div>
  )
}
