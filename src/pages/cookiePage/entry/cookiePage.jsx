import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CookiePage() {
  const navigate = useNavigate()

  useEffect(() => {
    const exchangeToken = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/jwt/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // 쿠키
        })

        if (!res.ok) throw new Error('인증 실패')

        const data = await res.json()
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        // 로그인 완료 후 메인 페이지로 이동
        navigate('/dashboard', { replace: true })
      } catch (err) {
        const msg = err?.message || '소셜 로그인 실패'
        alert(msg)
        navigate('/login', { replace: true })
      }
    }

    exchangeToken()
  }, [navigate])

  return <p>로그인 처리 중입니다...</p>
}
