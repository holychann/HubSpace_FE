import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LoginPage.css'
import GradientLayout from '../../../components/gradientLayout/GradientLayout'
import googleIcon from '../../../assets/auth/auth-google-icon.svg'
import authLogo from '../../../assets/auth/auth-logo.png'
import { hasValidSession } from '../../../utils/authStorage'
import { isLocalPreviewMode } from '../../../mocks/localPreview'
import { recoverAuthSession } from '../../../apis/ApiClient'
import { AuthChecking } from '../../../components/authGate/AuthGate'

export default function LoginPage() {
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const aboutRef = useRef(null)
  const [checkingSession, setCheckingSession] = useState(true)

  // access 토큰이 없거나 만료됐어도 refresh 쿠키가 유효하면 대시보드로 보낸다. 실패하면(401·일시 오류) 로그인 화면을 보인다.
  useEffect(() => {
    if (isLocalPreviewMode || hasValidSession()) {
      navigate('/dashboard', { replace: true })
      return undefined
    }

    let active = true
    recoverAuthSession()
      .then(() => active && navigate('/dashboard', { replace: true }))
      .catch(() => active && setCheckingSession(false))
    return () => {
      active = false
    }
  }, [navigate])

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return
    const card = scroller.querySelector('.login__about')
    let touchStartY = null
    let gestureStartY = null
    let touchLastY = null
    let touchProgress = 0
    let releaseFrameId = null

    const handleWheel = (event) => {
      if (event.ctrlKey || Math.abs(event.deltaY) < 4) return

      event.preventDefault()
      const showAbout = event.deltaY > 0
      scroller.classList.toggle('login__scroll--about-visible', showAbout)
    }

    const handleTouchStart = (event) => {
      window.cancelAnimationFrame(releaseFrameId)
      touchStartY = event.touches[0]?.clientY ?? null
      gestureStartY = touchStartY
      touchLastY = touchStartY

      const cardRect = card.getBoundingClientRect()
      const bottom = Number.parseFloat(window.getComputedStyle(card).bottom) || 0
      const hiddenDistance = cardRect.height + 24
      const visibleTop = window.innerHeight - bottom - cardRect.height
      touchProgress = Math.min(Math.max((visibleTop + hiddenDistance - cardRect.top) / hiddenDistance, 0), 1)

      scroller.classList.add('login__scroll--dragging')
      card.style.transform = `translate(-50%, ${(1 - touchProgress) * hiddenDistance}px)`
    }

    const handleTouchMove = (event) => {
      const currentTouchY = event.touches[0]?.clientY
      if (touchStartY === null || currentTouchY === undefined) return

      event.preventDefault()
      const hiddenDistance = card.getBoundingClientRect().height + 24
      const touchDistance = touchStartY - currentTouchY
      touchProgress = Math.min(Math.max(touchProgress + touchDistance / hiddenDistance, 0), 1)
      touchStartY = currentTouchY
      touchLastY = currentTouchY
      card.style.transform = `translate(-50%, ${(1 - touchProgress) * hiddenDistance}px)`
    }

    const finishTouch = (event) => {
      if (touchStartY === null) return
      touchLastY = event.changedTouches[0]?.clientY ?? touchLastY
      const gestureDistance = gestureStartY - touchLastY
      const showAbout = Math.abs(gestureDistance) >= 6
        ? gestureDistance > 0
        : touchProgress >= 0.5

      scroller.classList.toggle('login__scroll--about-visible', showAbout)
      scroller.classList.remove('login__scroll--dragging')
      card.getBoundingClientRect()
      releaseFrameId = window.requestAnimationFrame(() => {
        card.style.removeProperty('transform')
      })
      touchStartY = null
      gestureStartY = null
      touchLastY = null
    }

    scroller.addEventListener('wheel', handleWheel, { passive: false })
    scroller.addEventListener('touchstart', handleTouchStart, { passive: true })
    scroller.addEventListener('touchmove', handleTouchMove, { passive: false })
    scroller.addEventListener('touchend', finishTouch, { passive: true })
    scroller.addEventListener('touchcancel', finishTouch, { passive: true })
    return () => {
      window.cancelAnimationFrame(releaseFrameId)
      scroller.removeEventListener('wheel', handleWheel)
      scroller.removeEventListener('touchstart', handleTouchStart)
      scroller.removeEventListener('touchmove', handleTouchMove)
      scroller.removeEventListener('touchend', finishTouch)
      scroller.removeEventListener('touchcancel', finishTouch)
    }
  }, [checkingSession])

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_DOMAIN}/oauth2/authorization/google`
  }

  const handleAboutScroll = () => {
    scrollRef.current?.classList.add('login__scroll--about-visible')
  }

  if (checkingSession) return <AuthChecking />

  return (
    <GradientLayout>
      <main ref={scrollRef} className='login__scroll'>
        <section className='login__panel login__panel--hero'>
          <div className='login__intro'>
            <h1 className='login__brand'>
              <img src={authLogo} alt='허브스페이스 HubSpace' className='login__logo' />
            </h1>

            <h2 className='login__title'>신청 내역과 결과를 간편하게 확인하는 서비스</h2>
            <p className='login__description'>신청자는 자신의 신청 내역과 결과를 직접 확인하고, 관리자는 반복 문의를 줄일 수 있습니다.</p>
          </div>

          <div className='login__actions'>
            <button type='button' onClick={handleLogin} className='login__button'>
              <span className='login__button-icon' aria-hidden='true'>
                <img src={googleIcon} alt='' />
              </span>
              <span>Google 계정으로 로그인</span>
            </button>

            <button type='button' className='login__scroll-hint' onClick={handleAboutScroll}>
              <span>서비스 알아보기</span>
              <span className='login__scroll-arrow' aria-hidden='true' />
            </button>
          </div>
        </section>

        <section ref={aboutRef} className='login__panel login__panel--about'>
          <section className='login__about' aria-labelledby='login-about-title'>
            <div className='login__about-heading'>
              <span id='login-about-title' className='login__about-label'>HubSpace 안내</span>
            </div>

            <div className='login__about-features'>
              <p className='login__about-feature'>
                <span className='login__about-number' aria-hidden='true'>01</span>
                <span>
                  <strong>신청·결과 조회 페이지를 간편하게</strong>
                  Google Forms로 신청을 받거나 CSV·TSV 데이터를 업로드해 신청 내역과 결과를 조회할 수 있는 페이지를 만들 수 있어요.
                </span>
              </p>
              <p className='login__about-feature'>
                <span className='login__about-number' aria-hidden='true'>02</span>
                <span>
                  <strong>신청 내역과 결과를 직접 확인</strong>
                  신청자는 관리자가 공유한 조회 URL에서 자신의 신청 내역과 결과를 언제든 확인할 수 있어요.
                </span>
              </p>
            </div>

            <p className='login__permission-note'>
              <strong>Google Forms 권한</strong>
              이벤트 신청용 Google Form을 생성하고 관리하는 목적으로만 사용합니다.
            </p>
          </section>
        </section>
      </main>
    </GradientLayout>
  )
}
