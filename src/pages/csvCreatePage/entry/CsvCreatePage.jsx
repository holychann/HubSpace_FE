import './CsvCreatePage.css'
import { useState } from 'react'
import EventInput from '../../../components/eventInput/EventInput'
import EventDropdown from '../../../components/eventDropdown/EventDropdown'
import EventButton from '../../../components/eventButton/EventButton'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/icon/Icon'

export default function CsvCreatePage() {
  const [columns, setColumns] = useState([])
  const [previewRows, setPreviewRows] = useState([])
  const [uploadedFileName, setUploadedFileName] = useState('')

  // 폼 생성 필드 (3개)
  const [selectedFields, setSelectedFields] = useState(['선택', '선택', '선택'])

  // 조회 표시 필드
  const [isOpen, setIsOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState('표시 안 함')

  const navigate = useNavigate()

  // 실제 선택된 필드만
  const validFields = selectedFields.filter((v) => v !== '선택')

  const isValid =
    validFields.length >= 2 &&
    validFields.length <= 3 &&
    new Set(validFields).size === validFields.length

  /* =========================
     CSV / TSV 파싱 (헤더 + 상위 5행)
  ========================= */
  const parseHeaderFromFile = (file) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split(/\r?\n/).filter(Boolean)
      const delimiter = file.name.endsWith('.tsv') ? '\t' : ','

      if (lines.length < 2) {
        toast.error('CSV 데이터가 충분하지 않습니다.')
        return
      }

      // 헤더
      const headers = lines[0]
        .split(delimiter)
        .map((h) => h.trim())
        .filter(Boolean)

      if (!headers.length) {
        toast.error('CSV 헤더를 읽을 수 없습니다.')
        return
      }

      // 상위 5행 데이터
      const rows = lines.slice(1, 6).map((line) => line.split(delimiter).map((v) => v.trim()))

      setColumns(headers)
      setPreviewRows(rows)
      setUploadedFileName(file.name)
      setSelectedFields(['선택', '선택', '선택'])
      setSelectedColumn('표시 안 함')
      setIsOpen(false)
    }

    reader.readAsText(file, 'utf-8')
  }

  /* =========================
     조회 필드 토글
  ========================= */
  const toggleDropdown = () => {
    if (!columns.length) return
    setIsOpen((prev) => !prev)
  }

  const handleSelect = (value) => {
    setSelectedColumn(value)
    setIsOpen(false)
  }

  const handleCreateCsv = () => {
    if (!columns.length) {
      toast.error('CSV 파일을 먼저 업로드해주세요.')
      return
    }

    if (isValid) {
      toast.success('CSV 이벤트가 생성되었습니다!')
      navigate('/dashboard')
    } else {
      toast.error('필드를 2개 이상, 중복 없이 선택해주세요.', {
        autoClose: 2000,
      })
    }
  }

  return (
    <div className='csvCreate'>
      <div className='csvCreate-container'>
        {/* ================= Header ================= */}
        <div className='csvCreate-header'>
          <div className='csvCreate-title'>새 이벤트 생성하기 - CSV</div>
          <div className='csvCreate-info'>이벤트 정보를 입력하고 조회 시스템을 생성하세요</div>
        </div>

        {/* ================= Event Name ================= */}
        <div className='csvCreate-name'>
          <EventInput />
        </div>

        {/* ================= File Upload ================= */}
        <div className='csvCreate-file'>
          <div className='csvCreate-file__header'>
            <div className='csvCreate-file__title'>
              <div className='csvCreate-file__title--title'>데이터 파일</div>
              <div className='csvCreate-file__title--notice'>2개 이상 선택 필수</div>
              <Icon name='detail-copy' height={14} className='csvCreate-file__title--copy' />
            </div>

            <div className='csvCreate-file__info'>CSV, TSV만 업로드 가능합니다.</div>

            <div className='csvCreate-file__upload'>
              <input
                id='csvCreateFileInput'
                className='csvCreate-file__uploadInput'
                type='file'
                accept='.csv,.tsv'
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  parseHeaderFromFile(file)
                }}
              />
              <label htmlFor='csvCreateFileInput' className='csvCreate-file__uploadButton'>
                파일 첨부
              </label>
              <div className='csvCreate-file__uploadName'>
                {uploadedFileName || '선택된 파일 없음'}
              </div>
            </div>
          </div>
        </div>

        {/* ================= Form Fields ================= */}
        <div className='csvCreate-field'>
          <div className='csvCreate-field__header'>
            <div className='csvCreate-field__title'>
              <div className='csvCreate-field__title--title'>폼 생성 필드</div>
              <div className='csvCreate-field__title--notice'>2개 이상 선택 필수</div>
            </div>

            <div className='csvCreate-field__info'>
              신청자가 조회 시 입력할 정보 필드를 설정하세요.
            </div>

            <div className='csvCreate-field__info--notice'>
              생성 완료 후, 정보 1, 정보 2, 정보 3은 수정이 불가합니다.
            </div>

            <div className='csvCreate-field__field'>
              <EventDropdown
                columns={columns.length ? columns : ['선택']}
                value={selectedFields}
                onChange={setSelectedFields}
                disabled={!columns.length}
              />
            </div>
          </div>

          {/* ================= Display Field ================= */}
          <div className='csvCreate-display'>
            <div className='csvCreate-display__header'>
              <div className='csvCreate-field__title'>
                <div className='csvCreate-field__title--title'>조회 확인 정보</div>
                <div className='csvCreate-field__title--notice'>(선택사항)</div>
              </div>

              <div className='csvCreate-field__info'>
                신청자가 조회 시 확인 가능한 정보를 설정하세요.
              </div>
            </div>

            <div className='csvCreate-display__field'>
              <div className='csvCreate-display__input'>
                <div className='csvCreate-display__label'>필드</div>

                <div
                  className={`csvCreate-display__toggle ${!columns.length ? 'disabled' : ''}`}
                  onClick={toggleDropdown}
                >
                  <div className='csvCreate-display__title'>
                    {columns.length ? selectedColumn : '선택'}
                  </div>
                  <Icon
                    name='detail-field'
                    height={4}
                    className={`csvCreate-display__arrow ${isOpen ? 'open' : ''}`}
                  />
                </div>

                {isOpen && (
                  <div className='csvCreate-display__content'>
                    {columns.map((col) => (
                      <div
                        key={col}
                        className={`csvCreate-display__item ${
                          selectedColumn === col ? 'selected' : ''
                        }`}
                        onClick={() => handleSelect(col)}
                      >
                        {col}
                      </div>
                    ))}

                    <div
                      className={`csvCreate-display__item ${
                        selectedColumn === '표시 안 함' ? 'selected' : ''
                      }`}
                      onClick={() => handleSelect('표시 안 함')}
                    >
                      표시 안 함
                    </div>
                  </div>
                )}
              </div>
              <div className='csvCreate-display__condition'>
                <div className='csvCreate-display__condition--title'>조회 결과 표시 방식</div>
                <div className='csvCreate-display__condition--info'>
                  <p>
                    ㅁ 필드를 선택하지 않은 경우, "일치하는 정보가 정상적으로 조회되었습니다."
                    문구만 표시됩니다."
                  </p>
                  <p>
                    ㅁ 필드를 선택한 경우, 위 문구와 함께 '칼럼명 : 데이터' 형식의 정보가 함께
                    표시됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ================= CSV Preview ================= */}
        <div className='csvCreate-preview'>
          <div className='csvCreate-preview__title'>첨부 파일 보기</div>
          <div className='csvCreate-preview__content'>첨부한 파일의 상위 5행을 볼 수 있습니다.</div>

          {columns.length > 0 && (
            <div className='csvCreate-preview__table'>
              <table>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, idx) => (
                    <tr key={idx}>
                      {columns.map((_, i) => (
                        <td key={i}>{row[i] ?? '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <EventButton text='이벤트 생성' onClick={handleCreateCsv} />
      </div>
    </div>
  )
}
