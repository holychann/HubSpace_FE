import { useEffect, useRef, useState } from 'react'
import UploadIcon from '../../../assets/home/home-upload.svg?react'
import ListChecksIcon from '../../../assets/home/home-list-checks.svg?react'
import LinkIcon from '../../../assets/home/home-link.svg?react'

const STEPS = [
  { title: '명단 준비', description: '파일을 올리거나 Google Form을 만들어요', Icon: UploadIcon },
  {
    title: '조회 항목 선택',
    description: '이름, 학번처럼 확인에 쓸 항목을 골라요',
    Icon: ListChecksIcon,
  },
  { title: '링크 공유', description: '신청자가 링크에서 결과를 확인해요', Icon: LinkIcon },
]

// 구간이 처음 보일 때 한 번만: 번호를 잇는 선이 그려지고, 선이 닿는 순서대로 단계가 나타난다.
// 동작 줄이기 설정이거나 IntersectionObserver 가 없으면 처음부터 완성된 상태를 보인다.
export default function HomeSteps() {
  const sectionRef = useRef(null)
  // 첫 렌더링부터 숨겨 두어야 깜빡이지 않는다.
  const [phase, setPhase] = useState(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return !reduceMotion && 'IntersectionObserver' in window ? 'waiting' : 'static'
  })

  useEffect(() => {
    if (phase !== 'waiting') return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setPhase('revealed')
        observer.disconnect()
      },
      { threshold: 0.35 },
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [phase])

  const phaseClass = phase === 'static' ? '' : ` home-steps--${phase}`

  return (
    <section
      ref={sectionRef}
      id='how'
      className={`home-steps${phaseClass}`}
      aria-labelledby='home-steps-title'
    >
      <div className='home-container'>
        <h2 id='home-steps-title' className='home-section-title'>
          세 단계로 만들어요
        </h2>
        <ol className='home-steps__list'>
          {STEPS.map((step, index) => (
            <li key={step.title} className='home-step' style={{ '--step-index': index }}>
              <span className='home-step__number' aria-hidden='true'>
                {index + 1}
              </span>
              <span className='home-step__icon' aria-hidden='true'>
                <step.Icon />
              </span>
              <div className='home-step__text'>
                <span className='home-step__label' aria-hidden='true'>
                  단계 {index + 1}
                </span>
                <h3 className='home-step__title'>{step.title}</h3>
                <p className='home-step__description'>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
