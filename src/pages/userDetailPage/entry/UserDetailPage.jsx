import './UserDetailPage.css'
import GradientButton from '../../../components/gradientButton/GradientButton'
import GradientLayout from '../../../components/gradientLayout/GradientLayout'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useRef, useState } from 'react'
import { useFetchEventDetail } from '../apis/fetchEventDetail'
import LoadingSpinner from '../../../components/loadingSpinner/LoadingSpinner'
import LookupLayout from '../../../components/lookupLayout/LookupLayout'
import UserDetailContent, { UserDetailLogo } from '../component/UserDetailContent'

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
      <GradientLayout className='user-detail__loadingLayout'>
        <div className='user-detail__container'>
          <UserDetailLogo />
          <div className='user-detail__loading'>
            <LoadingSpinner
              className='user-detail__loadingSpinner'
              size={48}
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
  const isNavigatingRef = useRef(false)
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
    if (isNavigatingRef.current) return
    isNavigatingRef.current = true
    document.activeElement?.blur()

    // result 페이지로 이동
    // userSearchData -> 사용자가 입력한 값
    navigate('/result', { state: { eventId, eventDetail, userSearchData: userFormData } })
  }

  return (
    <LookupLayout
      action={
        <button type='submit' form='user-detail-form' className='user-detail__submitButton'>
          조회하기
        </button>
      }
    >
      <UserDetailContent
        eventDetail={eventDetail}
        values={userFormData}
        onChange={handlerUserInput}
        onSubmit={handleSearch}
      />
    </LookupLayout>
  )
}
