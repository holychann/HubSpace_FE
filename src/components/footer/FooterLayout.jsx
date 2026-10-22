import { Outlet } from 'react-router-dom'
import Footer from './Footer'

// 홈은 자체 푸터가 있어서, 화면 아래에 떠 있는 공통 푸터는 홈 밖의 화면에만 붙인다.
export default function FooterLayout() {
  return (
    <>
      <Outlet />
      <Footer />
    </>
  )
}
