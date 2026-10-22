import { useEffect, useState } from 'react'
import { apiGetPrivate } from '../../../utils/ApiUtil'
import { getAuthSessionId } from '../../../utils/authStorage'
import { getCachedNickname, saveNickname } from '../../../utils/nicknameCache'

// Header 영역 닉네임 조회 전용 훅. 저장된 닉네임이 있으면 GET /user 를 부르지 않는다.
export const useUserNickname = () => {
  const [nickname, setNickname] = useState(getCachedNickname)
  const [loading, setLoading] = useState(() => getCachedNickname() === null)

  useEffect(() => {
    if (getCachedNickname() !== null) return

    let isMounted = true
    // 조회 도중 로그아웃·재로그인했다면 이전 계정의 닉네임을 저장하지 않는다.
    const sessionId = getAuthSessionId()

    const fetchNickname = async () => {
      try {
        const res = await apiGetPrivate('/user')
        const payload = res?.data ?? res
        const name = payload?.nickname || payload?.username || null

        if (getAuthSessionId() === sessionId) saveNickname(name)
        if (!isMounted) return
        setNickname(name)
      } catch {
        // 실패하면 기본 문구를 보여 주고, 다음 진입 때 다시 조회한다.
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchNickname()

    return () => {
      isMounted = false
    }
  }, [])

  return { nickname, loading }
}
