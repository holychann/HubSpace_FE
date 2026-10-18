import './CsvColumnSelect.css'
import { useState } from 'react'
import EventDropdown from '../eventDropdown/EventDropdown'
import { Icon } from '../icon/Icon'

const EMPTY_SEARCH_VALUE = ['선택', '선택', '선택']

// CSV 생성·파일 변경 화면이 함께 쓰는 검색(조회) 컬럼·표시 컬럼 선택 섹션.
// searchValue 는 EventDropdown 형식(3칸, 빈 칸은 '선택')이고 displayValue 는 선택된 컬럼 목록이다.
export default function CsvColumnSelect({
  columns,
  searchValue,
  onSearchChange,
  displayValue,
  onDisplayChange,
  disabled = false,
}) {
  // 연 시점의 columns 를 기억해, 새 파일을 읽어 columns 가 바뀌면 목록이 닫히게 한다.
  const [openedColumns, setOpenedColumns] = useState(null)
  const isDisabled = disabled || columns.length === 0
  const isDisplayOpen = openedColumns === columns && !isDisabled
  // 파일이 없으면 이전 선택값을 보여주지 않는다. 다음 파일을 읽을 때 페이지가 기준으로 다시 쓴다.
  const shownSearch = columns.length ? searchValue : EMPTY_SEARCH_VALUE
  const shownDisplay = columns.length ? displayValue : []

  // 실제 선택된 필드만
  const validFields = searchValue.filter((v) => v !== '선택')

  // 표시 필드로 선택 가능한 컬럼 (조회 필드와 중복 제외)
  const displayColumnOptions = columns.filter((col) => !validFields.includes(col))

  // 조회 필드와 중복된 표시 필드는 선택 해제한다.
  const handleSearchChange = (nextValue) => {
    onSearchChange(nextValue)
    const nextDisplay = displayValue.filter((column) => !nextValue.includes(column))
    if (nextDisplay.length !== displayValue.length) onDisplayChange(nextDisplay)
  }

  const toggleDisplayDropdown = () => {
    if (isDisabled) return
    setOpenedColumns((prev) => (prev === columns ? null : columns))
  }

  const handleSelectDisplayColumn = (value) => {
    onDisplayChange(
      displayValue.includes(value)
        ? displayValue.filter((column) => column !== value)
        : [...displayValue, value],
    )
  }

  return (
    <div className='csvColumnSelect'>
      <div className='csvColumnSelect__header'>
        <div className='csvColumnSelect__title'>
          <div className='csvColumnSelect__title--title'>조회에 사용할 정보</div>
          <div className='csvColumnSelect__title--notice'>2개 이상 필수</div>
        </div>

        <div className='csvColumnSelect__infoBox'>
          <div className='csvColumnSelect__info'>
            신청자 확인에 사용할 정보를 선택해 주세요.
            <span className='csvColumnSelect__infoExample'>예: 이름, 학번, 사번</span>
          </div>
          {/*<div className='csvColumnSelect__info--notice'>*/}
          {/*  생성 후 변경 불가*/}
          {/*</div>*/}
        </div>

        <div className='csvColumnSelect__field'>
          <EventDropdown
            columns={columns.length ? columns : ['선택']}
            value={shownSearch}
            onChange={handleSearchChange}
            disabled={isDisabled}
          />
        </div>
      </div>

      <div className='csvColumnSelect__header'>
        <div className='csvColumnSelect__title'>
          <div className='csvColumnSelect__title--title'>조회 결과에 표시할 정보</div>
          <div className='csvColumnSelect__title--notice csvColumnSelect__title--optional'>
            선택
          </div>
        </div>

        <div className='csvColumnSelect__infoBox'>
          <div className='csvColumnSelect__info'>
            조회 결과에 보여줄 정보를 선택해 주세요.
            <span className='csvColumnSelect__infoExample'>예: 합격 여부</span>
          </div>
          {/*<div className='csvColumnSelect__info--notice'>*/}
          {/*  생성 후 변경 불가*/}
          {/*</div>*/}
        </div>

        <div className='csvColumnSelect-display__field'>
          <button
            type='button'
            className={`csvColumnSelect-display__toggle ${
              isDisabled ? 'csvColumnSelect-display__toggle--disabled' : ''
            }`}
            onClick={toggleDisplayDropdown}
            disabled={isDisabled}
            aria-expanded={isDisplayOpen}
            aria-controls='csvColumnSelect-display-options'
          >
            <div
              className={`csvColumnSelect-display__title ${
                shownDisplay.length ? 'csvColumnSelect-display__title--selected' : ''
              }`}
            >
              {shownDisplay.length ? `${shownDisplay.length}개 선택됨` : '표시할 정보 선택'}
            </div>
            <Icon
              name='detail-field'
              height={4}
              className={`csvColumnSelect-display__arrow ${isDisplayOpen ? 'open' : ''}`}
            />
          </button>

          {isDisplayOpen && (
            <div id='csvColumnSelect-display-options' className='csvColumnSelect-display__content'>
              <div className='csvColumnSelect-display__options'>
                {displayColumnOptions.length === 0 && (
                  <div className='csvColumnSelect-display__empty'>선택 가능한 컬럼이 없습니다.</div>
                )}
                {displayColumnOptions.map((col) => (
                  <label
                    key={col}
                    className={`csvColumnSelect-display__item ${
                      shownDisplay.includes(col) ? 'csvColumnSelect-display__item--selected' : ''
                    }`}
                  >
                    <input
                      type='checkbox'
                      className='csvColumnSelect-display__checkbox'
                      checked={shownDisplay.includes(col)}
                      onChange={() => handleSelectDisplayColumn(col)}
                    />
                    <span>{col}</span>
                  </label>
                ))}
              </div>
              <div className='csvColumnSelect-display__actions'>
                <button
                  type='button'
                  className='csvColumnSelect-display__action csvColumnSelect-display__action--clear'
                  onClick={() => onDisplayChange([])}
                  disabled={shownDisplay.length === 0}
                >
                  전체 해제
                </button>
                <button
                  type='button'
                  className='csvColumnSelect-display__action csvColumnSelect-display__action--done'
                  onClick={() => setOpenedColumns(null)}
                >
                  선택 완료
                </button>
              </div>
            </div>
          )}

          {shownDisplay.length > 0 && (
            <div className='csvColumnSelect-display__chips' aria-label='선택된 표시 컬럼'>
              {shownDisplay.map((column) => (
                <div key={column} className='csvColumnSelect-display__chip'>
                  <span>{column}</span>
                  <button
                    type='button'
                    className='csvColumnSelect-display__chipRemove'
                    onClick={() => handleSelectDisplayColumn(column)}
                    disabled={isDisabled}
                    aria-label={`${column} 표시 컬럼 제거`}
                  >
                    <span aria-hidden='true'>×</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
