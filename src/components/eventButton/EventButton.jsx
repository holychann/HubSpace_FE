import './EventButton.css'

export default function EventButton({ text, onClick, disabled = false }) {
  return (
    <div>
      <button type='button' className='eventButton-button' onClick={onClick} disabled={disabled}>
        {text}
      </button>
    </div>
  )
}
