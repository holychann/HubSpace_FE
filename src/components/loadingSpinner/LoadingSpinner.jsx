import './LoadingSpinner.css'

// 점(신청자)들이 가운데로 모였다가 퍼지는 모양. 점마다 진하기를 달리해 회전 방향이 보이게 한다.
const DOT_OPACITIES = [1, 0.77, 0.53, 0.3]

export default function LoadingSpinner({
  size = 40,
  color = 'var(--color-text)',
  className = '',
}) {
  return (
    <div
      className={`loadingSpinner ${className}`.trim()}
      style={{
        '--spinner-size': `${size}px`,
        color,
      }}
      aria-label='로딩 중'
      role='status'
    >
      <svg className='loadingSpinner__svg' viewBox='0 0 48 48' aria-hidden='true'>
        <g className='loadingSpinner__orbit'>
          {DOT_OPACITIES.map((opacity, index) => (
            <g key={index} transform={`rotate(${index * 90} 24 24)`}>
              <circle
                className='loadingSpinner__dot'
                cx='41'
                cy='24'
                r='3.4'
                fill='currentColor'
                fillOpacity={opacity}
                style={{ '--dot-index': index }}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
