import GradientLayout from '../../../components/gradientLayout/GradientLayout'
import GradientButton from '../../../components/gradientButton/GradientButton'
import backIcon from '../../../assets/auth/auth-back-icon.svg'
import './UserResultPage.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { processUserResult } from '../utils/UserFieldConfig'

import { getUserSearchResult, userEventConfig } from '../utils/UserResultDummy'

// 사용자 이벤트 신청 조회 결과 페이지
export default function UserResultPage() {
  const navigate = useNavigate()
  const location = useLocation() // state로 넘긴 data 받음

  const userSearchData = location.state?.userSearchData || {}

  // 더미 api 호출
  const userApiResponse = getUserSearchResult(userSearchData)

  const userSearchResult = processUserResult(userApiResponse, userEventConfig, userSearchData)

  // 타이틀 설정
  let userName = ''
  let userMessage = ''

  if (userSearchResult.userResultType === 'notFound') {
    userName = userSearchResult.userDisplayName
    userMessage = userSearchResult.userResultMessage
  } else if (userSearchResult.userResultType === 'success') {
    userName = userSearchResult.userDisplayName
    userMessage = '정보가 정상적으로 조회되었습니다.'
  } else if (userSearchResult.userResultType === 'detail') {
    userName = userSearchResult.userDetailInfo['이름']
    userMessage = '정보가 아래와 같이 조회되었습니다.'
  }

  // 돌아가기 버튼 클릭 시 실행
  const handleGoBack = () => {
    navigate(-1) // 브라우저 히스토리 기준 이전 페이지
  }

  return (
    // 전체 페이지
    <GradientLayout>
      <div className='user-result__container'>
        {/* 로고 영역 */}
        <div className='user-result__logo'></div>
        {/* 중앙 흰색 결과 카드 */}
        <div className='user-result__card'>
          <h1 className='user-result__title__01'>{userName}님</h1>
          <h2 className='user-result__title__02'>{userMessage}</h2>

          {/* 사용자 정보 */}
          {userSearchResult.userResultType === 'detail' && (
            <div className='user-result__box'>
              {userSearchResult.userSearchColumns.map((columnName) => (
                <>
                  <span key={`label-${columnName}`}>{columnName}:</span>
                  <span key={`value-${columnName}`}>
                    {userSearchResult.userDetailInfo[columnName]}
                  </span>
                </>
              ))}

              <span>제출 여부:</span>
              <span>{userSearchResult.userDetailInfo['제출여부']}</span>
            </div>
          )}
        </div>
        <div className='user-result__button'>
          <GradientButton type='button' onClick={handleGoBack}>
            <img src={backIcon} className='user-result__button-icon' />
            <span>돌아가기</span>
          </GradientButton>
        </div>
      </div>
    </GradientLayout>
  )
}
