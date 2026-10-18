import './EventItem.css'
import { toast } from 'sonner'
import { formatDate, makeSearchUrl } from '../utils/formatStrings'
import { Icon } from '../../../components/icon/Icon'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiDeletePrivate } from '../../../utils/ApiUtil'
import LoadingSpinner from '../../../components/loadingSpinner/LoadingSpinner'

export default function EventItem({ event, onEditTitle, onDeleted }) {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const actionMenuRef = useRef(null)
  const navigate = useNavigate()
  const canEditDataset = event.eventType === 'FILE' && event.isActive === true

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!actionMenuRef.current?.contains(e.target)) {
        setIsActionMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMoreClick = () => setIsActionMenuOpen((prev) => !prev)

  const handleEditTitle = () => {
    setIsActionMenuOpen(false)
    onEditTitle(event)
  }

  const handleEditDataset = () => {
    setIsActionMenuOpen(false)
    navigate(`/editcsv/${event.id}`)
  }

  const handleCopyUrl = (url) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('링크가 복사되었습니다!')
      })
      .catch((err) => {
        toast.error('복사 실패', { duration: 2000 })
        console.error('복사 실패:', err)
      })
  }

  const handleDelete = async () => {
    if (isDeleting) return

    try {
      setIsDeleting(true)
      const res = await apiDeletePrivate(`/v1/events/${event.id}`)
      const isSuccess = res?.isSuccess ?? res?.success ?? false

      if (!isSuccess) {
        setIsDeleting(false)
        toast.error(res?.message || '이벤트 삭제에 실패했습니다.', { duration: 2000 })
        return
      }

      toast.success('이벤트가 삭제되었습니다!', {
        duration: 1000,
      })
      setIsActionMenuOpen(false)
      onDeleted(event.id)
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || '이벤트 삭제에 실패했습니다.', {
        duration: 2000,
      })
      console.error('이벤트 삭제 실패:', err)
      setIsDeleting(false)
    }
  }

  return (
    <div className='eventItem'>
      {isDeleting && (
        <div className='eventItem-loadingOverlay'>
          <LoadingSpinner
            className='eventItem-loadingSpinner'
            size={40}
            cubeSize={15}
            color='#2d3b86'
          />
          <div className='eventItem-loadingText'>삭제 중...</div>
        </div>
      )}
      <div className='eventItem-header'>
        <div className='eventItem-header__header'>
          <div className='eventItem-title'>
            <div className='eventItem-title__title'>{event.eventTitle}</div>
            <div className='eventItem-title__badges'>
              <Icon
                name={event.isActive === true ? 'dashboard-active' : 'dashboard-disable'}
                height={21}
                className='eventItem-title__status'
              />
              <Icon
                name={event.eventType === 'FORM' ? 'dashboard-form' : 'dashboard-csv'}
                height={21}
                className='eventItem-title__format'
              />
            </div>
          </div>
          <div className='eventItem-info'>
            <div className='eventItem-info__info'>
              <Icon name='dashboard-date' height={12} className='eventItem-info__icon' />
              {formatDate(event.createdAt)}
            </div>
            <div className='eventItem-info__info'>
              <Icon name='dashboard-view' height={10} className='eventItem-info__icon' />
              {`조회 ${event.viewCount}회`}
            </div>
          </div>
        </div>
        <div className='eventItem-actions' ref={actionMenuRef}>
          <Icon
            name='button-more'
            width={3}
            className='eventItem-item__more'
            onClick={handleMoreClick}
          />
          {isActionMenuOpen && (
            <div className='eventItem-actionMenu'>
              <button
                type='button'
                className='eventItem-actionMenu__edit'
                onClick={handleEditTitle}
                disabled={isDeleting}
              >
                이름 수정
              </button>
              {canEditDataset && (
                <button
                  type='button'
                  className='eventItem-actionMenu__edit'
                  onClick={handleEditDataset}
                  disabled={isDeleting}
                >
                  파일 변경
                </button>
              )}
              <button
                type='button'
                className='eventItem-actionMenu__delete'
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '이벤트 삭제'}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className='eventItem-links'>
        <div className='eventItem-search'>
          <div className='eventItem-link__info'>
            <div className='eventItem-link__title'>조회용 링크</div>
            <div className='eventItem-link__link'>{makeSearchUrl(event.id)}</div>
          </div>
          <Icon
            name='button-copy-search'
            height={12}
            className='eventItem-link__copy'
            onClick={() => handleCopyUrl(makeSearchUrl(event.id))}
          />
        </div>
        {event.eventType === 'FORM' && (
          <div className='eventItem-apply'>
            <div className='eventItem-link__info'>
              <div className='eventItem-link__title'>폼 링크</div>
              <div className='eventItem-link__link'>{event.formUrl}</div>
            </div>
            <Icon
              name='button-copy-form'
              height={12}
              className='eventItem-link__copy'
              onClick={() => handleCopyUrl(event.formUrl)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
