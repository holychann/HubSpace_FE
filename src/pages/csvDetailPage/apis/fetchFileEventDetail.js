import { apiGetPrivate } from '../../../utils/ApiUtil'

// 인증된 이벤트 상세 조회. 이 API 는 실패해도 HTTP 200 에 success: false 로 응답할 수 있다.
export const fetchFileEventDetail = async (eventId) => {
  const res = await apiGetPrivate(`/v1/events/${eventId}`)

  if (res?.success !== true || !res.data) {
    throw new Error(res?.error?.errorMessage || '이벤트 정보를 불러오지 못했습니다.')
  }

  const { id, eventTitle, eventType, isActive, count, searchColumns, displayColumns } = res.data
  if (!Array.isArray(searchColumns)) {
    throw new Error('이벤트 정보를 불러오지 못했습니다.')
  }

  // 이벤트 ID 는 서버가 준 문자열 그대로 쓴다.
  return {
    id: String(id),
    eventTitle,
    eventType,
    isActive,
    count,
    searchColumns,
    displayColumns: Array.isArray(displayColumns) ? displayColumns : [],
  }
}
