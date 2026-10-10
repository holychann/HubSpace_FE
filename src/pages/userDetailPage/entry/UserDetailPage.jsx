import './UserDetailPage.css'
import GradientButton from '../../../components/gradientButton/GradientButton'
import GradientLayout from '../../../components/gradientLayout/GradientLayout'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { getUserFieldPlaceholder } from '../../userResultPage/utils/UserFieldConfig'
import { useFetchEventDetail } from '../apis/fetchEventDetail'
import LoadingSpinner from '../../../components/loadingSpinner/LoadingSpinner'
import authLogo from '../../../assets/auth/auth-logo.png'

// 사용자 이벤트 신청 조회 페이지
export default function UserDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const eventId = useSearchParams()[0].get('eventId')

  // api로 이벤트 정보 조회
  const { eventDetail, loading, error } = useFetchEventDetail(eventId)

  // 임시 로딩 화면
  if (loading) {
    return (
      <GradientLayout>
        <div className='user-detail__container'>
          <a href='/' className='user-detail__logoLink' aria-label='홈으로 이동'>
            <img src={authLogo} alt='HubSpace' className='user-detail__logo' />
          </a>
          <div className='user-detail__loading'>
            <LoadingSpinner
              className='user-detail__loadingSpinner'
              size={48}
              cubeSize={16}
              color='#2d3b86'
            />
            <p className='user-detail__loadingText'>이벤트 정보를 불러오는 중...</p>
          </div>
        </div>
      </GradientLayout>
    )
  }

  if (error) {
    return (
      <GradientLayout>
        <div className='user-detail__container'>
          <div className='user-detail__card'>
            <h1 className='user-detail__title'>오류 발생</h1>
            <p className='user-detail__description'>{error}</p>
            <GradientButton onClick={() => window.location.reload()}>다시 시도</GradientButton>
          </div>
        </div>
      </GradientLayout>
    )
  }

  if (!eventDetail) {
    return (
      <GradientLayout>
        <div className='user-detail__container'>
          <div className='user-detail__card'>
            <h1 className='user-detail__title'>이벤트를 찾을 수 없습니다</h1>
            <p className='user-detail__description'>올바른 링크로 접속했는지 확인해주세요</p>
          </div>
        </div>
      </GradientLayout>
    )
  }

  return (
    <UserDetailForm
      eventDetail={eventDetail}
      eventId={eventId}
      navigate={navigate}
      restoredUserSearchData={location.state?.userSearchData}
    />
  )
}

function UserDetailForm({ eventDetail, eventId, navigate, restoredUserSearchData }) {
  const [userFormData, setUserFormData] = useState(() => {
    const initialFormData = {}
    eventDetail.searchColumns.forEach((columnName) => {
      const restoredValue = restoredUserSearchData?.[columnName]
      initialFormData[columnName] = typeof restoredValue === 'string' ? restoredValue : ''
    })
    return initialFormData
  })

  // input 값 변경 시 실행 함수
  const handlerUserInput = (e) => {
    const { name, value } = e.target
    setUserFormData((prev) => ({
      ...prev, // 기존 값 유지
      [name]: value, // name에 해당하는 key 업데이트
    }))
  }

  // 조회 버튼 클릭 (form 제출)
  const handleSearch = (e) => {
    e.preventDefault()
    document.activeElement?.blur()

    // result 페이지로 이동
    // userSearchData -> 사용자가 입력한 값
    navigate('/result', { state: { eventId, eventDetail, userSearchData: userFormData } })
  }

  return (
    <GradientLayout>
      <div className='user-detail__container'>
        {/* 로고 영역 */}
        <a href='/' className='user-detail__logoLink' aria-label='홈으로 이동'>
          <img src={authLogo} alt='HubSpace' className='user-detail__logo' />
        </a>
        <div className='user-detail__card'>
          <h1 className='user-detail__title'>{eventDetail.eventTitle || '신청 조회'}</h1>
          <p className='user-detail__description'>정보를 입력해 조회하세요.</p>

          <form className='user-detail__form' onSubmit={handleSearch}>
            {/* 관리자가 선택한 필드만 동적으로 랜더링 */}
            {eventDetail.searchColumns.map((columnName) => (
              <div className='user-detail__field' key={columnName}>
                <label htmlFor={columnName} className='user-detail__label'>
                  {columnName}
                </label>
                <input
                  type='text'
                  id={columnName}
                  name={columnName}
                  className='user-detail__input'
                  placeholder={getUserFieldPlaceholder(columnName)}
                  value={userFormData[columnName]}
                  onChange={handlerUserInput}
                  required
                />
              </div>
            ))}

            <GradientButton type='submit' className='user-detail__submitButton'>
              조회하기
            </GradientButton>
          </form>
        </div>
      </div>
    </GradientLayout>
  )
}
