import './CsvFileUpload.css'
import { Icon } from '../icon/Icon'

// CSV 생성·파일 변경 화면이 함께 쓰는 데이터 파일 업로드 섹션. 파일 읽기와 검증은 각 페이지가 맡는다.
// allowDrop: 화면 전체 끌어다 놓기를 지원하는 페이지(생성 화면)만 true 로 넘겨 안내 문구에 드래그를 넣는다.
export default function CsvFileUpload({
  inputId,
  fileName = '',
  isReading = false,
  error = null,
  disabled = false,
  allowDrop = false,
  onFileSelect,
}) {
  const hasFile = fileName !== ''
  // 다른 파일을 읽는 동안에는 이전 파일 대신 읽는 중 안내를 보여준다.
  const showFile = hasFile && !isReading

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    // 같은 파일을 고쳐 다시 골라도 change 이벤트가 발생하도록 값을 비운다.
    e.target.value = ''
    if (file) onFileSelect(file)
  }

  const uploadClassName = [
    'csvFileUpload__upload',
    showFile && 'csvFileUpload__upload--selected',
    error && !showFile && 'csvFileUpload__upload--error',
    disabled && 'csvFileUpload__upload--disabled',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className='csvFileUpload'>
      <div className='csvFileUpload__header'>
        <div className='csvFileUpload__title'>
          <div className='csvFileUpload__title--title'>데이터 파일</div>
          {!hasFile && !isReading && (
            <div className='csvFileUpload__title--step'>먼저 파일을 첨부해주세요</div>
          )}
        </div>

        {/*<div className='csvFileUpload__info'>CSV, TSV만 업로드 가능합니다.</div>*/}

        {/* 상태가 바뀌어도 input 이 다시 만들어지지 않도록 label 과 input 은 하나만 둔다. */}
        <label htmlFor={inputId} className={uploadClassName}>
          <input
            id={inputId}
            className='csvFileUpload__uploadInput'
            type='file'
            accept='.csv,.tsv'
            onChange={handleFileChange}
            disabled={disabled}
          />
          {showFile ? (
            <>
              <span className='csvFileUpload__fileIcon' aria-hidden='true'>
                <Icon name='button-file-sheet' width={20} height={20} />
              </span>
              <span className='csvFileUpload__fileCopy'>
                <span className='csvFileUpload__fileName' title={fileName} aria-live='polite'>
                  {fileName}
                </span>
                <span className='csvFileUpload__fileStatus'>파일을 읽었어요</span>
              </span>
              <span className='csvFileUpload__fileAction'>
                <span className='csvFileUpload__text--desktop'>파일 변경</span>
                <span className='csvFileUpload__text--mobile'>변경</span>
              </span>
            </>
          ) : (
            <>
              <span className='csvFileUpload__uploadIcon' aria-hidden='true'>
                <Icon name='button-upload' width={22} height={22} />
              </span>
              <span className='csvFileUpload__uploadTitle'>
                {isReading ? (
                  '파일을 읽는 중입니다'
                ) : allowDrop ? (
                  <>
                    {/* 터치 화면에는 끌어다 놓기가 없으므로 모바일에서는 누르기만 안내한다. */}
                    <span className='csvFileUpload__text--desktop'>
                      파일을 끌어다 놓거나 눌러서 선택하세요
                    </span>
                    <span className='csvFileUpload__text--mobile'>눌러서 파일을 선택하세요</span>
                  </>
                ) : (
                  '눌러서 파일을 선택하세요'
                )}
              </span>
              <span className='csvFileUpload__uploadCaption'>
                {isReading ? '잠시만 기다려 주세요.' : 'CSV, TSV'}
              </span>
            </>
          )}
        </label>

        {error && (
          <div className='csvFileUpload__error' role='alert'>
            <span className='csvFileUpload__errorIcon' aria-hidden='true'>
              <Icon name='button-alert' width={14} height={14} />
            </span>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
