import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Skeleton from '../skeleton/Skeleton'
import { useUserNickname } from './apis/fetchUserInfo'
import { logout } from '../../apis/ApiClient'

// 로그인 상태의 헤더 오른쪽 끝. 닉네임을 누르면 '내 대시보드'·'로그아웃' 메뉴가 열린다.
// 대시보드에서는 '로그아웃'만 보이고, 닉네임을 불러오는 동안은 스켈레톤을 둔다.
export default function AccountMenu() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { nickname, loading } = useUserNickname()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const menuId = useId()
  const label = `${nickname || '사용자'}님`

  // 바깥을 누르거나 ESC 를 누르면 닫는다. ESC 로 닫으면 포커스를 닉네임 버튼으로 돌려준다.
  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) setIsOpen(false)
    }
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    await logout()
    setIsLoggingOut(false)
    setIsOpen(false)
    toast.success('로그아웃되었습니다!')
    navigate('/')
  }

  if (loading) {
    return (
      <span className='site-header__nickname'>
        <Skeleton width={72} height={14} />
      </span>
    )
  }

  return (
    <div className='site-header__account' ref={containerRef}>
      <button
        type='button'
        ref={triggerRef}
        className='site-header__link site-header__link--account site-header__accountButton'
        title={label}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className='site-header__accountName'>{label}</span>
      </button>
      {isOpen && (
        <div className='site-header__menu' id={menuId}>
          {pathname !== '/dashboard' && (
            <Link to='/dashboard' className='site-header__menuItem' onClick={() => setIsOpen(false)}>
              내 대시보드
            </Link>
          )}
          <button
            type='button'
            className='site-header__menuItem'
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
          </button>
        </div>
      )}
    </div>
  )
}
