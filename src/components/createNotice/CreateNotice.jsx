import './CreateNotice.css'
import { useId, useState } from 'react'
import InfoIcon from '../../assets/create/create-info.svg?react'
import ChevronIcon from '../../assets/create/create-chevron.svg?react'

// 이벤트 생성 화면의 안내 박스. items 를 주면 제목·설명 목록을, 아니면 children 을 본문으로 보여준다.
// 목록은 첫 화면에서 입력칸이 가려지지 않도록 항목 제목만 보여주고, 설명은 '자세히 보기'로 펼친다.
// 펼침 애니메이션은 문의하기 FAQ 와 같다. 닫힌 설명은 inert 로 화면 낭독기와 탭 이동에서 뺀다.
export default function CreateNotice({ title, items, children }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const listId = useId()

  return (
    <section
      className={`createNotice${items ? ' createNotice--list' : ''}${isExpanded ? ' createNotice--expanded' : ''}`}
    >
      <div className='createNotice__header'>
        <h2 className='createNotice__title'>
          <InfoIcon className='createNotice__icon' aria-hidden='true' />
          {title}
        </h2>
        {items && (
          <button
            type='button'
            className='createNotice__toggle'
            aria-expanded={isExpanded}
            aria-controls={listId}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? '접기' : '자세히 보기'}
            <ChevronIcon className='createNotice__chevron' aria-hidden='true' />
          </button>
        )}
      </div>
      {items ? (
        <ul id={listId} className='createNotice__list'>
          {items.map((item) => (
            <li key={item.title} className='createNotice__item'>
              <strong className='createNotice__itemTitle'>{item.title}</strong>
              <div className='createNotice__panel' inert={!isExpanded}>
                <div className='createNotice__panelInner'>
                  <p className='createNotice__itemText'>{item.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        children
      )}
    </section>
  )
}
