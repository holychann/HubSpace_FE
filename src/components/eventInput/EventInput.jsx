import { Icon } from '../icon/Icon'
import './EventInput.css'

export default function EventInput() {
  return (
    <div className='eventInput'>
      <div className='eventInput-title'>이벤트 관리명</div>
      <div className='eventInput-info'>폼 제복과 다른 관리자에게만 보여지는 관리용 제목입니다.</div>
      <div className='eventInput-input'>
        <input className='eventInput-input-input' placeholder='이벤트 관리명을 입력하세요.'></input>
        <Icon name='detail-input' height={12} className='eventInput-input-icon' />
      </div>
    </div>
  )
}
