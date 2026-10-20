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
import LoadingSpinner from '../../../components/loadingSpinner/LoadingSpinner'
import GooglePermissionModal from '../component/GooglePermissionModal'
import {
  consumeGoogleConsentDraft,
  saveGoogleConsentRequest,
} from '../../../utils/googleConsentStorage'

const FormCreateGuide = lazy(() => import('../component/FormCreateGuide'))

export default function FormCreatePage() {
  const [eventTitle, setEventTitle] = useState('')
  const [selectedFields, setSelectedFields] = useState(['', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      toast.success('Google 권한 설정을 확인했습니다. 이벤트 생성을 다시 눌러주세요.')
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

  const handleCreateForm = async () => {
    if (isSubmitting) return

    if (!isValid) {
      toast.error('이벤트 관리명과 필드를 2개 이상, 중복 없이 입력해주세요.', { duration: 2000 })
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
      if (err?.errorCode === GOOGLE_PERMISSION_REQUIRED_CODE) {
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
      {isSubmitting && (
        <div className='formCreate-loadingOverlay'>
          <LoadingSpinner
            className='formCreate-loadingSpinner'
            size={48}
            cubeSize={16}
            color='#2d3b86'
          />
          <div className='formCreate-loadingText'>폼 생성 중...</div>
        </div>
      )}
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

        <h2 className='formCreate-inputDivider'>Form Info</h2>

        <div className='formCreate-name'>
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
                        placeholder={`${label} 항목명을 입력하세요.`}
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
          <EventButton text={isSubmitting ? '생성 중...' : '이벤트 생성'} onClick={handleCreateForm} />
        </div>
      </div>

      <GooglePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onConfirm={handlePermissionConfirm}
      />
    </div>
  )
}
