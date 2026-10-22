import { useLayoutEffect, useRef } from 'react'

// 홈 Methods 와 이용 방법 화면이 함께 쓰는 'Google Forms / 파일 업로드' 토글. 모양은 HomePage.css 의 home-methods__tabs 다.
// methods 는 { type, title, Icon } 목록이고, 탭 id 는 `${idPrefix}-tab-${type}` 이다.
export default function MethodTabs({ methods, activeIndex, onSelect, idPrefix, panelId }) {
  const tablistRef = useRef(null)
  const tabRefs = useRef([])

  // 토글의 흰 표시 막대를 선택된 탭 자리로 옮긴다. 두 탭의 폭이 달라 위치와 폭을 함께 잰다.
  // 처음 자리를 잡을 때는 움직이지 않게, 자리를 잡은 다음 틀부터 이동 효과(data-ready)를 켠다.
  useLayoutEffect(() => {
    const tablist = tablistRef.current
    const place = () => {
      const tab = tabRefs.current[activeIndex]
      tablist.style.setProperty('--indicator-x', `${tab.offsetLeft}px`)
      tablist.style.setProperty('--indicator-w', `${tab.offsetWidth}px`)
    }
    place()
    const frameId = window.requestAnimationFrame(() => {
      tablist.dataset.ready = 'true'
    })
    // 글꼴이 늦게 불러와지거나 화면 폭이 바뀌어 탭 폭이 달라지면 다시 맞춘다.
    const observer = new ResizeObserver(place)
    tabRefs.current.forEach((tab) => observer.observe(tab))
    return () => {
      window.cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [activeIndex])

  // 탭 목록 안에서는 화살표·Home·End 로 옮겨 다니고, 옮기면 바로 그 방식을 보인다.
  const handleTabKeyDown = (event) => {
    const lastIndex = methods.length - 1
    const nextIndex = {
      ArrowRight: activeIndex === lastIndex ? 0 : activeIndex + 1,
      ArrowLeft: activeIndex === 0 ? lastIndex : activeIndex - 1,
      Home: 0,
      End: lastIndex,
    }[event.key]
    if (nextIndex === undefined) return

    event.preventDefault()
    onSelect(nextIndex)
    tabRefs.current[nextIndex].focus()
  }

  return (
    <div ref={tablistRef} className='home-methods__tabs' role='tablist' aria-label='시작 방식'>
      {methods.map((item, index) => (
        <button
          key={item.type}
          ref={(node) => {
            tabRefs.current[index] = node
          }}
          type='button'
          role='tab'
          id={`${idPrefix}-tab-${item.type}`}
          className={`home-methods__tab home-methods__tab--${item.type}`}
          aria-selected={index === activeIndex}
          aria-controls={panelId}
          tabIndex={index === activeIndex ? 0 : -1}
          onClick={() => onSelect(index)}
          onKeyDown={handleTabKeyDown}
        >
          <item.Icon aria-hidden='true' />
          {item.title}
        </button>
      ))}
    </div>
  )
}
