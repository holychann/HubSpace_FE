import { Link, NavLink } from 'react-router-dom'
import hubspaceLogo from '../../../assets/default/hubspace-logo.png'

// 홈과 문의하기 화면이 같은 헤더를 쓴다. 스타일은 HomePage.css 의 home-header 다.
// onHowClick 이 없으면 '이용 방법'은 홈의 #how 구간으로 이동한다.
export default function HomeHeader({ hasSession, onStart, onHowClick }) {
  return (
    <header className='home-header'>
      <div className='home-container home-header__inner'>
        <Link to='/' className='home-header__logo'>
          <img src={hubspaceLogo} alt='HubSpace' />
        </Link>
        <nav className='home-header__nav' aria-label='주요 메뉴'>
          <Link to='/#how' className='home-header__link home-header__link--page' onClick={onHowClick}>
            이용 방법
          </Link>
          <NavLink to='/contact' className='home-header__link home-header__link--page'>
            문의하기
          </NavLink>
          <span className='home-header__divider' aria-hidden='true' />
          <button type='button' className='home-header__link home-header__link--login' onClick={onStart}>
            {hasSession ? '대시보드로 이동' : '로그인'}
          </button>
        </nav>
      </div>
    </header>
  )
}
