import api from '../../../apis/ApiClient'
import { invalidateEventListCache } from '../../../utils/eventListCache'

export const createFileEvent = async ({ file, eventTitle, count, searchColumns, displayColumns }) => {
  const requestPayload = {
    eventTitle,
    count,
    searchColumns,
    displayColumns: displayColumns ?? null,
    eventType: 'FILE',
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('request', new Blob([JSON.stringify(requestPayload)], { type: 'application/json' }))

  const response = await api.post('/v1/events/file', formData, {
    requireAuth: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  invalidateEventListCache()
  return response
}
