import { Link, NavLink } from 'react-router-dom'
import hubspaceLogo from '../../assets/default/hubspace-logo.png'
import './Header.css'

// 홈·이용 방법·문의하기·관리 화면이 함께 쓰는 헤더.
// nickname 을 넘기면(관리 화면) 오른쪽 끝에 닉네임을, 아니면 로그인 상태에 따라 '로그인'·'대시보드로 이동' 버튼을 둔다.
// 로고는 logoTo(기본 홈)로 이동한다.
// 모바일에서는 로고와 오른쪽 끝 항목만 보인다.
export default function Header({ hasSession, onStart, nickname, logoTo = '/' }) {
  return (
    <header className='site-header'>
      <div className='site-header__inner'>
        <Link to={logoTo} className='site-header__logo'>
          <img src={hubspaceLogo} alt='HubSpace' />
        </Link>
        <nav className='site-header__nav' aria-label='주요 메뉴'>
          <NavLink to='/guide' className='site-header__link site-header__link--page'>
            이용 방법
          </NavLink>
          <NavLink to='/contact' className='site-header__link site-header__link--page'>
            문의하기
          </NavLink>
          <span className='site-header__divider' aria-hidden='true' />
          {nickname === undefined ? (
            <button type='button' className='site-header__link site-header__link--account' onClick={onStart}>
              {hasSession ? '대시보드로 이동' : '로그인'}
            </button>
          ) : (
            <span className='site-header__nickname' title={nickname}>
              {nickname}
            </span>
          )}
        </nav>
      </div>
    </header>
  )
}
