import './EventItem.css'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { formatDate, makeSearchUrl } from '../utils/formatStrings'
import { Icon } from '../../../components/icon/Icon'
import { useNavigate } from 'react-router-dom'

export default function EventItem({ event }) {
  const navigate = useNavigate()

  const handleMoreClick = () => {
    navigate(`/edit${event.eventType === 'FORM' ? 'form' : 'csv'}/${event.id}`)
  }

  const handleCopyUrl = (url) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('링크가 복사되었습니다!')
      })
      .catch((err) => {
        toast.error('복사 실패', { autoClose: 2000 })
        console.error('복사 실패:', err)
      })
  }

  return (
    <div>
      <div className='event-header'>
        <div className='event-title'>
          <div className='event-title__title'>{event.eventTitle}</div>
          <Icon
            name={event.isActive === true ? 'dashboard-active' : 'dashboard-disable'}
            height={21}
            className='event-title__status'
          />
          <Icon
            name={event.eventType === 'FORM' ? 'dashboard-form' : 'dashboard-csv'}
            height={21}
            className='event-title__format'
          />
        </div>
        <div className='event-info'>
          <div className='event-info__createAt'>
            <Icon name='dashboard-date' height={12} className='event-info__createAt--icon' />
            {formatDate(event.createdAt)}
          </div>
          <div className='event-info__views'>
            <Icon name='dashboard-view' height={10} className='event-info__views--icon' />
            {`${event.viewCount} 조회`}
          </div>
        </div>
        <Icon
          name='button-more'
          width={1}
          height={13}
          className='event-item__more'
          onClick={handleMoreClick}
        />
      </div>
      <div className='event-links'>
        <div className='event-search'>
          <div className='event-search__info'>
            <div className='event-search__title'>조회용 링크</div>
            <div className='event-search__link'>{makeSearchUrl(event.id)}</div>
          </div>
          <Icon
            name='button-copy-search'
            height={12}
            className='event-search__copy'
            onClick={() => handleCopyUrl(makeSearchUrl(event.id))}
          />
        </div>
        <div className='event-apply'>
          <div className='event-apply__info'>
            <div className='event-apply__title'>신청용 링크</div>
            <div className='event-apply__link'>{event.formUrl}</div>
          </div>
          <Icon
            name='button-copy-form'
            height={12}
            className='event-apply__copy'
            onClick={() => handleCopyUrl(event.formUrl)}
          />
        </div>
      </div>
    </div>
  )
}
