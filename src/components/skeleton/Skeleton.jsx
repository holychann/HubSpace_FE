import './Skeleton.css'

// 내용이 들어올 자리를 미리 보여 주는 회색 블록. 숫자는 px, 문자열은 그대로 CSS 값으로 쓴다.
// 화면 낭독기에는 숨긴다. 불러오는 중이라는 안내는 감싸는 쪽이 role='status' 로 알린다.
export default function Skeleton({ width = '100%', height = 16, radius = 6, className = '' }) {
  const toCss = (value) => (typeof value === 'number' ? `${value}px` : value)

  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{ width: toCss(width), height: toCss(height), borderRadius: toCss(radius) }}
      aria-hidden='true'
    />
  )
}
