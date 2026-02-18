import { useState, useEffect } from 'react'
import GradientLayout from '../../../components/gradientLayout/GradientLayout'
import GradientButton from '../../../components/gradientButton/GradientButton'
import backIcon from '../../../assets/auth/auth-back-icon.svg'
import './UserResultPage.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { processUserResult } from '../utils/UserFieldConfig'

import { fetchUserSearch } from '../apis/fetchUserSearch'

// 사용자 이벤트 신청 조회 결과 페이지
export default function UserResultPage() {
  const navigate = useNavigate()
  const location = useLocation() // state로 넘긴 data 받음

  const { eventDetail, userSearchData } = location.state || {}
  const [userSearchResult, setUserSearchResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 임시로 더미 데이터 반환
        const userApiResponse = await fetchUserSearch(
          eventDetail.eventId,
          userSearchData,
          eventDetail,
        )
        const processResult = processUserResult(userApiResponse, eventDetail, userSearchData)
        setUserSearchResult(processResult)
      } catch (err) {
        console.error('조회 실패:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventDetail.userSearchData])

  // 로딩 중
  if (loading) {
    return (
      <GradientLayout>
        <div className='user-result__container'>
          <p>조회 중...</p>
        </div>
      </GradientLayout>
    )
  }

  // 결과 없음
  if (!userSearchResult) {
    return (
      <GradientLayout>
        <div className='user-result__container'>
          <p>조회 결과를 불러올 수 없습니다</p>
        </div>
      </GradientLayout>
    )
  }

  //사용자 이름 설정
  let userName = '000'
  if (userSearchResult.userResultType === 'notFound') {
    userName = userSearchResult.userDisplayName
  } else if (userSearchResult.userResultType === 'detail') {
    // answers에서 첫 번째 칼럼 값 사용
    userName = userSearchResult.userDetailInfo[userSearchResult.userSearchColumns[0]]
  }

  // 메세지 설정
  const userMessage =
    userSearchResult.userResultType === 'notFound'
      ? userSearchResult.userResultMessage
      : '정보가 아래와 같이 조회되었습니다.'

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

          {/* 사용자 상세 정보 */}
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
