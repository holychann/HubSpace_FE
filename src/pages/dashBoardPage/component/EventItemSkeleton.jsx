import './EventItem.css'
import Skeleton from '../../../components/skeleton/Skeleton'

// 목록을 불러오는 동안 EventItem 자리에 보이는 카드. 높이를 실제 카드(파일명 없는 경우)와 맞춰
// 목록이 들어와도 화면이 덜 흔들리게 한다.
export default function EventItemSkeleton() {
  return (
    <div className='eventItem' aria-hidden='true'>
      <div className='eventItem-header__header'>
        <div className='eventItem-title'>
          <Skeleton width='min(180px, 60%)' height={20} />
          <div className='eventItem-title__badges'>
            <Skeleton width={38} height={21} />
            <Skeleton width={30} height={21} />
          </div>
        </div>
        <div className='eventItem-info'>
          <Skeleton width={84} height={14} />
          <Skeleton width={64} height={14} />
        </div>
      </div>
      <div className='eventItem-links'>
        <Skeleton height={69} radius={10} />
      </div>
    </div>
  )
}
