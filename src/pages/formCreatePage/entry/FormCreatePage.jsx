import './FormCreatePage.css'
import { lazy, Suspense, useEffect, useState } from 'react'
import EventInput from '../../../components/eventInput/EventInput'
import EventButton from '../../../components/eventButton/EventButton'
import { toast } from 'sonner'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  createFormEvent,
  GOOGLE_PERMISSION_REQUIRED_CODE,
} from '../apis/createFormEvent'
import CreateNotice from '../../../components/createNotice/CreateNotice'
import EventCreateConfirmModal from '../../../components/eventCreateConfirmModal/EventCreateConfirmModal'
import GooglePermissionModal from '../component/GooglePermissionModal'
import {
  consumeGoogleConsentDraft,
  saveGoogleConsentRequest,
} from '../../../utils/googleConsentStorage'

const FormCreateGuide = lazy(() => import('../component/FormCreateGuide'))

const FORM_NOTICES = [
  {
    title: '조회 항목의 이름을 유지해주세요',
    description: '자동 생성된 조회 항목의 이름을 폼에서 바꾸면 정상적으로 조회되지 않을 수 있습니다.',
  },
  {
    title: '질문 타입은 변경할 수 있어요',
    description: '자동 생성된 항목의 타입을 바꿔도 정상적으로 조회할 수 있습니다.',
  },
  {
    title: '폼은 자유롭게 꾸밀 수 있어요',
    description: '폼 제목과 설명, 직접 추가한 질문은 자유롭게 수정할 수 있습니다.',
  },
]

export default function FormCreatePage() {
  const [eventTitle, setEventTitle] = useState('')
  const [selectedFields, setSelectedFields] = useState(['', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const savedDraft = consumeGoogleConsentDraft()

    if (savedDraft) {
      if (typeof savedDraft.eventTitle === 'string') {
        setEventTitle(savedDraft.eventTitle)
      }

      if (Array.isArray(savedDraft.selectedFields)) {
        const restoredFields = savedDraft.selectedFields
          .slice(0, 3)
          .map((field) => (typeof field === 'string' ? field : ''))

        setSelectedFields([...restoredFields, '', '', ''].slice(0, 3))
      }
    }

    const consentStatus = new URLSearchParams(location.search).get('googleConsent')

    if (consentStatus === 'success') {
      toast.success('Google 권한 설정을 확인했습니다. 입력 완료를 다시 눌러주세요.')
      navigate('/newform', { replace: true })
    } else if (consentStatus === 'denied') {
      toast.error('Google 권한이 허용되지 않아 폼을 생성할 수 없습니다.')
      navigate('/newform', { replace: true })
    }
  }, [location.search, navigate])

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

  // 입력값을 검사한 뒤 최종 확인 화면을 띄운다. 생성 요청은 확인 화면의 '이벤트 생성'에서 시작한다.
  const handleOpenConfirm = () => {
    if (isSubmitting) return

    if (!isValid) {
      toast.error('이벤트 관리명과 필드를 2개 이상, 중복 없이 입력해주세요.', { duration: 2000 })
      return
    }

    setIsConfirmOpen(true)
  }

  // 실패하면 확인 화면을 열어둔 채 입력값을 유지해 바로 다시 시도할 수 있게 한다.
  const handleCreateForm = async () => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      await createFormEvent({
        eventTitle: trimmedTitle,
        searchColumns: validFields,
      })

      toast.success('이벤트 폼이 생성되었습니다!')
      navigate('/dashboard')
    } catch (err) {
      if (err?.errorCode === GOOGLE_PERMISSION_REQUIRED_CODE) {
        setIsConfirmOpen(false)
        setIsPermissionModalOpen(true)
        return
      }

      const message = err?.message || '이벤트 생성에 실패했습니다.'
      toast.error(message, { duration: 2000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePermissionConfirm = () => {
    saveGoogleConsentRequest({ eventTitle, selectedFields })
    window.location.href = `${import.meta.env.VITE_SERVER_DOMAIN}/oauth2/authorization/google?reauthorize=true`
  }

  return (
    <div className='formCreate'>
      <div className='formCreate-container'>
        <div className='formCreate-header'>
          <div className='formCreate-title'>새 이벤트 생성 - FORM</div>
        </div>

        <section className='formCreate-preview' aria-labelledby='formCreate-preview-title'>
          {/*<div className='formCreate-preview__header'>*/}
          {/*  <h2 id='formCreate-preview-title' className='formCreate-preview__title'>*/}
          {/*    폼 생성 미리보기*/}
          {/*  </h2>*/}
          {/*</div>*/}
          <Suspense fallback={<div className='formCreate-guide' />}>
            <FormCreateGuide />
          </Suspense>
        </section>

        <div className='formCreate-notice'>
          <CreateNotice title='확인해주세요' items={FORM_NOTICES} />
        </div>

        <h2 className='formCreate-inputDivider'>Form Info</h2>

        <div className={`formCreate-name ${trimmedTitle ? 'formCreate-name--filled' : ''}`}>
          <EventInput value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
        </div>

        <div className='formCreate-field'>
          <div className='formCreate-field__header'>
            <div className='formCreate-field__title'>
              <div className='formCreate-field__title--title'>폼 생성 필드</div>
              <div className='formCreate-field__title--notice'>2개 이상 입력 필수</div>
            </div>

            <div className='formCreate-field__infoBox'>
              <div className='formCreate-field__info'>
                신청자가 조회 시 입력할 정보 필드를 설정하세요.
              </div>
              <div className='formCreate-field__info--notice'>
                폼 생성 후 항목명을 변경하시면 의도하지 않은 데이터가 집계될 수 있습니다.
              </div>
            </div>

            <div className='formCreate-field__field'>
              <div className='formCreate-fieldInputRow'>
                {['정보 1', '정보 2', '정보 3'].map((label, index) => (
                  <div key={label} className='formCreate-fieldInput'>
                    <div className='formCreate-fieldInput__label'>{label}</div>
                    <div className='formCreate-fieldInput__box'>
                      <input
                        className={`formCreate-fieldInput__input ${
                          selectedFields[index].trim() ? 'formCreate-fieldInput__input--filled' : ''
                        }`}
                        placeholder={['ex) 이름', 'ex) 학번 또는 사번', 'ex) 전화번호'][index]}
                        value={selectedFields[index]}
                        onChange={(e) => handleFieldChange(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='formCreate-button'>
          <EventButton
            variant='navy'
            text='입력 완료'
            onClick={handleOpenConfirm}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <EventCreateConfirmModal
        isOpen={isConfirmOpen}
        method='form'
        rows={[
          { label: '이벤트 관리명', value: trimmedTitle },
          { label: '조회 항목', value: validFields.join(', ') },
        ]}
        notice={{
          main: '조회 항목의 이름을 유지해주세요.\n이름을 바꾸면 조회되지 않을 수 있습니다.',
          sub: '질문 타입, 직접 추가한 질문, 폼 제목과 설명은 변경할 수 있습니다.',
        }}
        isProcessing={isSubmitting}
        onConfirm={handleCreateForm}
        onClose={() => setIsConfirmOpen(false)}
      />

      <GooglePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onConfirm={handlePermissionConfirm}
      />
    </div>
  )
}
