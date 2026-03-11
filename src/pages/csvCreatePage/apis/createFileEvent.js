import api from '../../../apis/ApiClient'

export const createFileEvent = async ({ file, eventTitle, count, searchColumns }) => {
  const requestPayload = {
    eventTitle,
    count,
    searchColumns,
    eventType: 'FILE',
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('request', new Blob([JSON.stringify(requestPayload)], { type: 'application/json' }))

  return api.post('/v1/events/file', formData, {
    requireAuth: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
