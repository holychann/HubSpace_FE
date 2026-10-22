import { Link, NavLink } from 'react-router-dom'
import hubspaceLogo from '../../assets/default/hubspace-logo.png'
import './Header.css'
import AccountMenu from './AccountMenu'

// 홈·이용 방법·문의하기·관리 화면이 함께 쓰는 헤더.
// 로그인 상태면 오른쪽 끝에 닉네임(AccountMenu)을, 아니면 '로그인' 버튼(onStart)을 둔다.
// 로고는 logoTo(기본 홈)로 이동한다.
// 모바일에서는 '이용 방법'만 숨긴다. 홈 첫 화면에 같은 링크가 있고, '문의하기'는 다른 길이 없어 남긴다.
export default function Header({ hasSession, onStart, logoTo = '/' }) {
  return (
    <header className='site-header'>
      <div className='site-header__inner'>
        <Link to={logoTo} className='site-header__logo'>
          <img src={hubspaceLogo} alt='HubSpace' />
        </Link>
        <nav className='site-header__nav' aria-label='주요 메뉴'>
          <NavLink to='/guide' className='site-header__link site-header__link--page site-header__link--guide'>
            이용 방법
          </NavLink>
          <NavLink to='/contact' className='site-header__link site-header__link--page'>
            문의하기
          </NavLink>
          <span className='site-header__divider' aria-hidden='true' />
          {hasSession ? (
            <AccountMenu />
          ) : (
            <button type='button' className='site-header__link site-header__link--account' onClick={onStart}>
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
