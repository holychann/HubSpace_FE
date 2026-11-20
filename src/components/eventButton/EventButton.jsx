import './EventButton.css'
import LoadingSpinner from '../loadingSpinner/LoadingSpinner'

// isLoading 이면 확인 모달의 확인 버튼처럼 문구 앞에 작은 메인 스피너를 띄운다.
export default function EventButton({
  text,
  onClick,
  disabled = false,
  isLoading = false,
  variant = 'outline',
  ...buttonProps
}) {
  return (
    <div className={`eventButton--${variant}`}>
      <button
        {...buttonProps}
        type='button'
        className='eventButton-button'
        onClick={onClick}
        disabled={disabled}
        aria-busy={isLoading || undefined}
      >
        {isLoading && (
          <span className='eventButton-button__spinner' aria-hidden='true'>
            <LoadingSpinner size={20} color='currentColor' />
          </span>
        )}
        <span aria-live='polite'>{text}</span>
      </button>
    </div>
  )
}
