import './UserDetailPage.css'
import GradientButton from '../../../components/gradientButton/GradientButton'
import GradientLayout from '../../../components/gradientLayout/GradientLayout'

// 사용자 이벤트 신청 조회 페이지
export default function UserDetailPage() {
  const handleSearch = () => {
    // 조회 api 호출
  }

  return (
    <GradientLayout>
      {/* 로고 영역 */}
      <div className='user-detail__logo'></div>
      <div className='user-detail__card'>
        <h1 className='user-detail__title'>신청 조회</h1>
        <p className='user-detail__description'>이벤트 신청 여부를 정보 입력 후 확인 가능합니다</p>

        <form className='user-detail__form'>
          <div className='user-detail__field'>
            <label htmlFor='name' className='user-detail__label'>
              이름
            </label>
            <input
              type='text'
              id='name'
              className='user-detail__input'
              placeholder='이름을 입력해주세요.'
            />
          </div>

          <div className='user-detail__field'>
            <label htmlFor='studentId' className='user-detail__label'>
              학번
            </label>
            <input
              type='text'
              id='studentId'
              className='user-detail__input'
              placeholder='학번 10자리를 입력해주세요.'
            />
          </div>

          <div className='user-detail__field'>
            <label htmlFor='birth' className='user-detail__label'>
              생년월일
            </label>
            <input
              type='text'
              id='birth'
              className='user-detail__input'
              placeholder='생년월일 6자리를 입력해주세요.'
            />
          </div>

          <GradientButton type='button' onClick={handleSearch}>
            조회하기
          </GradientButton>
        </form>
      </div>
    </GradientLayout>
  )
}
