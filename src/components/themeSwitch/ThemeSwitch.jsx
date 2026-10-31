import SystemThemeIcon from '../../assets/home/home-theme-system.svg?react'
import LightThemeIcon from '../../assets/home/home-theme-light.svg?react'
import DarkThemeIcon from '../../assets/home/home-theme-dark.svg?react'

const THEME_OPTIONS = [
  { value: 'system', label: '자동(기기 설정)', Icon: SystemThemeIcon },
  { value: 'light', label: '라이트', Icon: LightThemeIcon },
  { value: 'dark', label: '다크', Icon: DarkThemeIcon },
]

// 화면 테마 스위치(홈 푸터·헤더 계정 메뉴). 아이콘만 보이고 이름은 낭독기와 마우스를 올렸을 때 보인다.
// 모양은 놓이는 곳의 CSS 가 정하므로 className 을 받아 `${className}__option` 으로 버튼에 붙인다.
export default function ThemeSwitch({ className, preference, onChange }) {
  return (
    <div className={className} role='group' aria-label='화면 테마'>
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.value}
          type='button'
          className={`${className}__option`}
          aria-label={option.label}
          aria-pressed={preference === option.value}
          title={option.label}
          onClick={() => onChange(option.value)}
        >
          <option.Icon aria-hidden='true' />
        </button>
      ))}
    </div>
  )
}
