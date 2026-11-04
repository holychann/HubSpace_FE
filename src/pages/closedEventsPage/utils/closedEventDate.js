// 종료 이벤트 목록의 날짜 표시. 서버는 시간대 없는 'YYYY-MM-DDTHH:mm:ss' 를 보내므로 날짜 부분만 읽는다.
// new Date 로 읽으면 시간대에 따라 날짜가 하루 밀릴 수 있어 문자열을 직접 나눈다.
function toDateParts(value) {
  const match = typeof value === 'string' ? value.match(/^(\d{4})-(\d{2})-(\d{2})/) : null
  if (!match) return null
  return { year: match[1], month: match[2], day: match[3] }
}

const toUtcDay = ({ year, month, day }) => Date.UTC(Number(year), Number(month) - 1, Number(day))

// 첫 열의 종료일. 종료 시각이 없으면 null.
export function formatEndDate(closedAt) {
  const parts = toDateParts(closedAt)
  if (!parts) return null
  return { monthDay: `${parts.month}.${parts.day}`, year: parts.year }
}

// 운영 기간: 시작일과 종료일을 모두 세는 일수와 'MM.DD ~ MM.DD' 범위. 해가 바뀌면 시작일에 연도를 붙인다.
export function formatDuration(createdAt, closedAt) {
  const start = toDateParts(createdAt)
  const end = toDateParts(closedAt)
  if (!start || !end) return null

  const days = Math.round((toUtcDay(end) - toUtcDay(start)) / 86_400_000) + 1
  const startLabel =
    start.year === end.year ? `${start.month}.${start.day}` : `${start.year}.${start.month}.${start.day}`
  return { days: Math.max(days, 1), range: `${startLabel} ~ ${end.month}.${end.day}` }
}

// 종료일이 늦은 순서. 종료 시각이 없는 이벤트는 맨 뒤에 두고, 그 안에서는 서버 순서(생성 최신순)를 지킨다.
export function sortByClosedAtDesc(events) {
  return [...events].sort((a, b) => {
    if (!a.closedAt && !b.closedAt) return 0
    if (!a.closedAt) return 1
    if (!b.closedAt) return -1
    return a.closedAt < b.closedAt ? 1 : a.closedAt > b.closedAt ? -1 : 0
  })
}
