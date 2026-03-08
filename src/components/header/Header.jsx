import './Header.css'
import { Icon } from '../icon/Icon'
import { useFetchUserInfo } from './apis/fetchUserInfo'

export default function Header() {
  const { userInfo, loading } = useFetchUserInfo()

  const nickname = userInfo?.nickname || userInfo?.username || '사용자'
  const email = userInfo?.email || ''
  const displayName = `${nickname}님`

  return (
    <div className='header'>
      <div className='header-title'>
        <Icon name='default-logo' height={85} className='header-title__logo' />
        <div className='header-title__title'>HubSpace</div>
      </div>
      <div className='header-account'>
        <Icon name='default-profile' width={60} height={60} className='header-accout__profile' />
        <div className='header-account__info'>
          <div className='header-account__nickname'>{loading ? '불러오는 중...' : displayName}</div>
          <div className='header-account__email'>{loading ? '' : email}</div>
        </div>
      </div>
    </div>
  )
}
