import { useState, useEffect } from 'react'
import GradientLayout from '../../../components/gradientLayout/GradientLayout'
import GradientButton from '../../../components/gradientButton/GradientButton'
import './UserResultPage.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { isGoogleFormsEvent, processUserResult } from '../utils/UserFieldConfig'
import { toast } from 'sonner'

import { fetchUserSearch } from '../apis/fetchUserSearch'
import LoadingSpinner from '../../../components/loadingSpinner/LoadingSpinner'
import authLogo from '../../../assets/auth/auth-logo.png'
import AnimatedCheck from '../../../components/animatedCheck/AnimatedCheck'
import AlertIcon from '../../../assets/result/result-alert.svg?react'

// 사용자 이벤트 신청 조회 결과 페이지
export default function UserResultPage() {
  const navigate = useNavigate()
  const location = useLocation() // state로 넘긴 data 받음

  const { eventId, eventDetail, userSearchData } = location.state || {}
  const [userSearchResult, setUserSearchResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    document.querySelector('.gradient-layout')?.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    console.debug('[UserResultPage][InitState]', {
      eventId,
      eventDetail,
      userSearchData,
    })

    if (!eventId || !eventDetail || !userSearchData) {
      setErrorMessage('잘못된 접근입니다. 조회 페이지에서 다시 시도해주세요.')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const userApiResponse = await fetchUserSearch(eventId, userSearchData)
        const processResult = processUserResult(userApiResponse, eventDetail)
        console.debug('[UserResultPage][ProcessedResult]', processResult)
        setUserSearchResult(processResult)
        setErrorMessage('')
      } catch (err) {
        console.error('[UserResultPage][FetchError]', err)
        setErrorMessage(err?.response?.data?.message || err?.message || '조회 실패')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId, eventDetail, userSearchData])

  useEffect(() => {
    if (
      userSearchResult?.userResultType !== 'notFound' ||
      !isGoogleFormsEvent(eventDetail)
    ) {
      return
    }

    const syncDelayToastId = toast.info('방금 신청하셨나요?', {
      id: `google-forms-sync-delay-${eventId}`,
      description:
        'Google Forms 신청 정보는 바로 반영되지 않을 수 있어요. 반영까지 약 1~2분 정도 걸릴 수 있으니 잠시 후 다시 확인해 주세요.',
      duration: 6000,
      richColors: false,
      className: 'user-result__syncToast',
    })

    return () => toast.dismiss(syncDelayToastId)
  }, [eventDetail, eventId, userSearchResult])

  // 로딩 중
  if (loading) {
    return (
      <GradientLayout>
        <div className='user-result__container'>
          <a href='/' className='user-result__logoLink' aria-label='홈으로 이동'>
            <img src={authLogo} alt='HubSpace' className='user-result__logo' />
          </a>
          <div className='user-result__loading'>
            <LoadingSpinner
              className='user-result__loadingSpinner'
              size={48}
              cubeSize={16}
              color='#2d3b86'
            />
            <p className='user-result__loadingText'>조회 중입니다...</p>
          </div>
        </div>
      </GradientLayout>
    )
  }

  // 결과 없음
  if (!userSearchResult) {
    return (
      <GradientLayout>
        <div className='user-result__container'>
          <p>{errorMessage || '조회 결과를 불러올 수 없습니다'}</p>
        </div>
      </GradientLayout>
    )
  }
  const detailEntries =
    userSearchResult.userResultType === 'detail'
      ? Object.entries(userSearchResult.userDetailInfo || {})
      : []

  // 돌아가기 버튼 클릭 시 실행
  const handleGoBack = () => {
    if (
      userSearchResult.userResultType === 'notFound' &&
      isGoogleFormsEvent(eventDetail)
    ) {
      const searchParams = new URLSearchParams({ eventId: String(eventId) })
      navigate(`/search?${searchParams.toString()}`, {
        replace: true,
        state: { userSearchData },
      })
      return
    }

    navigate(-1) // 브라우저 히스토리 기준 이전 페이지
  }

  return (
    <GradientLayout>
      <div className='user-result__container'>
        {/* 로고 영역 */}
        <a href='/' className='user-result__logoLink' aria-label='홈으로 이동'>
          <img src={authLogo} alt='HubSpace' className='user-result__logo' />
        </a>

        {userSearchResult.userResultType === 'detail' ? (
          <>
            {/* 상태 카드 */}
            <div className='user-result__status-card'>
              <div className='result__status-icon result__status-icon--ok'>
                <AnimatedCheck />
              </div>
              <h2 className='user-result__status-title'>확인되었습니다.</h2>
              <p className='user-result__status-subtitle'>명단에 존재하거나 신청이 완료되었습니다.</p>
            </div>

            {/* 정보 카드 */}
            <div className='user-result__info-card'>
              {detailEntries.map(([columnName, value]) => (
                <div key={columnName} className='user-result__info-row'>
                  <span className='user-result__info-label'>{columnName}</span>
                  <span className='user-result__info-value'>{value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* 조회 실패 카드 */
          <div className='user-result__status-card'>
            <div className='result__status-icon result__status-icon--no'>
              <AlertIcon />
            </div>
            <h2 className='user-result__status-title'>{userSearchResult.userResultTitle}</h2>
            <p className='user-result__status-subtitle'>{userSearchResult.userResultMessage}</p>
          </div>
        )}

        <div className='user-result__button'>
          <GradientButton type='button' onClick={handleGoBack} className='user-result__backButton'>
            <span>다시 조회하기</span>
          </GradientButton>
        </div>
      </div>
    </GradientLayout>
  )
}
