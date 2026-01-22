import DeleteButton from '../../../components/deleteButton/DeleteButton'
import EventButton from '../../../components/eventButton/EventButton'
import EventDropdown from '../../../components/eventDropdown/EventDropdown'
import EventInput from '../../../components/eventInput/EventInput'
import { Icon } from '../../../components/icon/Icon'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { csvEvent } from '../utils/CsvDetailDummy'
import './CsvDetailPage.css'

export default function CsvDetailPage() {
  const event = csvEvent.data
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState(event.displayColumn)

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev)
  }

  const handleSelect = (value) => {
    setSelectedColumn(value)
    setIsOpen(false) // 선택하면 닫기
  }

  const handleCopyId = (id) => {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        toast.success('ID가 복사되었습니다!')
      })
      .catch((err) => {
        toast.error('복사 실패', { autoClose: 2000 })
        console.error('복사 실패:', err)
      })
  }

  const handleEdit = () => {
    // 이벤트 수정 로직 구현
    toast.success('이벤트 정보가 수정되었습니다!')
    navigate('/dashboard')
  }

  return (
    <div>
      <div className='csvDetail-header'>
        <div className='csvDetail-header__title'>이벤트 수정</div>
        <div className='csvDetail-header__info'>이벤트 상세 정보를 수정 가능합니다.</div>
      </div>
      <div className='csvDetail-identity'>
        <div className='csvDetail-id'>
          <div className='csvDetail-id__title'>
            <div className='csvDetail-id__id'>{`이벤트 ID : ${event.id}`}</div>
            <Icon
              name='detail-copy'
              height={14}
              className='csvDetail-id__copy'
              onClick={() => handleCopyId(event.id)}
            />
          </div>
          <div className='csvDetail-id__info'>이벤트 고유 ID이며, 어디에 사용됩니다.</div>
        </div>
        <div className='csvDetail-name'>
          <EventInput />
        </div>
      </div>
      <div className='csvDetail-field'>
        <div className='csvDetail-field__header'>
          <div className='csvDetail-field__title'>조회 인증 정보</div>
          <div className='csvDetail-field__info'>
            신청자가 조회 시 입력할 정보 필드를 설정하세요.
          </div>
        </div>
        <div className='csvDetail-field__field'>
          <EventDropdown columns={event.searchColumns} disabled={true} />
        </div>
        <div className='csvDetail-field__header'>
          <div className='csvDetail-field__title'>조회 확인 정보</div>
          <div className='csvDetail-field__info'>
            신청자가 조회 시 확인 가능한 정보를 설정하세요.
          </div>
        </div>
        <div className='csvDetail-display'>
          <div className='csvDetail-display__label'>사용자 조회 정보</div>

          <div className='csvDetail-display__toggle' onClick={toggleDropdown}>
            <div className='csvDetail-display__title'>{selectedColumn}</div>

            <Icon
              name='detail-field'
              height={4}
              className={`csvDetail-display__arrow ${isOpen ? 'open' : ''}`}
            />
          </div>

          {isOpen && (
            <div className='csvDetail-display__content'>
              <div
                className={`csvDetail-display__item ${
                  selectedColumn === event.displayColumn ? 'selected' : ''
                }`}
                onClick={() => handleSelect(event.displayColumn)}
              >
                {event.displayColumn}
              </div>

              <div
                className={`csvDetail-display__item ${
                  selectedColumn === '표시 안 함' ? 'selected' : ''
                }`}
                onClick={() => handleSelect('표시 안 함')}
              >
                표시 안 함
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='csvDetail-footer'>
        <DeleteButton />
        <EventButton text='이벤트 수정' onClick={handleEdit} />
      </div>
    </div>
  )
}
