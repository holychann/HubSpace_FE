import './GradientLayout.css'

export default function GradientLayout({ children, className = '' }) {
  return <div className={`gradient-layout ${className}`}>{children}</div>
}
