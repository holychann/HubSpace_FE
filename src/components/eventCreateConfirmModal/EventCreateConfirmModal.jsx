import './EventCreateConfirmModal.css'
import ConfirmModal from '../confirmModal/ConfirmModal'
import CreateNotice from '../createNotice/CreateNotice'
import FormIcon from '../../assets/create/create-form.svg?react'
import FileIcon from '../../assets/create/create-file.svg?react'

const METHODS = {
  form: { Icon: FormIcon, label: 'FORM · Google Forms' },
  file: { Icon: FileIcon, label: 'FILE · 파일 업로드' },
}

// 이벤트 생성 직전의 최종 확인 화면. 생성 요청과 오류 처리는 호출 화면이 맡는다.
// notice.main·notice.sub 의 \n 은 줄바꿈으로 보여준다.
export default function EventCreateConfirmModal({
  isOpen,
  method,
  rows,
  notice,
  isProcessing,
  onConfirm,
  onClose,
}) {
  const { Icon, label } = METHODS[method]

  return (
    <ConfirmModal
      isOpen={isOpen}
      title='내용 확인'
      cancelText='돌아가기'
      confirmText='이벤트 생성'
      processingText='생성 중...'
      className='eventCreateConfirm'
      isProcessing={isProcessing}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      <div className='eventCreateConfirm-summary'>
        <div className='eventCreateConfirm-summary__method'>
          <Icon className='eventCreateConfirm-summary__icon' aria-hidden='true' />
          {label}
        </div>
        <dl className='eventCreateConfirm-summary__list'>
          {rows.map((row) => (
            <div key={row.label} className='eventCreateConfirm-summary__row'>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <CreateNotice title='필수 확인'>
        <p className='eventCreateConfirm-notice__main'>{notice.main}</p>
        <p className='eventCreateConfirm-notice__sub'>{notice.sub}</p>
      </CreateNotice>
    </ConfirmModal>
  )
}
