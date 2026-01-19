import './GradientButton.css'

export default function GradientButton({
  children,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`gradient-button ${className}`}
    >
      {children}
    </button>
  )
}
