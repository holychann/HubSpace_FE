import { useEffect, useRef, useState } from 'react'
import SearchIcon from '../../../assets/home/home-search.svg?react'
import AnimatedCheck from '../../../components/animatedCheck/AnimatedCheck'

// 첫 화면 그림: 궤도 위의 점(신청자)들이 가운데 조회 검색창으로 모인다. 로고의 궤도 모양에서 가져왔다.
// 좌표는 1200×540 기준이며, 위쪽 궤도 꼭대기에 온 점이 잘리지 않도록 viewBox 를 위로 40 만큼 넓혔다(-40~540).
// 좁은 화면에서는 preserveAspectRatio slice 로 가운데를 남기고 양옆을 자른다.
const CENTER = { x: 600, y: 300 }
const RINGS = [130, 210, 290]
const DOT_COLORS = {
  sky: '#d6e7ff',
  mint: '#d3f4ea',
  lavender: '#e7e0ff',
  pink: '#ffe1f4',
}
// [궤도 반지름, 각도(도), 색, 지름, 확인됨]
const DOTS = [
  [210, 150, 'sky', 44, false],
  [210, 35, 'mint', 40, true],
  [290, 168, 'lavender', 36, false],
  [290, 12, 'pink', 44, false],
  [290, 202, 'mint', 48, true],
  [290, -16, 'sky', 38, false],
]

// 궤도 한 바퀴에 걸리는 시간(초). 바깥 궤도일수록 느리게 돈다.
const REVOLUTION_SECONDS = { 210: 120, 290: 180 }

// 점은 궤도 중심을 기준으로 돌고(공전), 안쪽 묶음은 같은 속도로 반대로 돌아 배지·그림자 방향을 고정한다.
// 시작 각도는 --from 으로 넘긴다. SVG 회전은 시계 방향이 양수라 수학 각도의 부호를 바꾼다.
function OrbitDot({ radius, degree, color, size, checked }) {
  const x = CENTER.x + radius
  const y = CENTER.y
  // 확인 배지는 지름 44px 점 기준(배지 18px, 중심에서 15px)으로 비율을 맞춘다.
  const badgeScale = size / 44
  const badgeOffset = 15 * badgeScale

  return (
    <g
      className='home-orbit__satellite'
      style={{
        '--from': `${-degree}deg`,
        '--duration': `${REVOLUTION_SECONDS[radius]}s`,
        transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
      }}
    >
      <g className='home-orbit__satellite-body' style={{ transformOrigin: `${x}px ${y}px` }}>
        <circle
          cx={x}
          cy={y}
          r={size / 2 - 1.5}
          fill={DOT_COLORS[color]}
          stroke='#ffffff'
          strokeWidth='3'
          filter='url(#home-orbit-dot-shadow)'
        />
        {checked && (
          <g transform={`translate(${x + badgeOffset} ${y + badgeOffset}) scale(${badgeScale})`}>
            <circle r='9' fill='#1c7a72' />
            <path
              d='M-3.5 0.2L-1.2 2.5L3.5 -2.2'
              fill='none'
              stroke='#ffffff'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </g>
        )}
      </g>
    </g>
  )
}

export default function HomeOrbit() {
  const orbitRef = useRef(null)
  const resultTimeoutRef = useRef(null)
  const [visible, setVisible] = useState(true)
  const [showResult, setShowResult] = useState(false)
  const [resultVersion, setResultVersion] = useState(0)

  useEffect(() => () => window.clearTimeout(resultTimeoutRef.current), [])

  const handleSearch = () => {
    window.clearTimeout(resultTimeoutRef.current)
    setResultVersion((version) => version + 1)
    setShowResult(true)
    resultTimeoutRef.current = window.setTimeout(() => setShowResult(false), 3000)
  }

  // 그림이 화면 밖으로 나가면 공전을 멈춘다.
  useEffect(() => {
    const orbit = orbitRef.current
    if (!orbit || !('IntersectionObserver' in window)) return undefined

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(orbit)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={orbitRef} className={`home-orbit${visible ? '' : ' home-orbit--paused'}`}>
      <svg
        className='home-orbit__art'
        viewBox='0 -40 1200 580'
        preserveAspectRatio='xMidYMid slice'
        focusable='false'
        aria-hidden='true'
      >
        <defs>
          <filter id='home-orbit-glow' x='-50%' y='-50%' width='200%' height='200%'>
            <feGaussianBlur stdDeviation='60' />
          </filter>
          <filter id='home-orbit-dot-shadow' x='-50%' y='-50%' width='200%' height='200%'>
            <feDropShadow dx='0' dy='6' stdDeviation='8' floodColor='#2d3b86' floodOpacity='0.1' />
          </filter>
        </defs>

        {/* 조회·로그인 화면 배경과 같은 하늘색·민트·분홍 빛 */}
        <g filter='url(#home-orbit-glow)'>
          <ellipse cx='440' cy='310' rx='280' ry='160' fill='#abd0ff' opacity='0.55' />
          <ellipse cx='800' cy='340' rx='260' ry='150' fill='#bff3e4' opacity='0.6' />
          <ellipse cx='880' cy='180' rx='160' ry='110' fill='#ffc7f2' opacity='0.35' />
        </g>

        <g fill='none' stroke='#050064'>
          {RINGS.map((radius) => (
            <circle key={radius} cx={CENTER.x} cy={CENTER.y} r={radius} strokeOpacity='0.12' />
          ))}
          <ellipse
            cx={CENTER.x}
            cy={CENTER.y}
            rx='430'
            ry='115'
            strokeOpacity='0.1'
            transform={`rotate(-14 ${CENTER.x} ${CENTER.y})`}
          />
        </g>

        {DOTS.map(([radius, degree, color, size, checked]) => (
          <OrbitDot
            key={`${radius}-${degree}`}
            radius={radius}
            degree={degree}
            color={color}
            size={size}
            checked={checked}
          />
        ))}
      </svg>

      <div className='home-orbit__search'>
        {/* 동명이인이 없도록 이름 + 생년월일(6자리) 예시를 쓴다. */}
        <span className='home-orbit__value'>김허브</span>
        <span className='home-orbit__divider' />
        <span className='home-orbit__value'>040817</span>
        <button
          type='button'
          className='home-orbit__button'
          aria-label='예시 조회하기'
          onClick={handleSearch}
        >
          <SearchIcon
            key={resultVersion}
            className={resultVersion > 0 ? 'home-orbit__search-icon--clicked' : undefined}
            aria-hidden='true'
            focusable='false'
          />
        </button>
      </div>

      <div role='status' aria-live='polite' aria-atomic='true'>
        {showResult && (
          <div key={resultVersion} className='home-orbit__result'>
            <AnimatedCheck keepRing />
            확인되었습니다
          </div>
        )}
      </div>
    </div>
  )
}
