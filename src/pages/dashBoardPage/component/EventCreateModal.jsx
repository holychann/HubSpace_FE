import './EventCreateModal.css'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/icon/Icon'

const MOBILE_QUERY = '(max-width: 767px)'

export default function EventCreateModal({ isOpen, onClose, anchorRef }) {
  const navigate = useNavigate()
  const contentRef = useRef(null)
  const firstOptionRef = useRef(null)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY)
    const handleChange = (event) => setIsMobile(event.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  // 헤더의 overflow에 잘리지 않도록 포털에 띄우고 버튼의 화면 좌표를 따라간다.
  useLayoutEffect(() => {
    if (!isOpen) return
    const content = contentRef.current
    if (isMobile) {
      content.style.top = ''
      content.style.left = ''
      return
    }

    const updatePosition = () => {
      const anchor = anchorRef.current.getBoundingClientRect()
      const { offsetWidth: width, offsetHeight: height } = content
      const top = anchor.bottom + 12 + height <= window.innerHeight - 12
        ? anchor.bottom + 12
        : Math.max(12, anchor.top - height - 12)
      content.style.top = `${top}px`
      content.style.left = `${Math.max(12, Math.min(anchor.right - width, window.innerWidth - width - 12))}px`
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, isMobile, anchorRef])

  useEffect(() => {
    if (!isOpen) return
    const previousFocus = document.activeElement
    firstOptionRef.current.focus()
    return () => {
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event) => {
      if (!contentRef.current.contains(event.target) && !anchorRef.current.contains(event.target)) {
        onClose()
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      if (event.key !== 'Tab' || !isMobile) return

      const buttons = contentRef.current.querySelectorAll('button')
      const first = buttons[0]
      const last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const previousOverflow = document.body.style.overflow
    if (isMobile) document.body.style.overflow = 'hidden'
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      if (isMobile) document.body.style.overflow = previousOverflow
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isMobile, onClose, anchorRef])

  if (!isOpen) return null

  const handleCreate = (path) => {
    onClose()
    navigate(path)
  }

  return createPortal(
    <div className='createModal-overlay'>
      <div
        ref={contentRef}
        id='createEvent-dialog'
        className='createModal-content'
        role='dialog'
        aria-modal={isMobile}
        aria-label='이벤트 생성 방식'
      >
        <p className='createModal-intro'>생성 방식 선택</p>
        <button type='button' className='createModal-close' aria-label='닫기' onClick={onClose}>
          <Icon name='create-event-close' width={20} height={20} aria-hidden='true' focusable='false' />
        </button>
        <div className='createModal-options'>
          <button ref={firstOptionRef} type='button' className='createModal-option' onClick={() => handleCreate('/newform')}>
            <span className='createModal-option__icon' aria-hidden='true'>
              <Icon name='create-event-link' width={24} height={24} focusable='false' />
            </span>
            <span className='createModal-option__copy'>
              <span className='createModal-option__title'>Google Forms 생성</span>
              <span className='createModal-option__description'>구글폼 응답으로 시작</span>
            </span>
            <Icon name='create-event-chevron' width={20} height={20} aria-hidden='true' focusable='false' />
          </button>
          <button type='button' className='createModal-option' onClick={() => handleCreate('/newcsv')}>
            <span className='createModal-option__icon' aria-hidden='true'>
              <Icon name='create-event-upload' width={24} height={24} focusable='false' />
            </span>
            <span className='createModal-option__copy'>
              <span className='createModal-option__title'>파일 업로드</span>
              <span className='createModal-option__description'>CSV · TSV 파일로 시작</span>
            </span>
            <Icon name='create-event-chevron' width={20} height={20} aria-hidden='true' focusable='false' />
          </button>
        </div>
        <p className='createModal-hint'>선택하면 해당 방식의 설정 화면으로 이동해요.</p>
      </div>
    </div>,
    document.body,
  )
}
