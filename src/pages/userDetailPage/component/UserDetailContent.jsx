import authLogo from '../../../assets/auth/auth-logo.png'
import { getUserFieldPlaceholder } from '../../userResultPage/utils/UserFieldConfig'
import '../entry/UserDetailPage.css'

export function UserDetailLogo() {
  return (
    <a href='/' className='user-detail__logoLink' aria-label='홈으로 이동'>
      <img src={authLogo} alt='HubSpace' className='user-detail__logo' />
    </a>
  )
}

export default function UserDetailContent({
  eventDetail,
  values = {},
  onChange,
  onSubmit,
  measurement = false,
}) {
  return (
    <div className='user-detail__container'>
      <UserDetailLogo />
      <div className='user-detail__card'>
        <h1 className='user-detail__title'>{eventDetail.eventTitle || '신청 조회'}</h1>
        <p className='user-detail__description'>아래 정보를 입력해주세요.</p>

        <form
          id={measurement ? undefined : 'user-detail-form'}
          className='user-detail__form'
          onSubmit={onSubmit}
        >
          {eventDetail.searchColumns.map((columnName) => (
            <div className='user-detail__field' key={columnName}>
              <label htmlFor={measurement ? undefined : columnName} className='user-detail__label'>
                {columnName}
              </label>
              <input
                type='text'
                id={measurement ? undefined : columnName}
                name={columnName}
                className='user-detail__input'
                placeholder={getUserFieldPlaceholder(columnName)}
                value={values[columnName] ?? ''}
                onChange={onChange}
                required={!measurement}
                readOnly={measurement}
                disabled={measurement}
              />
            </div>
          ))}
        </form>
      </div>
    </div>
  )
}
