import { useLayoutEffect, useRef } from 'react'
import GradientLayout from '../gradientLayout/GradientLayout'
import './LookupLayout.css'

export default function LookupLayout({ children, action, reference, logo, centerContent = false }) {
  const className = [
    'lookup-layout',
    !reference && 'lookup-layout--query',
    reference && 'lookup-layout--result',
    centerContent && 'lookup-layout--centered',
  ].filter(Boolean).join(' ')

  return (
    <GradientLayout className={className}>
      {reference ? (
        <>
          <AlignedLookupContent reference={reference} logo={logo}>
            {children}
          </AlignedLookupContent>
          <div className='lookup-layout__actions'>{action}</div>
        </>
      ) : (
        <QueryLookupContent action={action}>{children}</QueryLookupContent>
      )}
    </GradientLayout>
  )
}

function QueryLookupContent({ children, action, contentRef }) {
  return (
    <div className='lookup-layout__query'>
      <div className='lookup-layout__query-group'>
        <div className='lookup-layout__content' ref={contentRef}>{children}</div>
        <div className='lookup-layout__actions'>{action}</div>
      </div>
    </div>
  )
}

function AlignedLookupContent({ children, reference, logo }) {
  const frameRef = useRef(null)
  const referenceRef = useRef(null)
  const referenceContentRef = useRef(null)

  useLayoutEffect(() => {
    const frame = frameRef.current
    const referenceContent = referenceContentRef.current.firstElementChild
    const updateAlignment = () => {
      // 조회 화면과 같은 중앙 정렬을 측정해, 본문 길이와 무관하게 로고 위치를 유지한다.
      const referenceBounds = referenceContent.getBoundingClientRect()
      const offset = referenceBounds.top - frame.getBoundingClientRect().top
      frame.style.setProperty('--lookup-logo-offset', `${offset}px`)
      frame.style.setProperty('--lookup-logo-width', `${referenceBounds.width}px`)
      frame.dataset.aligned = 'true'
    }

    updateAlignment()
    const observer = new ResizeObserver(updateAlignment)
    observer.observe(frame)
    observer.observe(referenceRef.current)
    observer.observe(referenceContent)
    return () => observer.disconnect()
  }, [])

  return (
    <div className='lookup-layout__aligned-content' ref={frameRef}>
      <div
        className='lookup-layout__reference'
        ref={referenceRef}
        aria-hidden='true'
        inert
      >
        <QueryLookupContent contentRef={referenceContentRef}>{reference}</QueryLookupContent>
      </div>
      <div className='lookup-layout__aligned-body'>
        <div className='lookup-layout__logo'>{logo}</div>
        <div className='lookup-layout__result-content'>{children}</div>
      </div>
    </div>
  )
}
