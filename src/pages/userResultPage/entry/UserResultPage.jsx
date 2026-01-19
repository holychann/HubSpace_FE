import GradientLayout from '../../../components/gradientLayout/GradientLayout'
import GradientButton from '../../../components/gradientButton/GradientButton'
import backIcon from '../../../assets/auth/auth-back-icon.svg'
import './UserResultPage.css'
import { useNavigate } from 'react-router-dom'

// 사용자 이벤트 신청 조회 결과 페이지
export default function UserResultPage() {
  const navigate = useNavigate()

  // 더미 데이터
  const resultType = 'det'
  const userInfo = {
    name: '조성찬',
    studentId: '0000000000',
    birth: '000000',
    submissionStatus: '제출 완료',
  }

  let title2 = ''
  if (resultType === 'success') {
    title2 = '정보가 정상적으로 조회되었습니다.'
  } else if (resultType === 'detail') {
    title2 = '정보가 아래와 같이 조회되었습니다.'
  } else {
    title2 = '해당 정보로 조회된 기록이 없습니다.'
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    // 전체 페이지
    <GradientLayout>
      <div className='user-result__container'>
        {/* 로고 영역 */}
        <div className='user-result__logo'></div>
        {/* 중앙 흰색 결과 카드 */}
        <div className='user-result__card'>
          <h1 className='user-result__title__01'>{userInfo.name}님</h1>
          <h2 className='user-result__title__02'>{title2}</h2>

          {/* 사용자 정보 */}
          {resultType === 'detail' && (
            <div className='user-result__box'>
              <span>이름:</span>
              <span>{userInfo.name}</span>

              <span>학번:</span>
              <span>{userInfo.studentId}</span>

              <span>생년월일:</span>
              <span>{userInfo.birth}</span>

              <span>제출 여부:</span>
              <span>{userInfo.submissionStatus}</span>
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
