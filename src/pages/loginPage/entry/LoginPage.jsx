import './LoginPage.css'
import GradientLayout from '../../../components/gradientLayout/GradientLayout'
import googleIcon from '../../../assets/auth/auth-google-logo.svg'

export default function LoginPage() {
  const handleLogin = () => {
    // 로그인 api
  }

  return (
    <GradientLayout>
      <div className='login__logo'></div>

      <h2 className='login__title'>관리자 로그인</h2>
      <p className='login__description'>Google 계정으로 간편하게 로그인하세요</p>

      <button onClick={handleLogin} className='login__button'>
        <img src={googleIcon} />
      </button>
    </GradientLayout>
  )
}
