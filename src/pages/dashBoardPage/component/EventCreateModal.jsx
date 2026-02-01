import './EventCreateModal.css'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/icon/Icon'

export default function EventCreateModal({ isOpen, onClose }) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleCreateForm = () => {
    navigate('/newform')
    onClose()
  }
  const handleCreateCSV = () => {
    navigate('/newcsv')
    onClose()
  }
  return (
    <div className='createModal-overlay' onClick={onClose}>
      <div className='createModal-content' onClick={(e) => e.stopPropagation()}>
        <button className='createModal-close' onClick={onClose}>
          ✕
        </button>
        <div className='createModal-header'>
          <div className='createModal-header__title'>새 이벤트 생성</div>
          <div className='createModal-header__info'>생성할 이벤트 형식을 선택하세요</div>
        </div>
        <div className='createModal-buttons'>
          <div className='createModal-button__form' onClick={handleCreateForm}>
            <Icon
              name='dashboard-image-form'
              height={89}
              className='createModal-button__form--image'
            />
            <div className='createModal-button__title'>Google Form</div>
            <div className='createModal-button__info'>구글폼 연동하여 생성</div>
          </div>
          <div className='createModal-button__csv' onClick={handleCreateCSV}>
            <Icon
              name='dashboard-image-csv'
              height={89}
              className='createModal-button__csv--image'
            />
            <div className='createModal-button__title'>CSV 파일</div>
            <div className='createModal-button__info'>CSV 파일을 업로드하여 생성</div>
          </div>
        </div>
      </div>
    </div>
  )
}
