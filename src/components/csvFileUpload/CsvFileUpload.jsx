import './CsvFileUpload.css'
import { Icon } from '../icon/Icon'

// CSV 생성·파일 변경 화면이 함께 쓰는 데이터 파일 업로드 섹션. 파일 읽기와 검증은 각 페이지가 맡는다.
export default function CsvFileUpload({
  inputId,
  fileName = '',
  isReading = false,
  error = null,
  disabled = false,
  onFileSelect,
}) {
  const hasFile = fileName !== ''

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    // 같은 파일을 고쳐 다시 골라도 change 이벤트가 발생하도록 값을 비운다.
    e.target.value = ''
    if (file) onFileSelect(file)
  }

  const uploadTitle = isReading
    ? '파일을 읽는 중입니다'
    : hasFile
      ? '파일이 선택되었습니다'
      : 'CSV 또는 TSV 파일 선택'
  const uploadDescription = isReading
    ? '잠시만 기다려 주세요.'
    : hasFile
      ? '다른 파일은 이곳을 눌러주세요.'
      : '이곳을 눌러 파일을 업로드하세요.'

  return (
    <div className={`csvFileUpload ${hasFile ? '' : 'csvFileUpload--required'}`}>
      <div className='csvFileUpload__header'>
        <div className='csvFileUpload__title'>
          <div className='csvFileUpload__title--title'>데이터 파일</div>
          {!hasFile && !isReading && (
            <div className='csvFileUpload__title--step'>먼저 파일을 첨부해주세요</div>
          )}
        </div>

        {/*<div className='csvFileUpload__info'>CSV, TSV만 업로드 가능합니다.</div>*/}

        <label
          htmlFor={inputId}
          className={`csvFileUpload__upload ${hasFile ? 'csvFileUpload__upload--selected' : ''} ${
            disabled ? 'csvFileUpload__upload--disabled' : ''
          }`}
        >
          <input
            id={inputId}
            className='csvFileUpload__uploadInput'
            type='file'
            accept='.csv,.tsv'
            onChange={handleFileChange}
            disabled={disabled}
          />
          <span className='csvFileUpload__uploadIcon' aria-hidden='true'>
            <Icon name='button-file' width={34} height={38} />
          </span>
          <span className='csvFileUpload__uploadCopy'>
            <span className='csvFileUpload__uploadTitle'>{uploadTitle}</span>
            <span className='csvFileUpload__uploadDescription'>{uploadDescription}</span>
            {hasFile && (
              <span className='csvFileUpload__uploadFileName' title={fileName} aria-live='polite'>
                {fileName}
              </span>
            )}
          </span>
          {/*<span className='csvFileUpload__uploadAction'>*/}
          {/*  {hasFile ? '파일 변경' : '파일 선택'}*/}
          {/*</span>*/}
        </label>

        {error && (
          <div className='csvFileUpload__error' role='alert'>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
