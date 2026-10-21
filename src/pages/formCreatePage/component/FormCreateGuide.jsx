import { useEffect, useRef } from 'react'
import lottie from 'lottie-web/build/player/lottie_light'
import animationData from '../../../assets/animations/form-create-guide.json'
import mobileAnimationData from '../../../assets/animations/form-create-guide-mobile.json'

export default function FormCreateGuide() {
  const containerRef = useRef(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobileViewport = window.matchMedia('(max-width: 767px)')
    let animation

    const updatePlayback = () => {
      if (reducedMotion.matches) {
        animation.goToAndStop(
          mobileViewport.matches ? animation.totalFrames - 1 : 300,
          true,
        )
      } else {
        animation.play()
      }
    }

    const loadAnimation = () => {
      animation?.destroy()
      animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: !reducedMotion.matches,
        animationData: structuredClone(
          mobileViewport.matches ? mobileAnimationData : animationData,
        ),
      })
      animation.addEventListener('DOMLoaded', updatePlayback)
    }

    loadAnimation()
    mobileViewport.addEventListener('change', loadAnimation)
    reducedMotion.addEventListener('change', updatePlayback)

    return () => {
      mobileViewport.removeEventListener('change', loadAnimation)
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
