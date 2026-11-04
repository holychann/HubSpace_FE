import './ClosedEventsPage.css'
import Skeleton from '../../../components/skeleton/Skeleton'
import ClosedEventRow from '../component/ClosedEventRow'
import { useFetchClosedEvents } from '../apis/fetchClosedEvents'
import { formatEndDate } from '../utils/closedEventDate'

const SKELETON_COUNT = 3

// 모바일은 행에서 연도를 빼고, 종료 연도가 바뀔 때마다 묶음 머리를 한 번 보여준다. 데스크탑은 종료일 칸에 연도가 있어 숨긴다.
const toYearLabel = (event) => {
  const endDate = formatEndDate(event.closedAt)
  return endDate ? `${endDate.year}년` : '종료일 없음'
}

// 종료된 이벤트 목록 (Figma '06 · 종료된 이벤트 목록' A3 · 최종).
// 진행 중 목록(대시보드)과 헷갈리지 않게 카드 대신 표를 쓰고, 첫 열에 종료일을 둔다.
export default function ClosedEventsPage() {
  const { events, loading, error, removeEventLocally } = useFetchClosedEvents()

  return (
    <div className='closedEvents'>
      <div className='closedEvents-inner'>
        <div className='closedEvents-heading'>
          <h1 className='closedEvents-heading__title'>종료된 이벤트</h1>
          <p className='closedEvents-heading__count'>
            {loading ? <Skeleton width={200} height={16} /> : `조회 링크가 닫힌 이벤트 ${events.length}개`}
          </p>
        </div>

        <div className='closedEvents-panel'>
          <table className='closedEvents-table'>
            <thead>
              <tr>
                <th scope='col' className='closedEvents-table__end'>종료일</th>
                <th scope='col'>이벤트</th>
                <th scope='col' className='closedEvents-table__type'>형식</th>
                <th scope='col' className='closedEvents-table__duration'>운영 기간</th>
                <th scope='col' className='closedEvents-table__views'>조회 수</th>
                <th scope='col' className='closedEvents-table__actions'>
                  <span className='closedEvents-visuallyHidden'>메뉴</span>
                </th>
              </tr>
            </thead>
            <tbody aria-busy={loading}>
              {loading &&
                Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <tr key={index} className='closedEvent closedEvents-skeletonRow' aria-hidden='true'>
                    <td className='closedEvent-end'>
                      <Skeleton width={56} height={22} />
                    </td>
                    <td className='closedEvent-event'>
                      <Skeleton width='60%' height={18} />
                    </td>
                    <td className='closedEvent-type'>
                      <Skeleton width={48} height={14} />
                    </td>
                    <td className='closedEvent-duration'>
                      <Skeleton width={96} height={14} />
                    </td>
                    <td className='closedEvent-views'>
                      <Skeleton width={40} height={14} />
                    </td>
                    <td className='closedEvent-actions' />
                  </tr>
                ))}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className='closedEvents-message'>
                    종료된 이벤트를 불러오지 못했습니다.
                  </td>
                </tr>
              )}
              {!loading && !error && events.length === 0 && (
                <tr>
                  <td colSpan={6} className='closedEvents-empty'>
                    <div className='closedEvents-empty__title'>종료된 이벤트가 없어요</div>
                    <div className='closedEvents-empty__description'>이벤트를 종료하면 여기에 모여요.</div>
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                events.flatMap((event, index) => {
                  const row = <ClosedEventRow key={event.id} event={event} onDeleted={removeEventLocally} />
                  const year = toYearLabel(event)
                  if (index > 0 && toYearLabel(events[index - 1]) === year) return [row]
                  return [
                    <tr key={`year-${year}`} className='closedEvents-yearRow'>
                      <th colSpan={6} scope='rowgroup'>
                        {year}
                      </th>
                    </tr>,
                    row,
                  ]
                })}
            </tbody>
          </table>
          {loading && (
            <span className='closedEvents-visuallyHidden' role='status'>
              종료된 이벤트를 불러오는 중입니다
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
