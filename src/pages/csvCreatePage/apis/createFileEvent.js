import { apiPostPrivate } from '../../../utils/ApiUtil'

export const createFileEvent = async ({ eventTitle, count, searchColumns }) => {
  const payload = {
    eventTitle,
    count,
    searchColumns,
    eventType: 'FILE',
  }

  return apiPostPrivate('/v1/events/file', payload)
}
