import './EventButton.css'

export default function EventButton({ text, onClick, disabled = false, ...buttonProps }) {
  return (
    <div>
      <button {...buttonProps} type='button' className='eventButton-button' onClick={onClick} disabled={disabled}>
        {text}
      </button>
    </div>
  )
}
