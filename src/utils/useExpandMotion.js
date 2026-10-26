import { useLayoutEffect, useRef, useState } from 'react'

// 펼치면 아래 내용을 밀어내는 영역(생성 화면 안내 카드, 문의하기 FAQ)을 transform 애니메이션으로 열고 닫는다.
// 높이를 프레임마다 바꾸면 iOS Safari 는 페이지 렌더링 주기(기본 60fps, 저전력 모드 30fps)에 묶여 끊겨 보인다.
// 그래서 레이아웃은 한 번에 바꾸고, 바뀌기 전 모습에서 출발하도록 transform 으로 되돌려 둔 뒤 0으로 움직인다(FLIP).
// transform 애니메이션은 페이지 렌더링과 따로 처리돼 화면 주사율대로 움직인다.
//
// 표시 규칙
// - 펼침 영역에 data-expand-panel 을 달고 overflow: hidden 으로 둔다. 첫 자식이 내용이다.
// - 펼침 영역 뒤에 오는 요소는 스크롤 영역 끝까지 함께 움직인다(fixed·sticky 는 제외).
// - 배경처럼 상자의 아래 끝을 따라가야 하는 요소에는 data-expand-bg 를 단다.
// - 닫을 때는 애니메이션이 끝날 때까지 펼친 레이아웃(isShown)을 유지한다.

// 화살표 회전(CSS transition)과 같은 시간·곡선이다.
const DURATION = 320
const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'

const isPinned = (element) => /fixed|sticky/.test(getComputedStyle(element).position)

// 스크롤 영역에 scroll-behavior: smooth 가 있어도 transform 보정과 같은 순간에 옮겨지도록 잠시 끄고 즉시 옮긴다.
// behavior: 'instant' 는 지원하지 않는 Safari 가 있어 쓰지 않는다.
function scrollBy(element, top) {
  element.style.scrollBehavior = 'auto'
  element.scrollTop += top
  element.style.scrollBehavior = ''
}

function findScrollRoot(element) {
  for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(node).overflowY)) return node
  }
  return document.body
}

// 펼친 레이아웃에서 측정해, 요소마다 닫힌 모습과 펼친 모습의 translateY 를 구한다.
function createMotion(root, closing) {
  const scrollRoot = findScrollRoot(root)
  const moves = new Map()
  const move = (element, closedY, openY = 0) => {
    const [prevClosed, prevOpen] = moves.get(element) ?? [0, 0]
    moves.set(element, [prevClosed + closedY, prevOpen + openY])
  }

  let total = 0
  root.querySelectorAll('[data-expand-panel]').forEach((panel) => {
    // reveal 은 드러나는 높이, shift 는 아래 내용이 밀리는 거리다. 음수 margin-top 으로 위와 겹친 만큼 shift 가 짧다.
    // offsetHeight 는 정수로 반올림돼 소수점 높이에서 시작·끝이 살짝 튄다.
    const reveal = panel.getBoundingClientRect().height
    const shift = reveal + parseFloat(getComputedStyle(panel).marginTop)
    total += shift
    // 영역은 위로 올리고 내용은 같은 거리만큼 내려서, 글자는 제자리에 둔 채 잘리는 아래 끝만 움직인다.
    move(panel, -reveal)
    move(panel.firstElementChild, reveal)
    for (let node = panel; node !== scrollRoot; node = node.parentElement) {
      for (let next = node.nextElementSibling; next; next = next.nextElementSibling) {
        if (!isPinned(next)) move(next, -shift)
      }
    }
  })
  root.querySelectorAll('[data-expand-bg]').forEach((element) => move(element, -total))

  // 맨 아래까지 스크롤한 채 닫으면, 레이아웃이 줄어드는 순간 스크롤 위치가 한 번에 당겨진다.
  // 미리 그만큼 스크롤을 올리고 내용 전체를 같은 거리만큼 올려 두어 화면은 그대로 둔 뒤, 닫히면서 함께 내린다.
  let scrollShift = 0
  if (closing) {
    const maxScrollAfter = Math.max(0, scrollRoot.scrollHeight - total - scrollRoot.clientHeight)
    scrollShift = Math.max(0, scrollRoot.scrollTop - maxScrollAfter)
    if (scrollShift > 0) {
      scrollBy(scrollRoot, -scrollShift)
      for (const child of scrollRoot.children) {
        if (!isPinned(child)) move(child, 0, -scrollShift)
      }
    }
  }

  const animations = [...moves].map(([element, [closedY, openY]]) => {
    const frames = [{ transform: `translateY(${closedY}px)` }, { transform: `translateY(${openY}px)` }]
    if (closing) frames.reverse()
    return element.animate(frames, { duration: DURATION, easing: EASING, fill: 'both' })
  })
  return { animations, closing, scrollRoot, scrollShift }
}

export default function useExpandMotion() {
  // isOpen 은 사용자가 고른 상태(aria, inert, 화살표), isShown 은 펼친 레이아웃 여부다.
  const [isOpen, setIsOpen] = useState(false)
  const [isShown, setIsShown] = useState(false)
  const rootRef = useRef(null)
  const motionRef = useRef(null)
  const shouldPlayRef = useRef(false)
  const finishedRef = useRef(null)

  const toggle = () => {
    const opening = !isOpen
    setIsOpen(opening)
    // 움직이는 중에 다시 누르면 그 자리에서 되돌아간다.
    if (motionRef.current) {
      motionRef.current.animations.forEach((animation) => animation.reverse())
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsShown(opening)
      return
    }
    shouldPlayRef.current = true
    if (opening) setIsShown(true)
  }

  useLayoutEffect(() => {
    // 닫힌 레이아웃이 반영된 뒤에 마지막 모습을 붙들던 애니메이션을 지운다. 그리기 전이라 깜빡이지 않는다.
    finishedRef.current?.forEach((animation) => animation.cancel())
    finishedRef.current = null
    if (!shouldPlayRef.current) return
    shouldPlayRef.current = false

    const motion = createMotion(rootRef.current, !isOpen)
    const [first] = motion.animations
    first.onfinish = () => {
      motionRef.current = null
      // 되돌린 횟수에 따라 끝난 방향이 바뀐다. 정방향으로 끝났으면 처음 정한 방향 그대로다.
      const closed = motion.closing === (first.playbackRate > 0)
      if (closed) {
        finishedRef.current = motion.animations
        setIsShown(false)
      } else {
        motion.animations.forEach((animation) => animation.cancel())
        scrollBy(motion.scrollRoot, motion.scrollShift)
      }
    }
    motionRef.current = motion
  }, [isOpen, isShown])

  return { rootRef, isOpen, isShown, toggle }
}
