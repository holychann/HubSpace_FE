import './DashBoardPage.css'
import EventItem from '../component/EventItem'
import { useState } from 'react'
import EventCreateModal from '../component/EventCreateModal'
import EventButton from '../../../components/eventButton/EventButton'
import { useFetchEvents } from '../apis/fetchEvents'

export default function DashBoardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { events, count, loading, error } = useFetchEvents()

  return (
    <div className='dashBoard'>
      <div className='dashBoard-header'>
        <div className='dashBoard-header__header'>
          <div className='dashBoard-header__title'>내 이벤트</div>
          <div className='dashBoard-header__info'>
            {loading ? '이벤트를 불러오는 중입니다.' : `총 ${count}개의 이벤트를 관리하고 있어요.`}
          </div>
        </div>
        <EventButton
          text='+ㅤ새 이벤트'
          className='dashBoard-header__button--new'
          onClick={() => setIsModalOpen(true)}
        />
      </div>
      <div className='dashBoard-eventList'>
        {loading && <div className='dashBoard-eventList__message'>이벤트 목록을 불러오는 중...</div>}
        {!loading && error && (
          <div className='dashBoard-eventList__message'>이벤트 목록을 불러오지 못했습니다.</div>
        )}
        {!loading && !error && events.length === 0 && (
          <div className='dashBoard-eventList__message'>등록된 이벤트가 없습니다.</div>
        )}
        {!loading &&
          !error &&
          events.length > 0 &&
          events.map((event, index) => (
            <EventItem key={`${event.id}-${event.createdAt}-${index}`} event={event} />
          ))}
      </div>

      {/* 모달 */}
      <EventCreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
