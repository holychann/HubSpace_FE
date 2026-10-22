import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './HomePage.css'
import Header from '../../../components/header/Header'
import HomeOrbit from '../component/HomeOrbit'
import HomeProblem from '../component/HomeProblem'
import HomeSteps from '../component/HomeSteps'
import HomeMethods from '../component/HomeMethods'
import hubspaceLogo from '../../../assets/default/hubspace-logo.png'
import CopyIcon from '../../../assets/home/home-copy.svg?react'
import GoogleIcon from '../../../assets/home/home-google.svg?react'
import { getStoredAccessToken } from '../../../utils/authStorage'
import { usePublicSession } from '../utils/publicSession'
import { recoverAuthSession } from '../../../apis/ApiClient'
import { AuthChecking } from '../../../components/authGate/AuthGate'

const CONTACT_PATH = '/contact'

// 주소에 #을 남기지 않고 같은 페이지의 구간으로 이동한다. 동작 줄이기 설정이면 바로 이동한다.
const scrollToSection = (event) => {
  const target = document.getElementById(event.currentTarget.hash.slice(1))
  if (!target) return

  event.preventDefault()
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}

export default function HomePage() {
  const { hash, key: locationKey } = useLocation()
  const { hasSession, handleStart } = usePublicSession()
  // 만료된 access 토큰이 남아 있으면 refresh 쿠키로 로그인이 이어질 수 있어, 그때만 서버에 확인하며 기다린다.
  // 토큰이 아예 없으면 로그아웃 상태다(refresh 가 401 이면 토큰을 지운다). 서버에 묻지 않고 바로 홈을 보인다.
  const [checkingSession, setCheckingSession] = useState(() => !hasSession && !!getStoredAccessToken())

  // 세션 복구 여부와 관계없이 홈을 유지하고, 로그인 상태에 맞춰 이동 버튼을 표시한다.
  useEffect(() => {
    if (!checkingSession) return undefined

    let active = true
    const finishChecking = () => {
      if (active) setCheckingSession(false)
    }
    recoverAuthSession().then(finishChecking, finishChecking)
    return () => {
      active = false
    }
  }, [checkingSession])

  // /#how 처럼 구간 주소로 들어와도 홈의 내부 스크롤 영역을 이동한다.
  useEffect(() => {
    if (checkingSession) return

    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' })
    } else {
      document.querySelector('.home')?.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [hash, locationKey, checkingSession])

  const primaryButtonClassName = `home-button home-button--primary${hasSession ? ' home-button--dashboard' : ''}`

  if (checkingSession) return <AuthChecking />

  return (
    <div className='home'>
      <Header hasSession={hasSession} onStart={handleStart} />

      <main>
        <section className='home-hero'>
          <div className='home-container home-hero__copy'>
            <h1 className='home-hero__title'>
              <span className='home-hero__problem'>반복되는 조회 문의</span>{' '}
              <span className='home-hero__solution'>링크 하나로 끝내요</span>
            </h1>
            <p className='home-hero__lead'>
              <span className='home-hero__lead-line'>명단을 올리고 링크만 공유하세요.</span>{' '}
              <span className='home-hero__lead-line'>신청자가 직접 결과를 확인해요.</span>
            </p>
            <div className='home-hero__actions'>
              <button type='button' className={primaryButtonClassName} onClick={handleStart}>
                {!hasSession && <GoogleIcon aria-hidden='true' />}
                {hasSession ? '대시보드로 이동' : 'Google 계정으로 시작하기'}
              </button>
              <a href='#how' className='home-hero__link' onClick={scrollToSection}>
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
                <button type='button' className={primaryButtonClassName} onClick={handleStart}>
                  {!hasSession && <GoogleIcon aria-hidden='true' />}
                  {hasSession ? '대시보드로 이동' : 'Google 계정으로 시작하기'}
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
