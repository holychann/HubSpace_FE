import { useState, useEffect } from 'react'
// import { apiGetPublic } from '../../../utils/ApiUtil'

// 더미 데이터 import
import {
  userCsvThreeFields,
  userCsvTwoFields,
  userFormThreeFields,
  userFormTwoFields,
} from '../../userResultPage/utils/UserResultDummy'

// 데이터만 담당
export const useFetchEventDetail = (eventId) => {
  // 현재 상태, 상태 변경 함수
  const [eventDetail, setEventDetail] = useState(null) // 서버에서 받은 실제 데이터 저장
  const [loading, setLoading] = useState(true) // 로딩 중인지
  const [error, setError] = useState(null) // 에러 발생 여부

  // eventID 변경될 때마다 실행
  useEffect(() => {
    if (!eventId) {
      setLoading(false)
      return
    }

    // 실제 데이터 가져옴
    const fetchEventDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        // 임시 더미 데이터
        const dummyEvents = [
          userCsvThreeFields,
          userCsvTwoFields,
          userFormThreeFields,
          userFormTwoFields,
        ]

        const foundEvent = dummyEvents.find((event) => event.id === Number(eventId))

        if (!foundEvent) {
          throw new Error('해당 이벤트를 찾을 수 없습니다')
        }

        setEventDetail(foundEvent)

        // const res = await apiGetPublic(`/v1/events/${eventId}/summary`)
        // setEventDetail(res.data.data)
      } catch (err) {
        setError(err?.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetail()
  }, [eventId]) // eventID 변경될 때만 다시 실행

  return { eventDetail, loading, error }
}
