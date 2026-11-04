import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatDuration, formatEndDate, sortByClosedAtDesc } from './closedEventDate.js'

test('종료일은 시간과 관계없이 날짜 부분으로 보여준다', () => {
  assert.deepEqual(formatEndDate('2026-10-24T23:59:59'), { monthDay: '10.24', year: '2026' })
  assert.deepEqual(formatEndDate('2026-01-01T00:00:00.000'), { monthDay: '01.01', year: '2026' })
  assert.equal(formatEndDate(null), null)
})

test('운영 기간은 시작일과 종료일을 모두 센다', () => {
  assert.deepEqual(formatDuration('2026-10-14T09:00:00', '2026-10-24T01:00:00'), { days: 11, range: '10.14 ~ 10.24' })
  assert.deepEqual(formatDuration('2026-09-01T10:00:00', '2026-10-10T18:00:00'), { days: 40, range: '09.01 ~ 10.10' })
})

test('같은 날 만들고 종료하면 1일이다', () => {
  assert.equal(formatDuration('2026-05-02T09:00:00', '2026-05-02T21:00:00').days, 1)
})

test('해가 바뀌면 시작일에 연도를 붙인다', () => {
  assert.deepEqual(formatDuration('2025-12-28T09:00:00', '2026-01-03T09:00:00'), {
    days: 7,
    range: '2025.12.28 ~ 01.03',
  })
})

test('날짜가 하나라도 없으면 기간을 만들지 않는다', () => {
  assert.equal(formatDuration('2026-10-14T09:00:00', null), null)
  assert.equal(formatDuration(undefined, '2026-10-24T09:00:00'), null)
})

test('종료일이 늦은 순서로 정렬하고 종료 시각이 없는 이벤트는 뒤로 보낸다', () => {
  const events = [
    { id: 'a', closedAt: '2026-09-05T10:00:00' },
    { id: 'b', closedAt: null },
    { id: 'c', closedAt: '2026-10-24T10:00:00' },
    { id: 'd', closedAt: '2026-10-10T10:00:00' },
  ]
  assert.deepEqual(sortByClosedAtDesc(events).map((e) => e.id), ['c', 'd', 'a', 'b'])
  assert.deepEqual(events.map((e) => e.id), ['a', 'b', 'c', 'd'])
})
