import { apiPostPrivate } from '../../../utils/ApiUtil'

export const createFormEvent = async ({ eventTitle, searchColumns }) => {
  const payload = {
    eventTitle,
    searchColumns,
    eventType: 'FORM',
  }

  return apiPostPrivate('/v1/events', payload)
}
