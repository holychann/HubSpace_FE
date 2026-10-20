import { useEffect, useRef } from 'react'
import lottie from 'lottie-web/build/player/lottie_light'
import animationData from '../../../assets/animations/form-create-guide.json'

export default function FormCreateGuide() {
  const containerRef = useRef(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: !reducedMotion.matches,
      animationData: structuredClone(animationData),
    })

    const updatePlayback = () => {
      if (reducedMotion.matches) {
        animation.goToAndStop(300, true)
      } else {
        animation.play()
      }
    }

    animation.addEventListener('DOMLoaded', updatePlayback)
    reducedMotion.addEventListener('change', updatePlayback)

    return () => {
      reducedMotion.removeEventListener('change', updatePlayback)
      animation.destroy()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className='formCreate-guide'
      role='img'
      aria-label='정보 1, 2, 3에 항목명을 입력하고 이벤트 생성을 누르면 Google Form이 만들어집니다.'
    />
  )
}
