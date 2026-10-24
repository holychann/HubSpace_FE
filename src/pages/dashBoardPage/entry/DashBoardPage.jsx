import './DashBoardPage.css'
import EventItem from '../component/EventItem'
import { useCallback, useRef, useState } from 'react'
import EventCreateModal from '../component/EventCreateModal'
import EventTitleEditModal from '../component/EventTitleEditModal'
import EventButton from '../../../components/eventButton/EventButton'
import { useFetchEvents } from '../apis/fetchEvents'
import EventItemSkeleton from '../component/EventItemSkeleton'
import Skeleton from '../../../components/skeleton/Skeleton'

const SKELETON_COUNT = 3

export default function DashBoardPage() {
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
            <div className='dashBoard-emptyState__visual' aria-hidden='true'>
              <div className='dashBoard-emptyState__orb dashBoard-emptyState__orb--large'></div>
              <div className='dashBoard-emptyState__orb dashBoard-emptyState__orb--small'></div>
              <div className='dashBoard-emptyState__sheet'>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div className='dashBoard-emptyState__title'>아직 등록된 이벤트가 없습니다</div>
            <div className='dashBoard-emptyState__description'>
              새 이벤트를 생성하면 조회 링크와 신청 링크를 한 곳에서 관리할 수 있습니다.
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
