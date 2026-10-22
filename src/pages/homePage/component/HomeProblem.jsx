import { useEffect, useRef, useState } from 'react'

// 같은 '신청 확인' 질문이 사람마다 따로 쌓인 채팅 목록 (예시)
const CHATS = [
  { name: '김*진', preview: '저 신청 됐는지 확인해주실 수 있나요?', unread: 2 },
  { name: '이*우', preview: '미리배움터 신청했는데 명단에 있나요?', unread: 1 },
  { name: '박*연', preview: '혹시 제 신청 확인됐을까요?', unread: 3 },
  { name: '최*호', preview: '신청 완료됐는지 궁금해요!', unread: 1 },
  { name: '정*아', preview: '저도 확인 부탁드려요', unread: 2 },
  { name: '한*민', preview: '신청 확인 좀 해주실 수 있을까요?', unread: 1 },
  { name: '윤*서', preview: '신청서 제출했는데 접수됐나요?', unread: 2 },
  { name: '강*훈', preview: '제 이름 명단에 있는지 봐주세요', unread: 1 },
  { name: '조*린', preview: '신청한 것 같은데 확인이 안 돼요', unread: 4 },
  { name: '임*준', preview: '혹시 저 신청 누락된 건 아니죠?', unread: 1 },
  { name: '오*은', preview: '신청 내역 확인 가능할까요?', unread: 2 },
  { name: '서*율', preview: '친구랑 같이 신청했는데 둘 다 됐나요?', unread: 3 },
  { name: '신*혁', preview: '혹시 저도 명단에 있을까요?', unread: 1 },
  { name: '권*희', preview: '확인 부탁드립니다!', unread: 1 },
  { name: '황*우', preview: '신청 확인 부탁드려요', unread: 2 },
  { name: '송*아', preview: '저 신청 잘 됐는지 한 번만 봐주세요', unread: 1 },
]
const AVATAR_COLORS = ['#d6e7ff', '#d3f4ea', '#e7e0ff', '#ffe1f4', '#fde9d2']

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export default function HomeProblem() {
  const sectionRef = useRef(null)
  const innerRef = useRef(null)
  const viewportRef = useRef(null)
  const rowsRef = useRef(null)
  const [pinned, setPinned] = useState(false)

  // 구간이 한 화면에 들어가고 동작 줄이기 설정이 아닐 때만 화면을 고정한다.
  useEffect(() => {
    const section = sectionRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const update = () => {
      const headerHeight = parseFloat(getComputedStyle(section).getPropertyValue('--home-header-h')) || 0
      const fits = innerRef.current.offsetHeight <= window.innerHeight - headerHeight - 48
      setPinned(fits && !reduceMotion.matches)
      section.style.setProperty(
        '--chat-shift',
        `${rowsRef.current.scrollHeight - viewportRef.current.clientHeight}px`,
      )
    }

    update()
    window.addEventListener('resize', update)
    reduceMotion.addEventListener('change', update)
    return () => {
      window.removeEventListener('resize', update)
      reduceMotion.removeEventListener('change', update)
    }
  }, [])

  // 고정된 동안의 스크롤 진행도(0~1)만큼 목록을 내린다.
  useEffect(() => {
    const section = sectionRef.current
    const setProgress = (progress) => {
      section.style.setProperty('--chat-progress', String(progress))
    }

    if (!pinned) {
      setProgress(0)
      return undefined
    }

    const scroller = section.closest('.home')
    let frameId = null
    const measure = () => {
      frameId = null
      const headerHeight = parseFloat(getComputedStyle(section).getPropertyValue('--home-header-h')) || 0
      const stageHeight = window.innerHeight - headerHeight
      const distance = section.offsetHeight - stageHeight
      if (distance <= 0) return
      setProgress(clamp((headerHeight - section.getBoundingClientRect().top) / distance, 0, 1))
    }
    const onScroll = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(measure)
    }

    measure()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      if (frameId !== null) window.cancelAnimationFrame(frameId)
    }
  }, [pinned])

  return (
    <section
      ref={sectionRef}
      className={`home-problem${pinned ? ' home-problem--pinned' : ''}`}
      aria-labelledby='home-problem-title'
    >
      <div className='home-problem__stage'>
        <div ref={innerRef} className='home-container home-problem__inner'>
          <div className='home-problem__copy'>
            <h2 id='home-problem-title' className='home-problem__title'>
              아직도 하나하나 답하고 계신가요?
            </h2>
            <p className='home-problem__lead'>신청이 됐는지 묻는 메시지가 끝없이 쌓여요.</p>
          </div>

          {/* 예시 그림이라 화면 낭독기에서는 숨긴다. 뜻은 제목과 설명이 전한다. */}
          <div className='home-chat' aria-hidden='true'>
            <div className='home-chat__header'>
              <span className='home-chat__title'>채팅</span>
              <span className='home-chat__total'>안 읽은 대화 37개</span>
            </div>
            <div ref={viewportRef} className='home-chat__viewport'>
              <ul ref={rowsRef} className='home-chat__rows'>
                {CHATS.map((chat, index) => (
                  <li key={chat.name} className='home-chat__row'>
                    <span
                      className='home-chat__avatar'
                      style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                    />
                    <span className='home-chat__text'>
                      <span className='home-chat__name'>{chat.name}</span>
                      <span className='home-chat__preview'>{chat.preview}</span>
                    </span>
                    <span className='home-chat__badge'>{chat.unread}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
