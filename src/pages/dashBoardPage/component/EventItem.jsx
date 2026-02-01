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
    <div className='eventItem'>
      <div className='eventItem-header'>
        <div className='eventItem-header__header'>
          <div className='eventItem-title'>
            <div className='eventItem-title__title'>{event.eventTitle}</div>
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
          <div className='eventItem-info'>
            <div className='eventItem-info__info'>
              <Icon name='dashboard-date' height={12} className='eventItem-info__icon' />
              {formatDate(event.createdAt)}
            </div>
            <div className='eventItem-info__info'>
              <Icon name='dashboard-view' height={10} className='eventItem-info__icon' />
              {`${event.viewCount} 조회`}
            </div>
          </div>
        </div>
        <Icon
          name='button-more'
          width={3}
          className='eventItem-item__more'
          onClick={handleMoreClick}
        />
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
              <div className='eventItem-link__title'>신청용 링크</div>
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
