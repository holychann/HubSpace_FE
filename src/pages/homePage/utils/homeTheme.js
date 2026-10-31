import { useEffect, useState } from 'react'

// 홈·이용 방법·문의하기 화면의 라이트·다크 테마. 다크 시안은 이 화면들에만 있어 다른 화면은 라이트로 둔다.
// 기본은 '자동'(기기 설정 prefers-color-scheme)이고, 홈 푸터나 헤더 계정 메뉴의 스위치로 라이트·다크를 고르면 저장해 다음 방문에도 쓴다.
// 저장 키와 판단 방법을 바꾸면 index.html 의 첫 화면 바탕 스크립트도 함께 바꾼다.
const STORAGE_KEY = 'hubspace-home-theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

// 사파리 사생활 보호 모드처럼 저장소를 쓸 수 없으면 저장 없이 자동으로 둔다.
function readStoredPreference() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function useHomeTheme() {
  const [preference, setPreference] = useState(readStoredPreference)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches)

  // 자동일 때 보는 중에 기기 설정이 바뀌면(예: 해가 지면 자동 전환) 바로 따라간다.
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    const handleChange = (event) => setSystemDark(event.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  const changePreference = (next) => {
    setPreference(next)
    try {
      if (next === 'system') window.localStorage.removeItem(STORAGE_KEY)
      else window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // 저장하지 못해도 이번 방문 동안은 고른 테마를 유지한다.
    }
  }

  const theme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference
  return { theme, preference, changePreference }
}

// 관리 화면 중 다크 시안이 있는 주소(대시보드·이벤트 생성). 이벤트 수정 화면은 라이트로 둔다.
// AdminLayout 과 로그인 확인 화면(AuthGate)이 함께 쓴다.
export const ADMIN_DARK_PATHS = ['/dashboard', '/newcsv', '/newform']
