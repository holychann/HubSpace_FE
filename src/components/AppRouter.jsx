import { createBrowserRouter, Navigate } from 'react-router-dom'
import AdminLayout from './layout/AdminLayout'
import HomePage from '../pages/homePage/entry/HomePage'
import CookiePage from '../pages/cookiePage/entry/cookiePage'
import DashBoardPage from '../pages/dashBoardPage/entry/DashBoardPage'
import CsvCreatePage from '../pages/csvCreatePage/entry/CsvCreatePage'
import CsvDetailPage from '../pages/csvDetailPage/entry/CsvDetailPage'
import FormCreatePage from '../pages/formCreatePage/entry/FormCreatePage'
import FormDetailPage from '../pages/formDetailPage/entry/FormDetailPage'
import UserDetailPage from '../pages/userDetailPage/entry/UserDetailPage'
import UserResultPage from '../pages/userResultPage/entry/UserResultPage'
import PolicyPage from '../pages/policyPage/entry/PolicyPage'
import SeoController from './seo/SeoController'
import AuthGate from './authGate/AuthGate'
import FooterLayout from './footer/FooterLayout'

export const AppRouter = createBrowserRouter([
  {
    element: <SeoController />,
    children: [
      // 공개 홈 (로그인 버튼 포함). 자체 푸터가 있어 공통 푸터를 붙이지 않는다.
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <Navigate to='/' replace />,
      },

      // 공통 푸터를 붙이는 화면
      {
        element: <FooterLayout />,
        children: [
          // 소셜 로그인 후 쿠키 페이지
          {
            path: '/cookie',
            element: <CookiePage />,
          },

          // 검색/결과 페이지 (로그인 여부 확인 optional)
          { path: '/search', element: <UserDetailPage /> },
          { path: '/result', element: <UserResultPage /> },
          { path: '/privacy', element: <PolicyPage type='privacy' /> },
          { path: '/terms', element: <PolicyPage type='terms' /> },

          // AdminLayout 하위 페이지
          {
            path: '/',
            element: (
              <AuthGate>
                <AdminLayout />
              </AuthGate>
            ),
            children: [
              { path: 'dashboard', element: <DashBoardPage /> },
              { path: 'newcsv', element: <CsvCreatePage /> },
              { path: 'newform', element: <FormCreatePage /> },
              { path: 'editcsv/:id', element: <CsvDetailPage /> },
              { path: 'editform/:id', element: <FormDetailPage /> },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <HomePage />,
      },
    ],
  },
])

export default AppRouter
