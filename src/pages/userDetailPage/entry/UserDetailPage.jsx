import './UserDetailPage.css'
import GradientButton from '../../../components/gradientButton/GradientButton'
import GradientLayout from '../../../components/gradientLayout/GradientLayout'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { userFieldPlaceholders } from '../../userResultPage/utils/UserFieldConfig'

import { userEventConfig } from '../../userResultPage/utils/UserResultDummy'

// 사용자 이벤트 신청 조회 페이지
export default function UserDetailPage() {
  const navigate = useNavigate()

  // 관리자가 선택한 필드에 따라 초기 form
  const userInitialFormData = {}
  userEventConfig.searchColumns.forEach((columnName) => {
    userInitialFormData[columnName] = ''
  }) // 빈 문자열로 초기화

  // useFormData -> 현재 input 값 저장
  // setUserFormData -> 상태 변경 함수
  const [userFormData, setUserFormData] = useState(userInitialFormData)

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
    navigate('/result', { state: { userSearchData: userFormData } })
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
          {userEventConfig.searchColumns.map((columnName) => (
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
