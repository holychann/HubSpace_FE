import { apiPutPrivate } from '../../../utils/ApiUtil'
import { invalidateEventListCache } from '../../../utils/eventListCache'

// FILE 이벤트 명단 교체. 실패는 HTTP 상태 코드(400/403/404/409)와 error.errorMessage 로 온다.
export const replaceFileDataset = async ({ eventId, file, searchColumns, displayColumns }) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append(
    'request',
    new Blob([JSON.stringify({ searchColumns, displayColumns })], { type: 'application/json' }),
  )

  const res = await apiPutPrivate(`/v1/events/${eventId}/file`, formData, {
    // 인스턴스 기본값인 JSON 헤더를 덮어써 FormData 가 JSON 으로 바뀌지 않게 한다.
    // 브라우저에서는 axios 가 이 값을 지우고, 경계값이 붙은 multipart 헤더를 브라우저가 만든다.
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  if (res?.success !== true) {
    throw new Error(res?.error?.errorMessage || '파일 변경에 실패했습니다.')
  }

  invalidateEventListCache()
  return res.data
}
