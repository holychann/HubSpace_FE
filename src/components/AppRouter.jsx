import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from './layout/AdminLayout'
import LoginPage from '../pages/loginPage/entry/LoginPage'
import DashBoardPage from '../pages/dashBoardPage/entry/DashBoardPage'
import CsvCreatePage from '../pages/csvCreatePage/entry/CsvCreatePage'
import CsvDetailPage from '../pages/csvDetailPage/entry/CsvDetailPage'
import FormCreatePage from '../pages/formCreatePage/entry/FormCreatePage'
import FormDetailPage from '../pages/formDetailPage/entry/FormDetailPage'
import UserDetailPage from '../pages/userDetailPage/entry/UserDetailPage'
import UserResultPage from '../pages/userResultPage/entry/UserResultPage'
import NotFoundPage from '../pages/notFoundPage/entry/NotFoundPage'

export const AppRouter = createBrowserRouter([
  { path: '/', element: <LoginPage /> },
  { path: '/search', element: <UserDetailPage /> },
  { path: '/result', element: <UserResultPage /> },
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        path: 'dashboard',
        element: <DashBoardPage />,
      },
      {
        path: 'newcsv',
        element: <CsvCreatePage />,
      },
      {
        path: 'newform',
        element: <FormCreatePage />,
      },
      {
        path: 'editcsv/:id',
        element: <CsvDetailPage />,
      },
      {
        path: 'editform/:id',
        element: <FormDetailPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export default AppRouter
