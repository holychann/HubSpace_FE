import Skeleton from '../../../components/skeleton/Skeleton'

// 이벤트 정보를 불러오는 동안 보이는 '현재 설정' 카드. 항목 이름은 그대로 보여 주고 값 자리만 스켈레톤으로 둔다.
// 마크업과 클래스는 CsvDetailPage 의 실제 카드와 같아, 정보가 들어와도 카드 크기가 거의 바뀌지 않는다.
const TEXT_ROWS = [
  { label: '이벤트 이름', width: 180 },
  { label: '현재 파일', width: 220 },
]

export default function CurrentSettingsSkeleton() {
  return (
    <div className='csvDetail-summary' role='status' aria-label='이벤트 정보를 불러오는 중입니다'>
      <div className='csvDetail-summary__title'>현재 설정</div>
      <dl className='csvDetail-summary__list' aria-hidden='true'>
        {TEXT_ROWS.map(({ label, width }) => (
          <div key={label} className='csvDetail-summary__row'>
            <dt className='csvDetail-summary__label'>{label}</dt>
            <dd className='csvDetail-summary__value'>
              <Skeleton width={width} height={12} />
            </dd>
          </div>
        ))}
        <div className='csvDetail-summary__row'>
          <dt className='csvDetail-summary__label'>이벤트 ID</dt>
          <dd className='csvDetail-summary__value csvDetail-summary__value--id'>
            <Skeleton width={120} height={12} />
            {/* 실제 복사 버튼과 같은 크기이고, 모바일에서 함께 숨는다. 이 칸이 행 높이를 정한다. */}
            <Skeleton width={28} height={28} className='csvDetail-summary__copy' />
          </dd>
        </div>
        <div className='csvDetail-summary__row'>
          <dt className='csvDetail-summary__label'>현재 명단</dt>
          <dd className='csvDetail-summary__value'>
            <Skeleton width={56} height={12} />
          </dd>
        </div>
        <div className='csvDetail-summary__row'>
          <dt className='csvDetail-summary__label'>조회에 사용할 정보</dt>
          <dd className='csvDetail-summary__value csvDetail-summary__chips'>
            <Skeleton width={52} height={22} radius={3} />
            <Skeleton width={64} height={22} radius={3} />
          </dd>
        </div>
        <div className='csvDetail-summary__row'>
          <dt className='csvDetail-summary__label'>조회 결과에 표시할 정보</dt>
          <dd className='csvDetail-summary__value csvDetail-summary__chips'>
            <Skeleton width={52} height={22} radius={3} />
            <Skeleton width={72} height={22} radius={3} />
            <Skeleton width={44} height={22} radius={3} />
          </dd>
        </div>
      </dl>
    </div>
  )
}
