import { Outlet, useLocation } from 'react-router-dom'
import Header from '../header/Header'
import { useFetchUserInfo } from '../header/apis/fetchUserInfo'
import './AdminLayout.css'

export default function AdminLayout() {
  const { pathname } = useLocation()
  const { userInfo, loading } = useFetchUserInfo()
  const nickname = userInfo?.nickname || userInfo?.username || '사용자'

  return (
    <div className='adminLayout'>
      {/* 홈과 같은 헤더에서 '대시보드로 이동' 자리에 닉네임만 보인다. 불러오는 동안은 비워 둔다. */}
      <Header
        nickname={loading ? '' : `${nickname}님`}
        // 이벤트 생성·수정 화면에서는 로고가 대시보드로 돌아가고, 대시보드에서만 홈으로 간다.
        logoTo={pathname === '/dashboard' ? '/' : '/dashboard'}
      />
      <Outlet />
    </div>
  )
}
