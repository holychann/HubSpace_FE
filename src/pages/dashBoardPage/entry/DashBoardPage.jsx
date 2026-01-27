import './DashBoardPage.css'
import EventItem from '../component/EventItem'
import { events } from '../utils/DashBoardDummy'
import { useState } from 'react'
import EventCreateModal from '../component/EventCreateModal'
import EventButton from '../../../components/eventButton/EventButton'

export default function DashBoardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className='dashBoard'>
      <div className='dashBoard-header'>
        <div className='dashBoard-header__header'>
          <div className='dashBoard-header__title'>내 이벤트</div>
          <div className='dashBoard-header__info'>생성된 페이지를 손쉽게 관리하세요.</div>
        </div>
        <EventButton
          text='+ㅤ새 이벤트'
          className='dashBoard-header__button--new'
          onClick={() => setIsModalOpen(true)}
        />
      </div>
      <div className='dashBoard-eventList'>
        {events.data.events.map((event, index) => (
          <EventItem key={index} event={event} />
        ))}
      </div>

      {/* 모달 */}
      <EventCreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
