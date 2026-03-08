import './FormCreatePage.css'
import { useState } from 'react'
import EventInput from '../../../components/eventInput/EventInput'
import EventButton from '../../../components/eventButton/EventButton'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { createFormEvent } from '../apis/createFormEvent'

export default function FormCreatePage() {
  const [eventTitle, setEventTitle] = useState('')
  const [selectedFields, setSelectedFields] = useState(['', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()

  const trimmedTitle = eventTitle.trim()
  // 실제 입력된 필드만 추출
  const validFields = selectedFields.map((v) => v.trim()).filter((v) => v !== '')

  const isValid =
    trimmedTitle.length > 0 &&
    validFields.length >= 2 &&
    validFields.length <= 3 &&
    new Set(validFields).size === validFields.length // 중복 방지

  const handleFieldChange = (index, value) => {
    const nextFields = [...selectedFields]
    nextFields[index] = value
    setSelectedFields(nextFields)
  }

  const handleCreateForm = async () => {
    if (isSubmitting) return

    if (!isValid) {
      toast.error('이벤트 관리명과 필드를 2개 이상, 중복 없이 입력해주세요.', { autoClose: 2000 })
      return
    }

    try {
      setIsSubmitting(true)

      await createFormEvent({
        eventTitle: trimmedTitle,
        searchColumns: validFields,
      })

      toast.success('이벤트 폼이 생성되었습니다!')
      navigate('/dashboard')
    } catch (err) {
      const message = err?.response?.data?.message || '이벤트 생성에 실패했습니다.'
      toast.error(message, { autoClose: 2000 })
    } finally {
      setIsSubmitting(false)
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
          <EventInput value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
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
              생성 완료 후, 정보 1, 정보 2, 정보 3은 수정하시면 안됩니다.
            </div>

            <div className='formCreate-field__field'>
              <div className='formCreate-fieldInputRow'>
                {['정보 1', '정보 2', '정보 3'].map((label, index) => (
                  <div key={label} className='formCreate-fieldInput'>
                    <div className='formCreate-fieldInput__label'>{label}</div>
                    <div className='formCreate-fieldInput__box'>
                      <input
                        className='formCreate-fieldInput__input'
                        placeholder={`${label} 항목명을 입력하세요.`}
                        value={selectedFields[index]}
                        onChange={(e) => handleFieldChange(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
          <EventButton text={isSubmitting ? '생성 중...' : '이벤트 생성'} onClick={handleCreateForm} />
        </div>
      </div>
    </div>
  )
}
