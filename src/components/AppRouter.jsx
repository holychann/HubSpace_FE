import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from './layout/AdminLayout'
import LoginPage from '../pages/loginPage/entry/LoginPage'
import CookiePage from '../pages/cookiePage/entry/cookiePage'
import DashBoardPage from '../pages/dashBoardPage/entry/DashBoardPage'
import CsvCreatePage from '../pages/csvCreatePage/entry/CsvCreatePage'
import CsvDetailPage from '../pages/csvDetailPage/entry/CsvDetailPage'
import FormCreatePage from '../pages/formCreatePage/entry/FormCreatePage'
import FormDetailPage from '../pages/formDetailPage/entry/FormDetailPage'
import UserDetailPage from '../pages/userDetailPage/entry/UserDetailPage'
import UserResultPage from '../pages/userResultPage/entry/UserResultPage'

// 로그인 여부 확인용 함수 (localStorage 기반, 필요시 더 정교하게 수정 가능)
const isLoggedIn = () => !!localStorage.getItem('accessToken')

export const AppRouter = createBrowserRouter([
  // 로그인 페이지
  {
    path: '/login',
    element: isLoggedIn() ? <DashBoardPage /> : <LoginPage />,
  },

  // 소셜 로그인 후 쿠키 페이지
  {
    path: '/cookie',
    element: <CookiePage />,
  },

  // 검색/결과 페이지 (로그인 여부 확인 optional)
  { path: '/search', element: <UserDetailPage /> },
  { path: '/result', element: <UserResultPage /> },

  // AdminLayout 하위 페이지
  {
    path: '/',
    element: isLoggedIn() ? <AdminLayout /> : <LoginPage />, // 로그인 안 되어 있으면 LoginPage
    children: [
      { path: 'dashboard', element: <DashBoardPage /> },
      { path: 'newcsv', element: <CsvCreatePage /> },
      { path: 'newform', element: <FormCreatePage /> },
      { path: 'editcsv/:id', element: <CsvDetailPage /> },
      { path: 'editform/:id', element: <FormDetailPage /> },
    ],
  },
])

export default AppRouter
