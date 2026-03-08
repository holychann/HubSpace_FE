import { Icon } from '../icon/Icon'
import './EventInput.css'

export default function EventInput({
  value,
  onChange,
  placeholder = '이벤트 관리명을 입력하세요.',
  title = '이벤트 관리명',
  info = '폼 제복과 다른 관리자에게만 보여지는 관리용 제목입니다.',
}) {
  return (
    <div className='eventInput'>
      <div className='eventInput-title'>{title}</div>
      <div className='eventInput-info'>{info}</div>
      <div className='eventInput-input'>
        <input
          className='eventInput-input-input'
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <Icon name='detail-input' height={12} className='eventInput-input-icon' />
      </div>
    </div>
  )
}
