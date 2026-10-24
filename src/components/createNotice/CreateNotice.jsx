import './CreateNotice.css'
import InfoIcon from '../../assets/create/create-info.svg?react'

// 이벤트 생성 화면의 안내 박스. items 를 주면 제목·설명 목록을, 아니면 children 을 본문으로 보여준다.
export default function CreateNotice({ title, items, children }) {
  return (
    <section className='createNotice'>
      <h2 className='createNotice__title'>
        <InfoIcon className='createNotice__icon' aria-hidden='true' />
        {title}
      </h2>
      {items ? (
        <ul className='createNotice__list'>
          {items.map((item) => (
            <li key={item.title} className='createNotice__item'>
              <strong className='createNotice__itemTitle'>{item.title}</strong>
              <p className='createNotice__itemText'>{item.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        children
      )}
    </section>
  )
}
