import { apiPostPrivate } from '../../../utils/ApiUtil'
import { invalidateEventListCache } from '../../../utils/eventListCache'

export const GOOGLE_PERMISSION_REQUIRED_CODE = 'GOOGLE-403'

const toFormCreateError = (payload, fallbackError) => {
  const errorDetail = payload?.error ?? payload
  const error = new Error(
    errorDetail?.errorMessage || payload?.message || '이벤트 생성에 실패했습니다.',
  )
  error.errorCode = errorDetail?.errorCode
  error.cause = fallbackError
  return error
}

export const createFormEvent = async ({ eventTitle, searchColumns }) => {
  const payload = {
    eventTitle,
    searchColumns,
    eventType: 'FORM',
  }

  try {
    const response = await apiPostPrivate('/v1/events/form', payload)

    if (response?.success === false) {
      throw toFormCreateError(response)
    }

    invalidateEventListCache()
    return response
  } catch (error) {
    const errorPayload = error?.response?.data

    if (errorPayload?.success === false || errorPayload?.errorCode || errorPayload?.error) {
      throw toFormCreateError(errorPayload, error)
    }

    throw error
  }
}
