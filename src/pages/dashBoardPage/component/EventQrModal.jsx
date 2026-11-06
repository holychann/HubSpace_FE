import './EventQrModal.css'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import ConfirmModal from '../../../components/confirmModal/ConfirmModal'
import { Icon } from '../../../components/icon/Icon'

// 카메라가 읽을 수 있게 QR은 다크 테마에서도 흰 바탕 위 남색(--color-text)으로 만든다.
// margin 4 는 QR 표준의 바깥 여백(4칸)이다.
const QR_OPTIONS = {
  errorCorrectionLevel: 'M',
  margin: 4,
  width: 1024,
  color: { dark: '#050064', light: '#ffffff' },
}

// 파일 이름에 쓸 수 없는 문자를 지운다.
const toFileName = (title) => `${(title || 'HubSpace').replace(/[\\/:*?"<>|]/g, '').trim()} QR.png`

export default function EventQrModal({ isOpen, eventTitle, url, onCopy, onClose }) {
  const [qrImage, setQrImage] = useState(null)

  // qrcode 는 모달을 처음 열 때만 불러와 대시보드 첫 로딩에 넣지 않는다.
  useEffect(() => {
    if (!isOpen) return

    let isCancelled = false
    import('qrcode')
      .then(({ default: QRCode }) => QRCode.toDataURL(url, QR_OPTIONS))
      .then((image) => {
        if (!isCancelled) setQrImage(image)
      })
      .catch((err) => {
        console.error('QR 코드 생성 실패:', err)
        if (!isCancelled) toast.error('QR 코드를 만들지 못했습니다.', { duration: 2000 })
      })

    return () => {
      isCancelled = true
    }
  }, [isOpen, url])

  const handleSave = () => {
    if (!qrImage) return

    const link = document.createElement('a')
    link.href = qrImage
    link.download = toFileName(eventTitle)
    link.click()
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      className='eventQrModal'
      title='QR 코드'
      description={eventTitle}
      cancelText={
        <>
          <Icon name='button-copy-search' height={14} className='eventQrModal__buttonIcon' />
          링크 복사
        </>
      }
      onCancel={onCopy}
      confirmText={
        <span className='eventQrModal__buttonLabel'>
          <Icon name='button-download' height={16} />
          이미지 저장
        </span>
      }
      onConfirm={handleSave}
      onClose={onClose}
    >
      <div className='eventQrModal__area'>
        {qrImage ? (
          <img className='eventQrModal__code' src={qrImage} alt={`${eventTitle} 조회 링크 QR 코드`} />
        ) : (
          <div className='eventQrModal__code eventQrModal__code--loading' aria-hidden='true' />
        )}
      </div>
    </ConfirmModal>
  )
}
