import './EventButton.css'

export default function EventButton({ text, onClick, disabled = false, variant = 'outline', ...buttonProps }) {
  return (
    <div className={`eventButton--${variant}`}>
      <button {...buttonProps} type='button' className='eventButton-button' onClick={onClick} disabled={disabled}>
        {text}
      </button>
    </div>
  )
}
