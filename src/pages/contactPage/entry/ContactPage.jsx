import { useId, useRef, useState } from 'react'
import { toast } from 'sonner'
import '../../homePage/entry/HomePage.css'
import './ContactPage.css'
import Header from '../../../components/header/Header'
import { usePublicSession } from '../../homePage/utils/publicSession'
import ChevronIcon from '../../../assets/contact/contact-chevron.svg?react'

const CONTACT_EMAIL = 'holy_chan@naver.com'

// question 은 모바일에서 줄을 나눌 단위다. 데스크탑에서는 한 줄로 이어 쓴다.
const FAQS = [
  {
    question: ['Google Forms와 파일, 무엇이 다른가요?'],
    answer: '새 응답을 계속 받을 때는 Google Forms를 사용하세요. 이미 정리된 명단이 있다면 CSV·TSV 파일을 올려 조회할 수 있어요.',
  },
  {
    question: ['Google 권한은 왜 필요한가요?'],
    answer: '이벤트 신청용 Google Form을 만들고 관리하는 데 필요해요. 권한을 허용한 뒤 이벤트를 생성할 수 있어요.',
  },
  {
    question: ['어떤 파일을 올릴 수 있나요?'],
    answer: 'UTF-8로 저장한 CSV·TSV 파일을 올릴 수 있어요. 엑셀 명단은 UTF-8 CSV로 저장한 뒤 업로드해 주세요.',
  },
  {
    question: ['신청자도 로그인해야 하나요?'],
    answer: '아니요. 신청자는 공유받은 조회 링크에서 로그인 없이 결과를 확인할 수 있어요.',
  },
  {
    question: ['조회가 안 되거나', '결과가 다르면 어떻게 하나요?'],
    answer:
      '공유받은 링크와 입력한 정보를 먼저 확인해 주세요. 신청 여부·선발 결과·납부 정보는 해당 행사 운영진에게 문의해 주세요. 서비스 화면에 오류가 생겼다면 아래 이메일로 알려주세요.',
  },
]

// <details> 는 열고 닫을 때 높이를 애니메이션할 수 없어서 버튼과 펼침 영역으로 만든다.
// 닫힌 답은 inert 로 화면 낭독기와 탭 이동에서 뺀다.
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  const answerId = useId()

  return (
    <div className={`contact-faq__item${open ? ' contact-faq__item--open' : ''}`}>
      <button
        type='button'
        className='contact-faq__question'
        aria-expanded={open}
        aria-controls={answerId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className='contact-faq__question-text'>
          {question.map((line, index) => (
            <span key={line} className='contact__mobile-line'>
              {index > 0 && ' '}
              {line}
            </span>
          ))}
        </span>
        <ChevronIcon className='contact-faq__icon' aria-hidden='true' />
      </button>
      <div id={answerId} className='contact-faq__panel' inert={!open}>
        <div className='contact-faq__panel-inner'>
          <p className='contact-faq__answer'>{answer}</p>
        </div>
      </div>
    </div>
  )
}

// 문의하기 화면 (Figma 'Contact v3'). 로그인 없이 보이며, 헤더는 홈과 같다.
// 홈의 스크롤 영역·버튼 스타일을 그대로 쓰려고 루트에 home 클래스를 함께 둔다.
export default function ContactPage() {
  const { hasSession, handleStart } = usePublicSession()
  const emailRef = useRef(null)

  // 복사에 실패하면(권한 거부, http 등) 주소 글자를 선택해 두어 바로 직접 복사할 수 있게 한다.
  const selectEmail = () => {
    const range = document.createRange()
    range.selectNodeContents(emailRef.current)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const handleCopy = () => {
    Promise.resolve()
      .then(() => navigator.clipboard.writeText(CONTACT_EMAIL))
      .then(() => toast.success('이메일 주소를 복사했어요.'))
      .catch((err) => {
        selectEmail()
        toast.error('복사하지 못했어요. 선택된 주소를 직접 복사해 주세요.')
        console.error('복사 실패:', err)
      })
  }

  return (
    <div className='home contact'>
      <Header hasSession={hasSession} onStart={handleStart} />

      <main className='contact__body'>
        <div className='contact__main'>
          <div className='contact__intro'>
            <h1 className='contact__title'>문의하기</h1>
            <p className='contact__lead'>
              <span className='contact__line'>궁금한 점을 먼저 확인해 보세요.</span>{' '}
              <span className='contact__line'>해결되지 않았다면 이메일로 알려주세요.</span>
            </p>
          </div>

          <section className='contact-faq' aria-labelledby='contact-faq-title'>
            <h2 id='contact-faq-title' className='contact-faq__title'>
              자주 묻는 질문
            </h2>
            {/* 항목마다 따로 열고 닫는다. */}
            <div className='contact-faq__list'>
              {FAQS.map(({ question, answer }) => (
                <FaqItem key={question.join(' ')} question={question} answer={answer} />
              ))}
            </div>
          </section>

          <section className='contact-email' aria-labelledby='contact-email-title'>
            <div className='contact-email__intro'>
              <h2 id='contact-email-title' className='contact-email__title'>
                해결되지 않았나요?
              </h2>
              <p className='contact-email__description'>
                <span className='contact__mobile-line'>서비스 이용 중 발생한 오류나</span>{' '}
                <span className='contact__mobile-line'>개선 의견을 이메일로 보내주세요.</span>
              </p>
            </div>

            <div className='contact-email__address'>
              <span ref={emailRef} className='contact-email__email'>
                {CONTACT_EMAIL}
              </span>
            </div>

            {/* 데스크탑은 웹 메일을 주로 써서 mailto 로 메일 앱을 열면 설정 창만 뜨기 쉽다.
                주소를 복사해 각자 쓰는 메일에 붙여 넣게 하고, 결과는 토스트로 알린다. */}
            <div className='contact-email__actions'>
              <button type='button' className='home-button home-button--primary contact-email__button' onClick={handleCopy}>
                이메일 주소 복사
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
