import './DashBoardPage.css'
import EventItem from '../component/EventItem'
import { useCallback, useRef, useState } from 'react'
import EventCreateModal from '../component/EventCreateModal'
import EventTitleEditModal from '../component/EventTitleEditModal'
import EventButton from '../../../components/eventButton/EventButton'
import { useFetchEvents } from '../apis/fetchEvents'
import EventItemSkeleton from '../component/EventItemSkeleton'
import Skeleton from '../../../components/skeleton/Skeleton'
import { Icon } from '../../../components/icon/Icon'
import { useNavigate } from 'react-router-dom'

const SKELETON_COUNT = 2

const CREATE_METHODS = [
  {
    type: 'form',
    path: '/newform',
    icon: 'create-event-link',
    title: 'Google Forms 생성',
    description: '구글폼 응답으로 시작',
  },
  {
    type: 'file',
    path: '/newcsv',
    icon: 'create-event-upload',
    title: '파일 업로드',
    description: 'CSV · TSV 파일로 시작',
  },
]

export default function DashBoardPage() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const createButtonRef = useRef(null)
  const closeCreateModal = useCallback(() => setIsModalOpen(false), [])
  const [editingEvent, setEditingEvent] = useState(null)
  const { events, count, loading, error, updateEventTitleLocally, removeEventLocally } =
    useFetchEvents()

  return (
    <div className='dashBoard'>
      <div className='dashBoard-header'>
        <div className='dashBoard-header__header'>
          <div className='dashBoard-header__title'>내 이벤트</div>
          <div className='dashBoard-header__info'>
            {loading ? <Skeleton width={240} height={16} /> : `총 ${count}개의 이벤트를 관리하고 있어요.`}
          </div>
        </div>
        <EventButton
          ref={createButtonRef}
          text='+ 새 이벤트'
          onClick={() => setIsModalOpen((open) => !open)}
          aria-haspopup='dialog'
          aria-expanded={isModalOpen}
          aria-controls={isModalOpen ? 'createEvent-dialog' : undefined}
        />
      </div>
      <div className='dashBoard-eventList'>
        {loading && (
          <div className='dashBoard-skeletonList' role='status' aria-label='이벤트 목록을 불러오는 중입니다'>
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <EventItemSkeleton key={index} />
            ))}
          </div>
        )}
        {!loading && error && (
          <div className='dashBoard-eventList__message'>이벤트 목록을 불러오지 못했습니다.</div>
        )}
        {!loading && !error && events.length === 0 && (
          <div className='dashBoard-emptyState'>
            <div className='dashBoard-emptyState__title'>아직 이벤트가 없어요</div>
            <div className='dashBoard-emptyState__description'>만들 방식을 골라 바로 시작하세요.</div>
            {/* 새 이벤트 메뉴(EventCreateModal)와 같은 두 갈래를 빈 자리에서 바로 고른다. */}
            <div className='dashBoard-emptyState__methods'>
              {CREATE_METHODS.map((method) => (
                <button
                  key={method.path}
                  type='button'
                  className={`dashBoard-emptyMethod dashBoard-emptyMethod--${method.type}`}
                  onClick={() => navigate(method.path)}
                >
                  <span className='dashBoard-emptyMethod__icon' aria-hidden='true'>
                    <Icon name={method.icon} width={24} height={24} focusable='false' />
                  </span>
                  <span className='dashBoard-emptyMethod__copy'>
                    <span className='dashBoard-emptyMethod__title'>{method.title}</span>
                    <span className='dashBoard-emptyMethod__description'>{method.description}</span>
                  </span>
                  <Icon name='create-event-chevron' width={20} height={20} aria-hidden='true' focusable='false' />
                </button>
              ))}
            </div>
          </div>
        )}
        {!loading &&
          !error &&
          events.length > 0 &&
          events.map((event, index) => (
            <EventItem
              key={`${event.id}-${event.createdAt}-${index}`}
              event={event}
              onEditTitle={setEditingEvent}
              onDeleted={removeEventLocally}
              onClosed={removeEventLocally}
            />
          ))}
      </div>

      <EventCreateModal
        isOpen={isModalOpen}
        onClose={closeCreateModal}
        anchorRef={createButtonRef}
      />
      <EventTitleEditModal
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onUpdated={updateEventTitleLocally}
      />
    </div>
  )
}
