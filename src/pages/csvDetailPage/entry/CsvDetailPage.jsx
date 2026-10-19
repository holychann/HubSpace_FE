import './CsvDetailPage.css'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import EventButton from '../../../components/eventButton/EventButton'
import CsvFileUpload from '../../../components/csvFileUpload/CsvFileUpload'
import CsvColumnSelect from '../../../components/csvColumnSelect/CsvColumnSelect'
import CsvPreview from '../../../components/csvPreview/CsvPreview'
import LoadingSpinner from '../../../components/loadingSpinner/LoadingSpinner'
import ConfirmModal from '../../../components/confirmModal/ConfirmModal'
import { Icon } from '../../../components/icon/Icon'
import { fetchFileEventDetail } from '../apis/fetchFileEventDetail'
import { replaceFileDataset } from '../apis/replaceFileDataset'
import { parseCsvDataset } from '../../../utils/csvDatasetParser'
import { keepAvailableColumns } from '../../../utils/csvColumnSelection'

const EMPTY_SEARCH_VALUE = ['선택', '선택', '선택']

const toSearchValue = (columns) => [...columns, ...EMPTY_SEARCH_VALUE].slice(0, 3)

const getBlockedReason = (event) => {
  if (event.eventType !== 'FILE') return 'CSV로 만든 이벤트만 파일을 변경할 수 있습니다.'
  if (event.isActive !== true) return '종료된 이벤트는 파일을 변경할 수 없습니다.'
  return null
}

// 409 와 응답 없는 실패는 저장 여부를 단정할 수 없으므로 최신 정보를 다시 불러오게 한다.
const toSubmitError = (err) => {
  const serverMessage = err?.response?.data?.error?.errorMessage

  if (err?.response?.status === 409) {
    return {
      needsRefresh: true,
      message:
        serverMessage ||
        '다른 명단 교체가 먼저 완료되었습니다. 최신 명단을 확인한 뒤 다시 시도해 주세요.',
    }
  }
  if (err?.isAxiosError && !err.response) {
    return {
      needsRefresh: true,
      message:
        '서버 응답을 받지 못해 파일이 변경되었는지 확인할 수 없습니다. 최신 정보를 불러와 현재 설정을 확인해 주세요.',
    }
  }
  return {
    needsRefresh: false,
    message: serverMessage || err?.message || '파일 변경에 실패했습니다.',
  }
}

// 이벤트 ID 가 바뀌면 파일·선택 상태를 모두 새로 시작한다.
export default function CsvDetailPage() {
  const { id } = useParams()
  return <CsvDatasetEditor key={id} eventId={id} />
}

function CsvDatasetEditor({ eventId }) {
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 저장 후보. 검증을 통과한 파일만 담는다.
  const [dataset, setDataset] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [isReading, setIsReading] = useState(false)
  // 연속으로 파일을 고르면 마지막 파일의 읽기 결과만 반영한다.
  const readRequestRef = useRef(0)

  // 첫 파일을 읽기 전에는 null 이다. 이후에는 사용자가 고른 값이 다음 파일의 기준이 된다.
  const [selection, setSelection] = useState(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const isSubmittingRef = useRef(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  useEffect(() => {
    let ignore = false

    fetchFileEventDetail(eventId)
      .then((nextEvent) => {
        if (!ignore) setEvent(nextEvent)
      })
      .catch((err) => {
        if (!ignore) setLoadError(err?.message || '이벤트 정보를 불러오지 못했습니다.')
      })

    return () => {
      ignore = true
    }
  }, [eventId])

  const searchValue = selection?.searchValue ?? EMPTY_SEARCH_VALUE
  const displayValue = selection?.displayValue ?? []
  const validSearch = searchValue.filter((value) => value !== '선택')
  const isSearchValid =
    validSearch.length >= 2 && validSearch.length <= 3 && new Set(validSearch).size === validSearch.length
  const canSubmit =
    dataset !== null && isSearchValid && !isReading && !isSubmitting && !isRefreshing

  const handleRetryLoad = async () => {
    setLoadError(null)
    try {
      setEvent(await fetchFileEventDetail(eventId))
    } catch (err) {
      setLoadError(err?.message || '이벤트 정보를 불러오지 못했습니다.')
    }
  }

  // 업로드한 파일과 선택값은 그대로 두고 현재 설정 요약만 갱신한다.
  const handleRefresh = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      setEvent(await fetchFileEventDetail(eventId))
      setSubmitError(null)
      toast.success('최신 정보를 불러왔습니다. 현재 설정을 확인한 뒤 다시 저장해 주세요.')
    } catch (err) {
      toast.error(err?.message || '최신 정보를 불러오지 못했습니다.', { duration: 2000 })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleFileSelect = async (file) => {
    const requestId = readRequestRef.current + 1
    readRequestRef.current = requestId

    // 이전 파일이 실수로 전송되지 않게 읽기 전에 저장 후보를 비운다.
    setDataset(null)
    setFileError(null)
    setIsReading(true)
    // 이전 파일에 대한 서버 오류는 지우고, 최신 정보 확인이 필요한 오류는 남긴다.
    setSubmitError((current) => (current?.needsRefresh ? current : null))

    try {
      let buffer
      try {
        buffer = await file.arrayBuffer()
      } catch {
        throw new Error('파일을 읽을 수 없습니다.')
      }
      const parsed = parseCsvDataset(buffer, file.name)
      if (readRequestRef.current !== requestId) return

      setDataset({ file, fileName: file.name, ...parsed })
      setSelection((current) => {
        const base = current
          ? {
              searchColumns: current.searchValue.filter((value) => value !== '선택'),
              displayColumns: current.displayValue,
            }
          : { searchColumns: event.searchColumns, displayColumns: event.displayColumns }
        const next = keepAvailableColumns(base, parsed.headers)
        return { searchValue: toSearchValue(next.searchColumns), displayValue: next.displayColumns }
      })
    } catch (err) {
      if (readRequestRef.current !== requestId) return
      setFileError(`${file.name}: ${err.message}`)
    } finally {
      if (readRequestRef.current === requestId) setIsReading(false)
    }
  }

  const handleSearchChange = (nextValue) => {
    setSelection((current) => ({ displayValue: [], ...current, searchValue: nextValue }))
  }

  const handleDisplayChange = (nextValue) => {
    setSelection((current) => ({ searchValue: EMPTY_SEARCH_VALUE, ...current, displayValue: nextValue }))
  }

  const handleCopyId = () => {
    navigator.clipboard
      .writeText(event.id)
      .then(() => {
        toast.success('ID가 복사되었습니다!')
      })
      .catch((err) => {
        toast.error('복사 실패', { duration: 2000 })
        console.error('복사 실패:', err)
      })
  }

  const handleSubmitClick = () => {
    if (canSubmit) setIsConfirmOpen(true)
  }

  const handleConfirmClose = () => setIsConfirmOpen(false)

  // 모달을 연 뒤 상태가 바뀌었을 수 있으므로 확인 시점에 제출 가능 여부를 다시 검사한다.
  const handleSubmit = async () => {
    if (isSubmittingRef.current) return
    if (!canSubmit) {
      setIsConfirmOpen(false)
      return
    }

    isSubmittingRef.current = true
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await replaceFileDataset({
        eventId: event.id,
        file: dataset.file,
        searchColumns: validSearch,
        displayColumns: displayValue.length ? displayValue : null,
      })

      toast.success('파일이 변경되었습니다!')
      navigate('/dashboard')
    } catch (err) {
      // 모달을 닫고 기존 오류 영역에 보여준다. 다시 시도하면 확인을 새로 받는다.
      setSubmitError(toSubmitError(err))
      setIsConfirmOpen(false)
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  const goDashboard = () => navigate('/dashboard')

  const renderStatus = ({ title, message, isLoading = false }) => (
    <div className='csvDetail-status' role={isLoading ? undefined : 'alert'}>
      {isLoading && (
        <LoadingSpinner className='csvDetail-status__spinner' size={48} cubeSize={16} color='#2d3b86' />
      )}
      <div className='csvDetail-status__title'>{title}</div>
      {message && <div className='csvDetail-status__message'>{message}</div>}
      {!isLoading && (
        <div className='csvDetail-status__actions'>
          <button type='button' className='csvDetail-secondaryButton' onClick={goDashboard}>
            대시보드로 돌아가기
          </button>
          <EventButton text='다시 시도' onClick={handleRetryLoad} />
        </div>
      )}
    </div>
  )

  const blockedReason = event ? getBlockedReason(event) : null

  let content
  if (loadError) {
    content = renderStatus({ title: '이벤트 정보를 불러오지 못했습니다', message: loadError })
  } else if (!event) {
    content = renderStatus({ title: '이벤트 정보를 불러오는 중입니다', isLoading: true })
  } else if (blockedReason) {
    content = renderStatus({ title: '파일을 변경할 수 없는 이벤트입니다', message: blockedReason })
  } else {
    const submitHint =
      dataset && !isSearchValid ? '조회에 사용할 정보를 2개 이상 선택해주세요.' : null

    content = (
      <>
        {/* ================= Current Settings ================= */}
        <div className='csvDetail-summary'>
          <div className='csvDetail-summary__title'>현재 설정</div>
          <dl className='csvDetail-summary__list'>
            <div className='csvDetail-summary__row'>
              <dt className='csvDetail-summary__label'>이벤트 이름</dt>
              <dd className='csvDetail-summary__value'>{event.eventTitle}</dd>
            </div>
            <div className='csvDetail-summary__row'>
              <dt className='csvDetail-summary__label'>이벤트 ID</dt>
              <dd className='csvDetail-summary__value csvDetail-summary__value--id'>
                <span>{event.id}</span>
                <button
                  type='button'
                  className='csvDetail-summary__copy'
                  onClick={handleCopyId}
                  aria-label='이벤트 ID 복사'
                >
                  <Icon name='detail-copy' height={14} />
                </button>
              </dd>
            </div>
            <div className='csvDetail-summary__row'>
              <dt className='csvDetail-summary__label'>현재 명단</dt>
              <dd className='csvDetail-summary__value'>{`${event.count ?? 0}개 행`}</dd>
            </div>
            <div className='csvDetail-summary__row'>
              <dt className='csvDetail-summary__label'>조회에 사용할 정보</dt>
              <dd className='csvDetail-summary__value csvDetail-summary__chips'>
                {event.searchColumns.map((column) => (
                  <span key={column} className='csvDetail-summary__chip'>
                    {column}
                  </span>
                ))}
              </dd>
            </div>
            <div className='csvDetail-summary__row'>
              <dt className='csvDetail-summary__label'>조회 결과에 표시할 정보</dt>
              <dd className='csvDetail-summary__value csvDetail-summary__chips'>
                {event.displayColumns.length > 0 ? (
                  event.displayColumns.map((column) => (
                    <span
                      key={column}
                      className='csvDetail-summary__chip csvDetail-summary__chip--display'
                    >
                      {column}
                    </span>
                  ))
                ) : (
                  <span className='csvDetail-summary__none'>없음</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* ================= File Upload ================= */}
        <CsvFileUpload
          inputId='csvDetailFileInput'
          fileName={dataset?.fileName ?? ''}
          isReading={isReading}
          error={fileError}
          disabled={isSubmitting}
          onFileSelect={handleFileSelect}
        />

        {/* ================= Form Fields ================= */}
        <CsvColumnSelect
          columns={dataset?.headers ?? []}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          displayValue={displayValue}
          onDisplayChange={handleDisplayChange}
          disabled={isSubmitting}
        />

        {/* ================= CSV Preview ================= */}
        <CsvPreview
          fileName={dataset?.fileName ?? ''}
          rowCount={dataset?.rowCount ?? 0}
          columns={dataset?.headers ?? []}
          previewRows={dataset?.previewRows ?? []}
          showDescription={false}
        />

        {/* ================= Submit ================= */}
        <div className='csvDetail-submit'>

          {submitError && (
            <div className='csvDetail-alert' role='alert'>
              <div className='csvDetail-alert__message'>{submitError.message}</div>
              {submitError.needsRefresh && (
                <button
                  type='button'
                  className='csvDetail-alert__refresh'
                  onClick={handleRefresh}
                  disabled={isRefreshing || isSubmitting}
                >
                  {isRefreshing ? '불러오는 중...' : '최신 정보 불러오기'}
                </button>
              )}
            </div>
          )}

          <div className='csvDetail-actions'>
            {submitHint && <div className='csvDetail-actions__hint'>{submitHint}</div>}
            <div className='csvDetail-actions__buttons'>
              <button
                type='button'
                className='csvDetail-secondaryButton'
                onClick={goDashboard}
                disabled={isSubmitting}
              >
                취소
              </button>
              <EventButton
                text={isSubmitting ? '변경 중...' : '파일 변경'}
                onClick={handleSubmitClick}
                disabled={!canSubmit}
              />
            </div>
          </div>
        </div>

        <ConfirmModal
          isOpen={isConfirmOpen}
          title='파일을 변경할까요?'
          description={
            <>
              ‘<strong>{dataset?.fileName}</strong>’으로 기존 명단 전체가 교체됩니다. 이벤트 ID와
              조회 링크는 유지됩니다.
            </>
          }
          confirmText='변경'
          onConfirm={handleSubmit}
          onClose={handleConfirmClose}
          isProcessing={isSubmitting}
          processingText='변경 중...'
        />
      </>
    )
  }

  // 제출은 확인 모달에서만 시작되고, 진행 상태도 모달이 보여준다.
  return (
    <div className='csvDetail'>
      <div className='csvDetail-container'>
        {/* ================= Header ================= */}
        <div className='csvDetail-header'>
          <div className='csvDetail-title'>파일 변경 - FILE</div>
        </div>

        {content}
      </div>
    </div>
  )
}
