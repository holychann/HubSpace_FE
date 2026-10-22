import formIllustration from '../../../assets/dashboard/dashboard-image-form.svg'
import fileIllustration from '../../../assets/dashboard/dashboard-image-csv.svg'
import UploadIcon from '../../../assets/home/home-upload.svg?react'
import copyViewIcon from '../../../assets/guide/guide-copy-view.svg'
import copyApplyIcon from '../../../assets/guide/guide-copy-apply.svg'
import arrowRightIcon from '../../../assets/guide/guide-arrow-right.svg'
import arrowDownIcon from '../../../assets/guide/guide-arrow-down.svg'
import lookupScreenshot from '../../../assets/guide/guide-lookup.jpg'
import resultScreenshot from '../../../assets/guide/guide-result.jpg'

// 이용 방법 단계마다 옆에 두는 화면 예시 (Figma 'Components – 이용 방법' 의 Guide Mockup).
// 실제 화면을 단순하게 옮긴 그림이라 누를 수 없고, 화면 낭독기에서는 GuidePage 가 통째로 숨긴다.

function Field({ label, value, placeholder = false }) {
  return (
    <div className='guide-field'>
      <span className='guide-field__label'>{label}</span>
      <span className={`guide-field__input${placeholder ? ' guide-field__input--placeholder' : ''}`}>{value}</span>
    </div>
  )
}

function EventNameCard({ value }) {
  return (
    <div className='guide-card'>
      <Field label='이벤트 이름' value={value} />
    </div>
  )
}

function CopyLink({ variant, label, url }) {
  return (
    <div className={`guide-link guide-link--${variant}`}>
      <div className='guide-link__text'>
        <span className='guide-link__label'>{label}</span>
        <span className='guide-link__url'>{url}</span>
      </div>
      <span className='guide-link__icon'>
        <img src={variant === 'view' ? copyViewIcon : copyApplyIcon} alt='' />
      </span>
    </div>
  )
}

// 대시보드의 이벤트 카드. 파일 이벤트는 원본 파일명이 보이고 조회용 링크만 있다.
function EventCard({ type, title }) {
  const isForm = type === 'form'

  return (
    <div className='guide-card guide-card--outlined'>
      <p className='guide-event__title'>{title}</p>
      <div className='guide-badges'>
        <span className='guide-badge guide-badge--active'>활성</span>
        <span className={`guide-badge guide-badge--${type}`}>{isForm ? '폼' : '파일'}</span>
      </div>
      {!isForm && <p className='guide-event__file'>학생회비 납부자 명단.tsv</p>}
      <p className='guide-event__meta'>{'2026.10.22  ·  조회 0회'}</p>
      <div className='guide-links'>
        <CopyLink variant='view' label='조회용 링크' url='https://hubspacekw.com/search?eventId=…' />
        {isForm && <CopyLink variant='apply' label='폼 링크' url='https://docs.google.com/forms/d/…' />}
      </div>
    </div>
  )
}

// 조회 화면 → 조회 결과. 데스크탑은 가로, 모바일은 세로로 놓고 화살표도 그에 맞춰 바꾼다.
export function LookupFlowMockup() {
  return (
    <div className='guide-compare'>
      <div className='guide-shot'>
        <span className='guide-shot__label'>조회 화면</span>
        <div className='guide-shot__frame guide-shot__frame--lookup'>
          <img src={lookupScreenshot} alt='' loading='lazy' decoding='async' />
        </div>
      </div>
      <div className='guide-compare__arrow'>
        <img className='guide-compare__arrow-right' src={arrowRightIcon} alt='' />
        <img className='guide-compare__arrow-down' src={arrowDownIcon} alt='' />
      </div>
      <div className='guide-shot'>
        <span className='guide-shot__label'>조회 결과</span>
        <div className='guide-shot__frame guide-shot__frame--result'>
          <img src={resultScreenshot} alt='' loading='lazy' decoding='async' />
        </div>
      </div>
    </div>
  )
}

/* Google Forms */

export function FormNewEventMockup() {
  return (
    <div className='guide-card guide-card--outlined'>
      <p className='guide-modal__title'>새 이벤트 생성</p>
      <p className='guide-modal__description'>생성할 이벤트 형식을 선택하세요</p>
      <div className='guide-choices'>
        <div className='guide-choice guide-choice--form'>
          <img className='guide-choice__image guide-choice__image--form' src={formIllustration} alt='' />
          <span className='guide-choice__name'>Google Form</span>
          <span className='guide-choice__description'>구글폼 연동하여 생성</span>
        </div>
        <div className='guide-choice guide-choice--file'>
          <img className='guide-choice__image guide-choice__image--file' src={fileIllustration} alt='' />
          <span className='guide-choice__name'>CSV 파일</span>
          <span className='guide-choice__description'>CSV 파일을 업로드하여 생성</span>
        </div>
      </div>
    </div>
  )
}

export function FormFieldsMockup() {
  return (
    <>
      <EventNameCard value='컴공 미리배움터 신청' />
      <div className='guide-card'>
        <p className='guide-card__title'>폼 생성 필드</p>
        <p className='guide-card__required'>2개 이상 입력 필수</p>
        <div className='guide-notice'>
          <p>신청자가 조회 시 입력할 정보 필드를 설정하세요.</p>
          <p className='guide-notice__warning'>생성 후 항목명을 유지해주세요.</p>
        </div>
        <div className='guide-fields'>
          <Field label='정보 1' value='이름' />
          <Field label='정보 2' value='생년월일(8자리)' />
          <Field label='정보 3' value='ex) 전화번호' placeholder />
        </div>
      </div>
    </>
  )
}

export function FormCreateMockup() {
  return (
    <>
      <div className='guide-card'>
        <p className='guide-card__title'>폼 생성 필드</p>
        <Field label='정보 1' value='이름' />
        <Field label='정보 2' value='생년월일(8자리)' />
      </div>
      <span className='guide-mock-button'>이벤트 생성</span>
    </>
  )
}

export function FormEventCardMockup() {
  return <EventCard type='form' title='컴공 미리배움터 신청' />
}

/* 파일 업로드 */

export function FileRosterMockup() {
  return (
    <div className='guide-card guide-card--compact'>
      <p className='guide-roster__name'>학생회비 납부자 명단.tsv</p>
      <div className='guide-roster'>
        <table className='guide-roster__table'>
          <colgroup>
            <col className='guide-roster__col--name' />
            <col className='guide-roster__col--id' />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>이름</th>
              <th>학번(두 자리)</th>
              <th>납부</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>김허브</td>
              <td>24</td>
              <td>완료</td>
            </tr>
            <tr>
              <td>이공간</td>
              <td>22</td>
              <td>미납</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className='guide-card__caption'>첫 행은 항목명, 다음 행부터 신청자 정보를 넣어요.</p>
    </div>
  )
}

export function FileUploadMockup() {
  return (
    <>
      <EventNameCard value='학생회비 납부 여부 조회' />
      <div className='guide-card'>
        <p className='guide-card__title'>데이터 파일</p>
        <div className='guide-upload'>
          <UploadIcon className='guide-upload__icon' />
          <span className='guide-upload__title'>파일이 선택되었습니다</span>
          <span className='guide-upload__description'>다른 파일은 이곳을 눌러주세요.</span>
          <span className='guide-upload__file'>학생회비 납부자 명단.tsv</span>
        </div>
      </div>
    </>
  )
}

// 드롭다운의 ⌄ 는 Figma 처럼 글자 뒤 두 칸을 띄워 붙인다.
export function FileColumnsMockup() {
  return (
    <div className='guide-card'>
      <p className='guide-card__title'>조회에 사용할 정보</p>
      <p className='guide-card__required'>2개 이상 필수</p>
      <div className='guide-fields'>
        <Field label='정보 1' value='이름  ⌄' />
        <Field label='정보 2' value='학번(두 자리)  ⌄' />
        <Field label='정보 3' value='선택  ⌄' placeholder />
      </div>
      <p className='guide-card__title'>조회 결과에 표시할 정보</p>
      <p className='guide-card__caption'>선택 사항 · 결과에 보여줄 정보를 골라요.</p>
      <span className='guide-field__input guide-field__input--display'>{'1개 선택됨  ⌄'}</span>
      <span className='guide-badge guide-badge--chip'>{'납부  ×'}</span>
    </div>
  )
}

export function FileEventCardMockup() {
  return <EventCard type='file' title='학생회비 납부 여부 조회' />
}
