import { isLocalPreviewMode } from '../../../mocks/localPreview.js'

export function formatDate(createdAt) {
  if (!createdAt) return ''

  const date = new Date(createdAt)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

export function makeSearchUrl(id) {
  if (!id) return ''

  const origin = isLocalPreviewMode ? window.location.origin : 'https://hubspacekw.com'
  return `${origin}/search?eventId=${encodeURIComponent(id)}`
}
