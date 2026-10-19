import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeAuthSession } from '../../../apis/ApiClient'
import { AuthUnauthorizedError } from '../../../utils/authRefresh'
import {
  consumeGoogleConsentReturnPath,
  hasPendingGoogleConsent,
} from '../../../utils/googleConsentStorage'
import LoadingSpinner from '../../../components/loadingSpinner/LoadingSpinner'
import './cookiePage.css'

export default function CookiePage() {
  const navigate = useNavigate()

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
    <div className='cookiePage'>
      <div className='cookiePage-loading'>
        <LoadingSpinner
          className='cookiePage-spinner'
          size={48}
          cubeSize={16}
          color='#2d3b86'
        />
        <p className='cookiePage-text'>로그인 중입니다...</p>
      </div>
    </div>
  )
}
