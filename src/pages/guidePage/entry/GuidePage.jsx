import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../homePage/entry/HomePage.css'
import './GuidePage.css'
import Header from '../../../components/header/Header'
import { usePublicSession } from '../../homePage/utils/publicSession'
import MethodTabs from '../../homePage/component/MethodTabs'
import FileIcon from '../../../assets/home/home-file.svg?react'
import FormIcon from '../../../assets/home/home-form.svg?react'
import GoogleIcon from '../../../assets/home/home-google.svg?react'
import {
  FileColumnsMockup,
  FileEventCardMockup,
  FileRosterMockup,
  FileUploadMockup,
  FormCreateMockup,
  FormEventCardMockup,
  FormFieldsMockup,
  FormNewEventMockup,
  LookupFlowMockup,
} from '../component/GuideMockups'

// 대시보드의 폼 링크는 Google Form 편집 주소라, 신청자에게 공유하는 링크가 아니라 폼을 고치는 링크로 안내한다.
const METHODS = [
  {
    type: 'form',
    title: 'Google Forms',
    Icon: FormIcon,
    description: '새로 들어오는 응답을 반영하며 신청을 받아요.',
    steps: [
      {
        title: '새 이벤트를 만드세요',
        body: '대시보드의 ‘새 이벤트’에서 Google Form을 선택하세요.',
        note: 'HubSpace에서 새 Google Form을 만들어요.',
        Mockup: FormNewEventMockup,
      },
      {
        title: '조회에 사용할 정보를 정하세요',
        body: '이벤트 이름을 적고 이름·생년월일처럼 신청자가 조회할 때 입력할 항목을 정하세요.',
        note: '서로 다른 항목을 2~3개 입력하세요.',
        Mockup: FormFieldsMockup,
      },
      {
        title: '폼을 생성하세요',
        body: '‘이벤트 생성’을 누르세요. Google 권한 안내가 나타나면 허용한 뒤 다시 생성해주세요.',
        note: '생성된 폼에서는 조회에 쓰는 질문의 항목명을 유지해주세요.',
        Mockup: FormCreateMockup,
      },
      {
        title: '두 링크의 용도를 확인하세요',
        body: '폼 링크는 폼 내용을 수정하거나 설명을 추가할 때, 조회용 링크는 신청자가 신청 내역을 확인할 때 사용돼요.',
        Mockup: FormEventCardMockup,
      },
      {
        title: '직접 조회한 뒤 공유하세요',
        body: '폼 링크에 테스트 응답을 제출하고, 같은 이름·생년월일로 조회하세요. 성공 결과를 확인한 뒤 링크를 공유하세요.',
        note: '응답 반영에 시간이 걸릴 수 있어요. 조회되지 않으면 잠시 후 다시 확인해주세요.',
        Mockup: LookupFlowMockup,
      },
    ],
  },
  {
    type: 'file',
    title: '파일 업로드',
    Icon: FileIcon,
    description: '준비된 명단을 올려 조회 링크를 만들어요.',
    steps: [
      {
        title: '명단 파일을 준비하세요',
        body: '이름·학번·납부 정보가 담긴 명단을 준비하세요. CSV 또는 TSV 파일을 사용할 수 있어요.',
        note: '첫 행에는 항목명을 넣고 UTF-8 형식으로 저장해주세요.',
        Mockup: FileRosterMockup,
      },
      {
        title: '파일을 업로드하세요',
        body: '‘새 이벤트 → CSV 파일’에서 이벤트 이름을 입력하고 준비한 명단을 올리세요.',
        note: '파일이 정상적으로 불러와졌는지 확인하세요.',
        Mockup: FileUploadMockup,
      },
      {
        title: '조회 정보와 결과 정보를 고르세요',
        body: '이름·학번은 조회할 때 입력할 정보로, 납부는 조회 결과에 표시할 정보로 선택하세요.',
        note: '조회 항목은 2~3개가 필요해요. 결과 표시 항목은 선택 사항이에요.',
        Mockup: FileColumnsMockup,
      },
      {
        title: '이벤트를 만들고 링크를 복사하세요',
        body: '미리보기를 확인하고 ‘이벤트 생성’을 누르세요. 대시보드에서 조회용 링크를 복사할 수 있어요.',
        Mockup: FileEventCardMockup,
      },
      {
        title: '명단의 정보로 조회해보세요',
        body: '명단에 있는 이름·학번으로 조회하고, 선택한 납부 정보가 보이는지 확인하세요. 확인을 마치면 링크를 공유하세요.',
        note: '신청자는 로그인 없이 조회용 링크에서 확인할 수 있어요.',
        Mockup: LookupFlowMockup,
      },
    ],
  },
]

// 이용 방법 화면 (Figma 'Guide v3'). 로그인 없이 보이며, 헤더는 홈과 같다.
// 홈의 스크롤 영역·버튼 스타일을 그대로 쓰려고 루트에 home 클래스를 함께 둔다.
export default function GuidePage() {
  const { hasSession, handleStart } = usePublicSession()
  const [activeIndex, setActiveIndex] = useState(0)
  const method = METHODS[activeIndex]

  return (
    <div className={`home guide guide--${method.type}`}>
      <Header hasSession={hasSession} onStart={handleStart} />

      <main className='guide__body'>
        <div className='guide__main'>
          <div className='guide__intro'>
            <h1 className='guide__title'>이용 방법</h1>
            <p className='guide__lead'>
              <span className='guide__mobile-line'>이벤트 생성부터 링크 공유까지,</span>{' '}
              <span className='guide__mobile-line'>순서대로 따라 해보세요.</span>
            </p>

            {/* 홈 Methods 와 같은 토글. 선택된 방식의 아이콘에 폼·파일 색이 들어간다. */}
            <MethodTabs
              methods={METHODS}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
              idPrefix='guide'
              panelId='guide-panel'
            />
          </div>

          <div id='guide-panel' className='guide__panel' role='tabpanel' aria-labelledby={`guide-tab-${method.type}`}>
            <p className='guide__method-description'>{method.description}</p>

            <ol className='guide-steps'>
              {method.steps.map((step, index) => (
                <li key={step.title} className='guide-step'>
                  <div className='guide-step__text'>
                    <span className='guide-step__number' aria-hidden='true'>
                      0{index + 1}
                    </span>
                    <h2 className='guide-step__title'>{step.title}</h2>
                    <p className='guide-step__body'>{step.body}</p>
                    {step.note && <p className='guide-step__note'>{step.note}</p>}
                  </div>
                  {/* 실제 화면을 옮긴 예시라 화면 낭독기에서는 숨긴다. 할 일은 왼쪽 글이 모두 설명한다. */}
                  <div className='guide-mockup' aria-hidden='true'>
                    <step.Mockup />
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* 홈 첫 화면처럼 문구·버튼만 두고 배경 상자는 두지 않는다. */}
          <section className='guide-start' aria-labelledby='guide-start-title'>
            <h2 id='guide-start-title' className='guide-start__title'>
              <span className='guide-start__problem'>첫 조회 링크 만들기를</span>{' '}
              <span className='guide-start__solution'>허브스페이스와 함께해요</span>
            </h2>
            <p className='guide-start__lead'>
              <span className='guide__mobile-line'>구글 로그인부터 조회 링크 생성까지</span>{' '}
              <span className='guide__mobile-line'>2분이면 가능해요.</span>
            </p>
            <div className='guide-start__actions'>
              <button
                type='button'
                className={`home-button home-button--primary${hasSession ? ' home-button--dashboard' : ''}`}
                onClick={handleStart}
              >
                {!hasSession && <GoogleIcon aria-hidden='true' />}
                {hasSession ? '대시보드로 이동' : 'Google 계정으로 시작하기'}
              </button>
              <Link to='/contact' className='guide-start__link'>
                도움이 필요하면 문의하기
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
