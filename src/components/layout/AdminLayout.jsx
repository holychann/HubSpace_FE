import { Outlet, useLocation } from 'react-router-dom'
import Header from '../header/Header'
import './AdminLayout.css'

export default function AdminLayout() {
  const { pathname } = useLocation()

  return (
    <div className='adminLayout'>
      {/* 관리 화면은 로그인한 상태로만 들어오므로 헤더 오른쪽에 닉네임이 보인다. */}
      <Header
        hasSession
        // 이벤트 생성·수정 화면에서는 로고가 대시보드로 돌아가고, 대시보드에서만 홈으로 간다.
        logoTo={pathname === '/dashboard' ? '/' : '/dashboard'}
      />
      <Outlet />
    </div>
  )
}
