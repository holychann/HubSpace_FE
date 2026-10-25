import api from '../apis/ApiClient.js'
import {
  getLocalPreviewPrivateGet,
  getLocalPreviewPublicGet,
  isLocalPreviewMode,
} from '../mocks/localPreview.js'

// Public GET / POST
export const apiGetPublic = (url, config = {}) =>
  isLocalPreviewMode && url.startsWith('/v1/events/preview-')
    ? getLocalPreviewPublicGet(url)
    : api.get(url, { ...config, requireAuth: false })
export const apiPostPublic = (url, data, config = {}) =>
  api.post(url, data, { ...config, requireAuth: false })

// Private GET / POST / PUT / PATCH / DELETE
export const apiGetPrivate = (url, config = {}) =>
  isLocalPreviewMode
    ? getLocalPreviewPrivateGet(url)
    : api.get(url, { ...config, requireAuth: true })
export const apiPostPrivate = (url, data, config = {}) =>
  api.post(url, data, { ...config, requireAuth: true })
export const apiPutPrivate = (url, data, config = {}) =>
  api.put(url, data, { ...config, requireAuth: true })
export const apiPatchPrivate = (url, data, config = {}) =>
  api.patch(url, data, { ...config, requireAuth: true })
export const apiDeletePrivate = (url, config = {}) =>
  api.delete(url, { ...config, requireAuth: true })
