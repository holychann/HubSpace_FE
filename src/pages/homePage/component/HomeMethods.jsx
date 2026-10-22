import { useEffect, useRef, useState } from 'react'
import FileIcon from '../../../assets/home/home-file.svg?react'
import FormIcon from '../../../assets/home/home-form.svg?react'
import { getStepProgress, getStepWeights } from './methodProgress'

// 첫 번째 방식이 기본 선택이다. description 은 모바일에서 줄을 바꿀 자리마다 나눠 둔다.
// boundaries 는 단계가 바뀌는 프레임, lastFrame 은 영상의 마지막 프레임(JSON 의 op - 1)이다.
// 영상을 프레임별로 확인해 정했으므로 영상을 바꾸면 함께 고친다.
const METHODS = [
  {
    type: 'form',
    title: 'Google Forms',
    description: ['새로 들어오는 응답을', '실시간으로 반영해요.'],
    Icon: FormIcon,
    steps: ['질문 적기', '이벤트 생성', '신청 폼 완성'],
    animationLabel: '받을 질문을 적고 이벤트를 만들면, Google Form 신청서가 자동으로 만들어지는 과정을 보여줍니다.',
    desktop: {
      load: () => import('../../../assets/animations/form-create-guide.json'),
      boundaries: [240, 330],
      lastFrame: 479,
    },
    mobile: {
      load: () => import('../../../assets/animations/form-create-guide-mobile.json'),
      boundaries: [270, 330],
      lastFrame: 539,
    },
  },
  {
    type: 'file',
    title: '파일 업로드',
    description: ['정리된 파일을 올려', '명단 조회에 사용해요.'],
    Icon: FileIcon,
    steps: ['파일 올리기', '조회 항목 고르기', '조회 화면 완성'],
    animationLabel:
      'CSV 명단 파일을 올리고 조회 항목을 고르면, 신청자가 쓸 조회 화면이 만들어지는 과정을 보여줍니다.',
    desktop: {
      load: () => import('../../../assets/animations/file-create-guide.json'),
      boundaries: [200, 490],
      lastFrame: 779,
    },
    mobile: {
      load: () => import('../../../assets/animations/file-create-guide-mobile.json'),
      boundaries: [200, 490],
      lastFrame: 779,
    },
  },
]

const MOBILE_QUERY = '(max-width: 767px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

// 탭으로 방식을 고르면 무대에서 그 방식으로 이벤트를 만드는 영상이 반복 재생되고, 아래 막대가 영상 단계에 맞춰 찬다.
// 영상 파일은 구간이 처음 보일 때 불러오고, 구간이 화면에서 벗어나면 멈췄다가 다시 보이면 이어서 재생한다.
// 동작 줄이기 설정이면 마지막 장면에 멈춰 둔다.
const START_RATIO = 0.35

export default function HomeMethods() {
  const sectionRef = useRef(null)
  const animationRef = useRef(null)
  const playerRef = useRef(null)
  const inViewRef = useRef(!('IntersectionObserver' in window))
  const tabRefs = useRef([])
  const fillRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(() => !('IntersectionObserver' in window))
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)
  const method = METHODS[activeIndex]
  const variant = isMobile ? method.mobile : method.desktop
  // 막대 폭을 단계 길이에 비례하게 나눠, 모든 막대가 같은 속도로 차게 한다. 짧은 단계는 막대도 짧다.
  const stepColumns = getStepWeights(variant.boundaries, variant.lastFrame)
    .map((weight) => `minmax(0, ${weight}fr)`)
    .join(' ')

  // 화면 폭이 모바일 기준을 넘나들면 그에 맞는 영상으로 바꾼다.
  useEffect(() => {
    const mobileViewport = window.matchMedia(MOBILE_QUERY)
    const handleChange = () => setIsMobile(mobileViewport.matches)
    mobileViewport.addEventListener('change', handleChange)
    return () => mobileViewport.removeEventListener('change', handleChange)
  }, [])

  // 구간이 START_RATIO 이상 보이면 재생하고, 화면에서 완전히 벗어나면 멈춘다.
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        const player = playerRef.current
        const canPlay = player && !window.matchMedia(REDUCED_MOTION_QUERY).matches
        if (entry.intersectionRatio >= START_RATIO) {
          inViewRef.current = true
          setIsVisible(true)
          if (canPlay) player.play()
        } else if (!entry.isIntersecting) {
          inViewRef.current = false
          if (canPlay) player.pause()
        }
      },
      { threshold: [0, START_RATIO] },
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return undefined

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY)
    const clip = isMobile ? METHODS[activeIndex].mobile : METHODS[activeIndex].desktop
    let animation
    let cancelled = false

    const showProgress = (frame) => {
      const { fills, current } = getStepProgress(frame, clip.boundaries, clip.lastFrame)
      fills.forEach((fill, index) => fillRefs.current[index]?.style.setProperty('--fill', fill))
      setCurrentStep(current)
    }

    const showLastFrame = () => {
      animation.goToAndStop(clip.lastFrame, true)
      showProgress(clip.lastFrame)
    }

    const startPlayback = () => {
      showProgress(0)
      animation.goToAndStop(0, true)
      if (inViewRef.current) animation.play()
    }

    const loadAnimation = async () => {
      const [{ default: lottie }, { default: animationData }] = await Promise.all([
        import('lottie-web/build/player/lottie_svg'),
        clip.load(),
      ])
      if (cancelled) return

      animation = lottie.loadAnimation({
        container: animationRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        animationData: structuredClone(animationData),
      })
      playerRef.current = animation
      animation.addEventListener('enterFrame', () => showProgress(animation.currentFrame))

      if (reducedMotion.matches) showLastFrame()
      else startPlayback()
    }

    const handleMotionChange = () => {
      if (!animation) return
      if (reducedMotion.matches) showLastFrame()
      else startPlayback()
    }

    // 영상을 불러오지 못하면 무대를 비워 둔다. 단계 이름과 설명은 그대로 보인다.
    loadAnimation().catch(() => {})
    reducedMotion.addEventListener('change', handleMotionChange)

    return () => {
      cancelled = true
      reducedMotion.removeEventListener('change', handleMotionChange)
      animation?.destroy()
      playerRef.current = null
    }
  }, [isVisible, activeIndex, isMobile])

  const selectMethod = (index) => {
    if (index === activeIndex) return
    setActiveIndex(index)
    setCurrentStep(0)
  }

  // 탭 목록 안에서는 화살표·Home·End 로 옮겨 다니고, 옮기면 바로 그 방식을 보인다.
  const handleTabKeyDown = (event) => {
    const lastIndex = METHODS.length - 1
    const nextIndex = {
      ArrowRight: activeIndex === lastIndex ? 0 : activeIndex + 1,
      ArrowLeft: activeIndex === 0 ? lastIndex : activeIndex - 1,
      Home: 0,
      End: lastIndex,
    }[event.key]
    if (nextIndex === undefined) return

    event.preventDefault()
    selectMethod(nextIndex)
    tabRefs.current[nextIndex].focus()
  }

  return (
    <section
      ref={sectionRef}
      className={`home-methods home-methods--${method.type}`}
      aria-labelledby='home-methods-title'
    >
      <div className='home-container'>
        <h2 id='home-methods-title' className='home-section-title'>
          <span className='home-methods__line'>명단을 연결하는</span>{' '}
          <span className='home-methods__line'>두 가지 방법</span>
        </h2>

        <div className='home-methods__tabs' role='tablist' aria-label='시작 방식'>
          {METHODS.map((item, index) => (
            <button
              key={item.type}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              type='button'
              role='tab'
              id={`home-methods-tab-${item.type}`}
              className={`home-methods__tab home-methods__tab--${item.type}`}
              aria-selected={index === activeIndex}
              aria-controls='home-methods-panel'
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => selectMethod(index)}
              onKeyDown={handleTabKeyDown}
            >
              <item.Icon aria-hidden='true' />
              {item.title}
            </button>
          ))}
        </div>

        <div
          id='home-methods-panel'
          className='home-methods__panel'
          role='tabpanel'
          aria-labelledby={`home-methods-tab-${method.type}`}
        >
          <p className='home-methods__description'>
            {method.description.map((line, index) => (
              <span key={line} className='home-methods__line'>
                {index > 0 && ' '}
                {line}
              </span>
            ))}
          </p>

          <div className='home-methods__stage'>
            <div
              ref={animationRef}
              className='home-methods__animation'
              role='img'
              aria-label={method.animationLabel}
            />
          </div>

          <ol className='home-methods__steps' style={{ gridTemplateColumns: stepColumns }}>
            {method.steps.map((step, index) => (
              <li
                key={step}
                className='home-methods__step'
                aria-current={index === currentStep ? 'step' : undefined}
              >
                <span className='home-methods__track' aria-hidden='true'>
                  <span
                    ref={(node) => {
                      fillRefs.current[index] = node
                    }}
                    className='home-methods__fill'
                  />
                </span>
                <span className='home-methods__step-label'>
                  <span className='home-methods__step-number' aria-hidden='true'>
                    0{index + 1}
                  </span>
                  {step}
                </span>
              </li>
            ))}
          </ol>

          {/* 모바일은 폭이 좁아 지금 단계 이름만 막대 아래에 보인다. 낭독기는 위 목록을 읽는다. */}
          <p className='home-methods__current' aria-hidden='true'>
            <span className='home-methods__step-number'>0{currentStep + 1}</span>
            {method.steps[currentStep]}
          </p>
        </div>
      </div>
    </section>
  )
}
