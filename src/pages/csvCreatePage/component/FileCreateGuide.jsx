import { useEffect, useRef } from 'react'
import lottie from 'lottie-web/build/player/lottie_svg'
import animationData from '../../../assets/animations/file-create-guide.json'
import mobileAnimationData from '../../../assets/animations/file-create-guide-mobile.json'

export default function FileCreateGuide() {
  const containerRef = useRef(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobileViewport = window.matchMedia('(max-width: 767px)')
    let animation

    const updatePlayback = () => {
      if (reducedMotion.matches) {
        animation.goToAndStop(animation.totalFrames - 1, true)
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
      className='csvCreate-guide'
      role='img'
      aria-label='CSV 또는 TSV 파일을 업로드하고 조회 정보와 표시할 항목을 선택한 뒤 이벤트를 생성하는 과정을 보여줍니다.'
    />
  )
}
