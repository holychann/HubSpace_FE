import './Header.css'
import { useFetchUserInfo } from './apis/fetchUserInfo'
import { Link } from 'react-router-dom'
import hubspaceLogo from '../../assets/default/hubspace-logo.png'

export default function Header() {
  const { userInfo, loading } = useFetchUserInfo()

  const nickname = userInfo?.nickname || userInfo?.username || '사용자'
  const email = userInfo?.email || ''
  const displayName = `${nickname}님`

  return (
    <header className='header'>
      <Link to='/' className='header-title header-title--button' aria-label='HubSpace 홈'>
        <img src={hubspaceLogo} alt='HubSpace' className='header-title__logo' />
      </Link>
      <nav className='header-nav' aria-label='서비스 안내'>
        <Link to='/'>서비스 소개</Link>
        <Link to='/#how'>이용 방법</Link>
      </nav>
      <div className='header-account'>
        <div className='header-account__info'>
          <div className='header-account__nickname'>{loading ? '불러오는 중...' : displayName}</div>
          <div className='header-account__email'>{loading ? '' : email}</div>
        </div>
      </div>
    </header>
  )
}
