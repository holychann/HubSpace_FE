import { Link } from 'react-router-dom'
import authLogo from '../../../assets/auth/auth-logo.png'
import { policyContent } from '../utils/policyContent'
import './PolicyPage.css'

const getLineClassName = (line) => {
  if (/^\d+\./.test(line)) return 'policy-page__line policy-page__line--numbered'
  if (/^[가-하]\./.test(line)) return 'policy-page__line policy-page__line--sub'
  if (/^\d+\)/.test(line)) return 'policy-page__line policy-page__line--detail'
  return 'policy-page__line'
}

export default function PolicyPage({ type }) {
  const content = policyContent[type]

  if (!content) return null

  // 데스크톱 고정 목차와 태블릿·모바일 접이식 목차가 같은 링크를 쓴다. 화면 폭에 따라 CSS로 하나만 보인다.
  const tocLinks = content.sections.map((section) => (
    <a key={section.id} href={`#${section.id}`} className='policy-page__tocLink'>
      {section.title}
    </a>
  ))

  return (
    <div className='policy-page'>
      <div className='policy-page__inner'>
        <header className='policy-page__header'>
          <div className='policy-page__topBar'>
            <Link to='/' className='policy-page__logoLink' aria-label='홈으로 이동'>
              <img src={authLogo} alt='HubSpace' className='policy-page__logo' />
            </Link>
            <Link to='/' className='policy-page__homeLink'>
              홈으로
            </Link>
          </div>

          <h1 className='policy-page__title'>{content.pageTitle}</h1>
          <p className='policy-page__date'>{content.effectiveDate}</p>
        </header>

        <div className='policy-page__layout'>
          <aside className='policy-page__toc' aria-label='목차'>
            <div className='policy-page__tocTitle'>목차</div>
            <nav className='policy-page__tocList'>{tocLinks}</nav>
          </aside>

          <main className='policy-page__main'>
            <details className='policy-page__tocToggle'>
              <summary className='policy-page__tocSummary'>목차 보기</summary>
              <nav className='policy-page__tocList' aria-label='목차'>
                {tocLinks}
              </nav>
            </details>

            <div className='policy-page__document'>
              {content.sections.map((section) => (
                <section key={section.id} id={section.id} className='policy-page__section'>
                  <h2 className='policy-page__sectionTitle'>{section.title}</h2>
                  <div className='policy-page__sectionBody'>
                    {section.lines.map((line, index) =>
                      line === '' ? (
                        <div key={`${section.id}-${index}`} className='policy-page__spacer' />
                      ) : (
                        <p key={`${section.id}-${index}`} className={getLineClassName(line)}>
                          {line}
                        </p>
                      ),
                    )}
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
