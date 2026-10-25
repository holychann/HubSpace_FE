import { useState, useEffect } from 'react'
import LookupLayout from '../../../components/lookupLayout/LookupLayout'
import './UserResultPage.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { isGoogleFormsEvent, processUserResult } from '../utils/UserFieldConfig'
import { toast } from 'sonner'

import { fetchUserSearch } from '../apis/fetchUserSearch'
import LoadingSpinner from '../../../components/loadingSpinner/LoadingSpinner'
import UserDetailContent, { UserDetailLogo } from '../../userDetailPage/component/UserDetailContent'
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
  const [canGoBack, setCanGoBack] = useState(false)

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
      setCanGoBack(false)
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
    if (loading || !userSearchResult) return undefined

    // 조회 버튼의 연속 클릭이 새 화면의 재조회 버튼으로 이어지지 않게 한다.
    const timer = window.setTimeout(() => setCanGoBack(true), 500)
    return () => window.clearTimeout(timer)
  }, [loading, userSearchResult])

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

  // 돌아가기 버튼 클릭 시 실행
  const handleGoBack = () => {
    if (loading || !canGoBack) return

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

  const backAction = (
    <button
      type='button'
      onClick={handleGoBack}
      disabled={loading || !canGoBack}
      className='user-result__backButton'
    >
      다시 조회하기
    </button>
  )

  const layoutAlignment = eventDetail
    ? { reference: <UserDetailContent eventDetail={eventDetail} measurement />, logo: <UserDetailLogo /> }
    : {}

  // 로딩 중
  if (loading) {
    return (
      <LookupLayout {...layoutAlignment}>
        <div className='user-result__container'>
          <div className='user-result__loading'>
            <LoadingSpinner
              className='user-result__loadingSpinner'
              size={48}
            />
            <p className='user-result__loadingText'>조회 중입니다...</p>
          </div>
        </div>
      </LookupLayout>
    )
  }

  // 결과 없음
  if (!userSearchResult) {
    return (
      <LookupLayout {...layoutAlignment}>
        <div className='user-result__container'>
          <p>{errorMessage || '조회 결과를 불러올 수 없습니다'}</p>
        </div>
      </LookupLayout>
    )
  }
  const detailEntries =
    userSearchResult.userResultType === 'detail'
      ? Object.entries(userSearchResult.userDetailInfo || {})
      : []
  const hasDetail = userSearchResult.userResultType === 'detail'

  return (
    <LookupLayout action={backAction} centerContent={!hasDetail} {...layoutAlignment}>
      <div className={`user-result__container${hasDetail ? '' : ' user-result__container--not-found'}`}>
        {hasDetail ? (
          <>
            {/* 상태 안내 */}
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
          /* 조회 실패 안내 */
          <div className='user-result__status-card'>
            <div className='result__status-icon result__status-icon--no'>
              <AlertIcon />
            </div>
            <h2 className='user-result__status-title'>{userSearchResult.userResultTitle}</h2>
            <p className='user-result__status-subtitle'>{userSearchResult.userResultMessage}</p>
          </div>
        )}
      </div>
    </LookupLayout>
  )
}
