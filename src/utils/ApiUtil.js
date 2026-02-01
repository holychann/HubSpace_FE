import api from '../apis/ApiClient.js'

// Public GET / POST
export const apiGetPublic = (url, config = {}) => api.get(url, { ...config, requireAuth: false })
export const apiPostPublic = (url, data, config = {}) =>
  api.post(url, data, { ...config, requireAuth: false })

// Private GET / POST / PUT / DELETE
export const apiGetPrivate = (url, config = {}) => api.get(url, { ...config, requireAuth: true })
export const apiPostPrivate = (url, data, config = {}) =>
  api.post(url, data, { ...config, requireAuth: true })
export const apiPutPrivate = (url, data, config = {}) =>
  api.put(url, data, { ...config, requireAuth: true })
export const apiDeletePrivate = (url, config = {}) =>
  api.delete(url, { ...config, requireAuth: true })
