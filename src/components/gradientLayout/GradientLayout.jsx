import './GradientLayout.css'
import { useHomeTheme } from '../../pages/homePage/utils/homeTheme'

// 조회·결과 화면의 그라데이션 바탕. 테마는 홈과 같은 설정(기기 설정, 홈 푸터 스위치로 고른 값)을 따른다.
export default function GradientLayout({ children, className = '' }) {
  const { theme } = useHomeTheme()
  return (
    <div className={`gradient-layout ${className}`} data-theme={theme}>
      {children}
    </div>
  )
}
