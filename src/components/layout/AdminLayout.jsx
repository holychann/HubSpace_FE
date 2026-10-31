import { Outlet, useLocation } from 'react-router-dom'
import Header from '../header/Header'
import { useHomeTheme } from '../../pages/homePage/utils/homeTheme'
import './AdminLayout.css'

const THEMED_CREATE_PATHS = ['/newcsv', '/newform']

export default function AdminLayout() {
  const { pathname } = useLocation()
  // 다크 시안은 대시보드와 이벤트 생성 화면에만 있어, 이벤트 수정 화면은 라이트로 둔다. 테마는 홈과 같은 설정을 따른다.
  const { theme, preference, changePreference } = useHomeTheme()
  const isDashboard = pathname === '/dashboard'
  const hasDarkDesign = isDashboard || THEMED_CREATE_PATHS.includes(pathname)

  return (
    <div className='adminLayout' data-theme={hasDarkDesign ? theme : 'light'}>
      {/* 관리 화면은 로그인한 상태로만 들어오므로 헤더 오른쪽에 닉네임이 보인다. */}
      <Header
        hasSession
        // 이벤트 생성·수정 화면에서는 로고가 대시보드로 돌아가고, 대시보드에서만 홈으로 간다.
        logoTo={isDashboard ? '/' : '/dashboard'}
        // 수정 화면은 라이트로만 보여 테마 스위치를 두지 않는다.
        themePreference={preference}
        onThemeChange={hasDarkDesign ? changePreference : undefined}
      />
      <Outlet />
    </div>
  )
}
