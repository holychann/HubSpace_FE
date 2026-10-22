import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

const HOME_URL = 'https://hubspacekw.com/'
const HOME_TITLE = '허브스페이스 | 신청 내역·결과 조회 서비스'

const NO_INDEX_TITLES = {
  '/privacy': '개인정보처리방침 | 허브스페이스',
  '/terms': '이용약관 | 허브스페이스',
  '/contact': '문의하기 | 허브스페이스',
}

const ensureMetaTag = (name) => {
  let metaTag = document.head.querySelector(`meta[name="${name}"]`)

  if (!metaTag) {
    metaTag = document.createElement('meta')
    metaTag.setAttribute('name', name)
    document.head.appendChild(metaTag)
  }

  return metaTag
}

const ensureCanonicalLink = () => {
  let canonicalLink = document.head.querySelector('link[rel="canonical"]')

  if (!canonicalLink) {
    canonicalLink = document.createElement('link')
    canonicalLink.setAttribute('rel', 'canonical')
    document.head.appendChild(canonicalLink)
  }

  return canonicalLink
}

export default function SeoController() {
  const { pathname } = useLocation()

  useEffect(() => {
    const isHomePage = pathname === '/'
    const robotsMeta = ensureMetaTag('robots')
    const canonicalLink = document.head.querySelector('link[rel="canonical"]')

    if (isHomePage) {
      document.title = HOME_TITLE
      robotsMeta.setAttribute('content', 'index, follow, max-image-preview:large')
      ensureCanonicalLink().setAttribute('href', HOME_URL)
      return
    }

    document.title = NO_INDEX_TITLES[pathname] || '허브스페이스'
    robotsMeta.setAttribute('content', 'noindex, nofollow')
    canonicalLink?.remove()
  }, [pathname])

  return <Outlet />
}
