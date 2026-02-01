import './FormCreatePage.css'
import { useState } from 'react'
import EventInput from '../../../components/eventInput/EventInput'
import EventDropdown from '../../../components/eventDropdown/EventDropdown'
import EventButton from '../../../components/eventButton/EventButton'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export default function FormCreatePage() {
  const defaultColumns = ['이름', '학번', '전화번호', '생년월일']

  const [selectedFields, setSelectedFields] = useState(['선택', '선택', '선택'])

  const navigate = useNavigate()

  // 실제 선택된 필드만 추출
  const validFields = selectedFields.filter((v) => v !== '선택')

  const isValid =
    validFields.length >= 2 &&
    validFields.length <= 3 &&
    new Set(validFields).size === validFields.length // 중복 방지

  const handleCreateForm = () => {
    // 폼 생성 로직 구현
    if (isValid) {
      toast.success('이벤트 폼이 생성되었습니다!')
      navigate('/dashboard')
    } else {
      toast.error('필드를 2개 이상, 중복 없이 선택해주세요.', { autoClose: 2000 })
    }
  }

  return (
    <div className='formCreate'>
      <div className='formCreate-container'>
        <div className='formCreate-header'>
          <div className='formCreate-title'>새 이벤트 생성하기 - 폼</div>
          <div className='formCreate-info'>이벤트 정보를 입력하고 조회 시스템을 생성하세요</div>
        </div>

        <div className='formCreate-name'>
          <EventInput />
        </div>

        <div className='formCreate-field'>
          <div className='formCreate-field__header'>
            <div className='formCreate-field__title'>
              <div className='formCreate-field__title--title'>폼 생성 필드</div>
              <div className='formCreate-field__title--notice'>2개 이상 선택 필수</div>
            </div>

            <div className='formCreate-field__info'>
              신청자가 조회 시 입력할 정보 필드를 설정하세요.
            </div>

            <div className='formCreate-field__info--notice'>
              생성 완료 후, 정보 1, 정보 2, 정보 3은 수정이 불가합니다.
            </div>

            <div className='formCreate-field__field'>
              <EventDropdown
                columns={defaultColumns}
                value={selectedFields}
                onChange={setSelectedFields}
                disabled={false}
              />
            </div>

            <div className='formCreate-field__condition'>
              <div className='formCreate-field__condition--title'>필드 선택 기준</div>
              <div className='formCreate-field__condition--info'>
                <p>ㅁ 필드는 최소 2개, 최대 3개까지 선택 가능합니다.</p>
                <p>ㅁ 필드 순서는 조회 화면 표시 순서와 동일합니다.</p>
              </div>
            </div>
          </div>
        </div>

        <div className='formCreate-button'>
          <EventButton text='이벤트 생성' onClick={handleCreateForm} />
        </div>
      </div>
    </div>
  )
}
