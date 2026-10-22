import CheckIcon from '../../assets/result/result-check.svg?react'
import './AnimatedCheck.css'

export default function AnimatedCheck({ keepRing = false }) {
  return (
    <CheckIcon
      className={`animated-check${keepRing ? ' animated-check--keep-ring' : ''}`}
      aria-hidden='true'
      focusable='false'
    />
  )
}
