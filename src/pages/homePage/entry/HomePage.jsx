import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './HomePage.css'
import HomeOrbit from '../component/HomeOrbit'
import HomeProblem from '../component/HomeProblem'
import HomeSteps from '../component/HomeSteps'
import HomeMethods from '../component/HomeMethods'
import hubspaceLogo from '../../../assets/default/hubspace-logo.png'
import CopyIcon from '../../../assets/home/home-copy.svg?react'
import { hasValidSession } from '../../../utils/authStorage'
import { isLocalPreviewMode } from '../../../mocks/localPreview'
import { recoverAuthSession } from '../../../apis/ApiClient'
import { AuthChecking } from '../../../components/authGate/AuthGate'

// 문의 페이지는 아직 없다. 페이지를 만들면 이 경로로 연결된다.
const CONTACT_PATH = '/contact'

const startGoogleLogin = () => {
  window.location.href = `${import.meta.env.VITE_SERVER_DOMAIN}/oauth2/authorization/google`
}

// 주소에 #을 남기지 않고 같은 페이지의 구간으로 이동한다. 동작 줄이기 설정이면 바로 이동한다.
const scrollToSection = (event) => {
  const target = document.getElementById(event.currentTarget.hash.slice(1))
  if (!target) return

  event.preventDefault()
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}

export default function HomePage() {
  const navigate = useNavigate()
  const [checkingSession, setCheckingSession] = useState(true)

  // access 토큰이 없거나 만료됐어도 refresh 쿠키가 유효하면 대시보드로 보낸다. 실패하면(401·일시 오류) 홈을 보인다.
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

  if (checkingSession) return <AuthChecking />

  return (
    <div className='home'>
      <header className='home-header'>
        <div className='home-container home-header__inner'>
          <Link to='/' className='home-header__logo'>
            <img src={hubspaceLogo} alt='HubSpace' />
          </Link>
          <nav className='home-header__nav' aria-label='주요 메뉴'>
            <a href='#how' className='home-header__link home-header__link--page' onClick={scrollToSection}>
              이용 방법
            </a>
            <Link to={CONTACT_PATH} className='home-header__link home-header__link--page'>
              문의하기
            </Link>
            <span className='home-header__divider' aria-hidden='true' />
            <button
              type='button'
              className='home-header__link home-header__link--login'
              onClick={startGoogleLogin}
            >
              로그인
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className='home-hero'>
          <div className='home-container home-hero__copy'>
            <h1 className='home-hero__title'>결과 확인은 링크 하나로</h1>
            <p className='home-hero__lead'>링크를 공유하면, 신청자가 직접 결과를 확인해요.</p>
            <div className='home-hero__actions'>
              <button type='button' className='home-button home-button--primary' onClick={startGoogleLogin}>
                Google 계정으로 시작하기
              </button>
              <a href='#how' className='home-button home-button--secondary' onClick={scrollToSection}>
                이용 방법 보기
              </a>
            </div>
          </div>
          <HomeOrbit />
        </section>

        <HomeProblem />

        <HomeSteps />

        <HomeMethods />

        <section className='home-closing' aria-labelledby='home-closing-title'>
          <div className='home-container'>
            <div className='home-closing__band'>
              <div className='home-closing__content'>
                <h2 id='home-closing-title' className='home-closing__title'>
                  첫 조회 페이지를 만들어 보세요
                </h2>
                <p className='home-closing__lead'>이벤트를 만들면 공유할 링크가 바로 생겨요.</p>
                <button type='button' className='home-button home-button--primary' onClick={startGoogleLogin}>
                  Google 계정으로 시작하기
                </button>
              </div>

              {/* 대시보드의 '조회용 링크' 상자를 옮긴 예시라 화면 낭독기에서는 숨긴다. */}
              <div className='home-closing__card' aria-hidden='true'>
                <p className='home-closing__event'>학생회비 납부 여부 조회</p>
                <div className='home-closing__link'>
                  <div className='home-closing__link-text'>
                    <span className='home-closing__link-label'>조회용 링크</span>
                    <span className='home-closing__link-url'>hubspacekw.com/search?eventId=8966262453</span>
                  </div>
                  <span className='home-closing__copy-icon'>
                    <CopyIcon />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='home-footer'>
        <div className='home-container home-footer__inner'>
          <div className='home-footer__brand'>
            <img src={hubspaceLogo} alt='HubSpace' className='home-footer__logo' />
            {/* Google OAuth 검수에서 권한 사용 목적을 홈에 밝히도록 요구할 수 있어 남겨 둔다. */}
            <p className='home-footer__note'>
              Google Forms 권한은 이벤트 신청용 Google Form을 만들고 관리하는 데에만 사용합니다.
            </p>
          </div>
          <div className='home-footer__meta'>
            <nav className='home-footer__links' aria-label='약관 및 문의'>
              <Link to={CONTACT_PATH} className='home-footer__link home-footer__link--contact'>
                문의하기
              </Link>
              <Link to='/privacy' className='home-footer__link'>
                개인정보처리방침
              </Link>
              <Link to='/terms' className='home-footer__link'>
                이용약관
              </Link>
            </nav>
            <p className='home-footer__copyright'>© {new Date().getFullYear()} HubSpace</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
