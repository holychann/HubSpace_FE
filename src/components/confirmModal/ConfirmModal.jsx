import './ConfirmModal.css'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import LoadingSpinner from '../loadingSpinner/LoadingSpinner'

// API 호출과 오류 처리는 호출 화면이 맡고, 이 모달은 확인 여부와 진행 상태만 보여준다.
export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText,
  onConfirm,
  onClose,
  isProcessing = false,
  processingText,
  variant = 'default',
  cancelText = '취소',
  className,
  children,
}) {
  const titleId = useId()
  const descriptionId = useId()
  const contentRef = useRef(null)
  const cancelButtonRef = useRef(null)

  // 처음에는 취소 버튼에 포커스를 두고, 닫힐 때 원래 요소가 남아 있으면 포커스를 돌려준다.
  useEffect(() => {
    if (!isOpen) return

    const previousFocus = document.activeElement
    cancelButtonRef.current?.focus()

    return () => {
      if (previousFocus && previousFocus !== document.body && previousFocus.isConnected) {
        previousFocus.focus()
      }
    }
  }, [isOpen])

  // 요청 중에는 버튼이 모두 비활성화되므로 포커스가 모달 밖으로 빠지지 않게 본문에 둔다.
  useEffect(() => {
    if (isOpen && isProcessing) contentRef.current?.focus()
  }, [isOpen, isProcessing])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (!isProcessing) onClose()
        return
      }
      if (e.key !== 'Tab') return

      const focusable = Array.from(contentRef.current.querySelectorAll('button:not(:disabled)'))
      if (focusable.length === 0) {
        e.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const isInside = contentRef.current.contains(document.activeElement)

      if (e.shiftKey && (document.activeElement === first || !isInside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !isInside)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isProcessing, onClose])

  if (!isOpen) return null

  const handleClose = () => {
    if (!isProcessing) onClose()
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  return createPortal(
    <div className='confirmModal-overlay' onClick={handleOverlayClick}>
      <div
        ref={contentRef}
        className={className ? `confirmModal-content ${className}` : 'confirmModal-content'}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={isProcessing}
        tabIndex={-1}
      >
        <button
          type='button'
          className='confirmModal-close'
          aria-label='닫기'
          onClick={handleClose}
          disabled={isProcessing}
        >
          ✕
        </button>

        <div className='confirmModal-header'>
          <div id={titleId} className='confirmModal-header__title'>
            {title}
          </div>
          {description && (
            <div id={descriptionId} className='confirmModal-header__info'>
              {description}
            </div>
          )}
        </div>

        {children && <div className='confirmModal-body'>{children}</div>}

        <div className='confirmModal-actions'>
          <button
            ref={cancelButtonRef}
            type='button'
            className='confirmModal-button confirmModal-button--cancel'
            onClick={handleClose}
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button
            type='button'
            className={`confirmModal-button confirmModal-button--${variant === 'danger' ? 'danger' : 'confirm'}`}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing && (
              <span className='confirmModal-button__spinner' aria-hidden='true'>
                <LoadingSpinner size={20} color='currentColor' />
              </span>
            )}
            <span aria-live='polite'>{isProcessing ? processingText : confirmText}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
