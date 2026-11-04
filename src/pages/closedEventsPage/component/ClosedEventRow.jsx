import './ClosedEventRow.css'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Icon } from '../../../components/icon/Icon'
import ConfirmModal from '../../../components/confirmModal/ConfirmModal'
import { apiDeletePrivate } from '../../../utils/ApiUtil'
import { toFileNameLabel, UNKNOWN_FILE_NAME } from '../../../utils/fileNameLabel'
import { formatDuration, formatEndDate } from '../utils/closedEventDate'

// 종료 시각이나 기간을 알 수 없을 때 칸을 비워 두지 않고 보여주는 값
const EMPTY_VALUE = '-'

export default function ClosedEventRow({ event, onDeleted }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // 확인 버튼을 연속으로 눌러도 삭제 요청은 한 번만 보낸다.
  const isDeletingRef = useRef(false)
  const actionsRef = useRef(null)

  const isForm = event.eventType === 'FORM'
  const endDate = formatEndDate(event.closedAt)
  const duration = formatDuration(event.createdAt, event.closedAt)
  const fileNameLabel = isForm ? null : (toFileNameLabel(event.fileName) ?? UNKNOWN_FILE_NAME)
  const viewCount = Number(event.viewCount ?? 0).toLocaleString('ko-KR')

  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (e) => {
      if (!actionsRef.current?.contains(e.target)) setIsMenuOpen(false)
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  const handleDeleteClick = () => {
    setIsMenuOpen(false)
    setIsDeleteConfirmOpen(true)
  }

  // 실패하면 모달을 닫아, 다시 시도할 때 확인을 새로 받게 한다.
  const finishDeleteWithError = (message) => {
    toast.error(message, { duration: 2000 })
    isDeletingRef.current = false
    setIsDeleting(false)
    setIsDeleteConfirmOpen(false)
  }

  const handleDelete = async () => {
    if (isDeletingRef.current) return

    try {
      isDeletingRef.current = true
      setIsDeleting(true)
      const res = await apiDeletePrivate(`/v1/events/${event.id}`)
      const isSuccess = res?.isSuccess ?? res?.success ?? false

      if (!isSuccess) {
        finishDeleteWithError(res?.message || '이벤트 삭제에 실패했습니다.')
        return
      }

      toast.success('이벤트가 삭제되었습니다!', { duration: 1000 })
      setIsDeleteConfirmOpen(false)
      onDeleted(event.id)
    } catch (err) {
      console.error('이벤트 삭제 실패:', err)
      finishDeleteWithError(err?.response?.data?.message || err?.message || '이벤트 삭제에 실패했습니다.')
    }
  }

  return (
    <tr className='closedEvent'>
      <td className='closedEvent-end'>
        {endDate ? (
          <>
            <span className='closedEvent-end__date'>{endDate.monthDay}</span>
            <span className='closedEvent-end__year'>{endDate.year}</span>
          </>
        ) : (
          <span className='closedEvent-end__date'>{EMPTY_VALUE}</span>
        )}
      </td>
      <td className='closedEvent-event'>
        <div className='closedEvent-event__title' title={event.eventTitle}>
          {event.eventTitle}
        </div>
        {fileNameLabel && (
          <div className='closedEvent-event__file' title={fileNameLabel}>
            {fileNameLabel}
          </div>
        )}
      </td>
      <td className='closedEvent-type'>
        <span className={`closedEvent-type__dot closedEvent-type__dot--${isForm ? 'form' : 'file'}`} aria-hidden='true' />
        {isForm ? '구글 폼' : '파일'}
      </td>
      <td className='closedEvent-duration'>
        <span className='closedEvent-duration__days'>{duration ? `${duration.days}일` : EMPTY_VALUE}</span>
        {duration && <span className='closedEvent-duration__range'>{duration.range}</span>}
      </td>
      <td className='closedEvent-views'>
        {/* 데스크탑은 표 머리글이 '조회 수'를 알려 주고, 머리글이 없는 모바일에서만 앞말을 보인다. */}
        <span className='closedEvent-views__label'>조회 </span>
        {viewCount}
      </td>
      <td className='closedEvent-actions'>
        <div className='closedEvent-actions__inner' ref={actionsRef}>
          <button
            type='button'
            className='closedEvent-actions__more'
            aria-label={`'${event.eventTitle}' 메뉴`}
            aria-haspopup='menu'
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            disabled={isDeleting}
          >
            <Icon name='button-more' width={3} aria-hidden='true' />
          </button>
          {isMenuOpen && (
            <div className='closedEvent-menu' role='menu'>
              <button
                type='button'
                role='menuitem'
                className='closedEvent-menu__item closedEvent-menu__item--danger'
                onClick={handleDeleteClick}
              >
                이벤트 삭제
              </button>
            </div>
          )}
        </div>
        <ConfirmModal
          isOpen={isDeleteConfirmOpen}
          title='이벤트를 삭제할까요?'
          description={
            <>
              ‘<strong>{event.eventTitle}</strong>’ 이벤트가 삭제됩니다. 삭제 후에는 되돌릴 수 없습니다.
            </>
          }
          confirmText='삭제'
          onConfirm={handleDelete}
          onClose={() => setIsDeleteConfirmOpen(false)}
          isProcessing={isDeleting}
          processingText='삭제 중...'
          variant='danger'
        />
      </td>
    </tr>
  )
}
