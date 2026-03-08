import { useEffect, useState } from 'react'
import { apiGetPrivate } from '../../../utils/ApiUtil'

// Header 영역 사용자 정보 조회 전용 훅
export const useFetchUserInfo = () => {
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchUserInfo = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await apiGetPrivate('/user')
        const payload = res?.data ?? res

        if (!isMounted) return
        setUserInfo(payload ?? null)
      } catch (err) {
        if (!isMounted) return
        setError(err?.message ?? '사용자 정보를 불러오지 못했습니다')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    }

    fetchUserInfo()

    return () => {
      isMounted = false
    }
  }, [])

  return { userInfo, loading, error }
}
