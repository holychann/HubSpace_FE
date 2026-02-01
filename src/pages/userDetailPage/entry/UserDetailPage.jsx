import './UserDetailPage.css'
import GradientButton from '../../../components/gradientButton/GradientButton'
import GradientLayout from '../../../components/gradientLayout/GradientLayout'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { userFieldPlaceholders } from '../../userResultPage/utils/UserFieldConfig'
import { useFetchEventDetail } from '../apis/fetchEventDetail'

// 사용자 이벤트 신청 조회 페이지
export default function UserDetailPage() {
  const navigate = useNavigate()
  const eventId = useSearchParams()[0].get('eventId')

  // api로 이벤트 정보 조회
  const { eventDetail, loading, error } = useFetchEventDetail(eventId)

  // 임시 로딩 화면
  if (loading) {
    return (
      <GradientLayout>
        <div className='user-detail__card'>
          <p className='user-detail__description'>이벤트 정보를 불러오는 중...</p>
        </div>
      </GradientLayout>
    )
  }

  if (error) {
    return (
      <GradientLayout>
        <div className='user-detail__card'>
          <h1 className='user-detail__title'>오류 발생</h1>
          <p className='user-detail__description'>{error}</p>
          <GradientButton onClick={() => window.location.reload()}>다시 시도</GradientButton>
        </div>
      </GradientLayout>
    )
  }

  if (!eventDetail) {
    return (
      <GradientLayout>
        <div className='user-detail__card'>
          <h1 className='user-detail__title'>이벤트를 찾을 수 없습니다</h1>
          <p className='user-detail__description'>올바른 링크로 접속했는지 확인해주세요</p>
        </div>
      </GradientLayout>
    )
  }

  return <UserDetailForm eventDetail={eventDetail} eventId={eventId} navigate={navigate} />
}

function UserDetailForm({ eventDetail, eventId, navigate }) {
  const initialFormData = {}
  eventDetail.searchColumns.forEach((columnName) => {
    initialFormData[columnName] = ''
  })

  const [userFormData, setUserFormData] = useState(initialFormData)

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

    // result 페이지로 이동
    // userSearchData -> 사용자가 입력한 값
    navigate('/result', { state: { eventId, eventDetail, userSearchData: userFormData } })
  }

  return (
    <GradientLayout>
      {/* 로고 영역 */}
      <div className='user-detail__logo'></div>
      <div className='user-detail__card'>
        <h1 className='user-detail__title'>신청 조회</h1>
        <p className='user-detail__description'>이벤트 신청 여부를 정보 입력 후 확인 가능합니다</p>

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
                placeholder={userFieldPlaceholders[columnName]}
                value={userFormData[columnName]}
                onChange={handlerUserInput}
                required
              />
            </div>
          ))}

          <GradientButton type='submit'>조회하기</GradientButton>
        </form>
      </div>
    </GradientLayout>
  )
}
