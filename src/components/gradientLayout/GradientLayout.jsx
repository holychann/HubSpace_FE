import './GradientLayout.css'
import { useHomeTheme } from '../../pages/homePage/utils/homeTheme'
import Header from '../header/Header'

// 조회·결과 화면의 그라데이션 바탕. 테마는 홈과 같은 설정(기기 설정, 홈 푸터 스위치로 고른 값)을 따른다.
// 로고는 본문 대신 다른 화면 헤더와 같은 자리·크기로 맨 위에 둔다(메뉴 없음). 로딩·오류 상태에서도 같은 자리에 보인다.
export default function GradientLayout({ children, className = '' }) {
  const { theme } = useHomeTheme()
  return (
    <div className={`gradient-layout ${className}`} data-theme={theme}>
      <Header logoOnly />
      {children}
    </div>
  )
}
