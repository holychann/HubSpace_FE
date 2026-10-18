import './CsvCreatePage.css'
import { useState } from 'react'
import EventInput from '../../../components/eventInput/EventInput'
import EventButton from '../../../components/eventButton/EventButton'
import CsvFileUpload from '../../../components/csvFileUpload/CsvFileUpload'
import CsvColumnSelect from '../../../components/csvColumnSelect/CsvColumnSelect'
import CsvPreview from '../../../components/csvPreview/CsvPreview'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { createFileEvent } from '../apis/createFileEvent'
import LoadingSpinner from '../../../components/loadingSpinner/LoadingSpinner'

const parseDelimitedText = (text, delimiter) => {
  const rows = []
  let currentRow = []
  let currentCell = ''
  let inQuotes = false

  const pushCell = () => {
    currentRow.push(currentCell.trim())
    currentCell = ''
  }

  const pushRow = () => {
    if (currentRow.length === 1 && currentRow[0] === '') {
      currentRow = []
      return
    }

    rows.push(currentRow)
    currentRow = []
  }

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const nextChar = text[index + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === delimiter && !inQuotes) {
      pushCell()
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1
      }

      pushCell()
      pushRow()
      continue
    }

    currentCell += char
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    pushCell()
    pushRow()
  }

  return rows.filter((row) => row.some((cell) => cell !== ''))
}

export default function CsvCreatePage() {
  const [eventTitle, setEventTitle] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [columns, setColumns] = useState([])
  const [previewRows, setPreviewRows] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 폼 생성 필드 (3개)
  const [selectedFields, setSelectedFields] = useState(['선택', '선택', '선택'])

  // 조회 표시 필드
  const [selectedColumns, setSelectedColumns] = useState([])

  const navigate = useNavigate()
  const trimmedTitle = eventTitle.trim()

  // 실제 선택된 필드만
  const validFields = selectedFields.filter((v) => v !== '선택')

  /* =========================
     CSV / TSV 파싱 (헤더 + 상위 5행)
  ========================= */
  const parseHeaderFromFile = (file) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const text = e.target.result
      const delimiter = file.name.endsWith('.tsv') ? '\t' : ','
      const parsedRows = parseDelimitedText(text, delimiter)

      if (parsedRows.length < 2) {
        toast.error('CSV 데이터가 충분하지 않습니다.')
        return
      }

      const headers = parsedRows[0].filter((header) => header !== '')

      if (!headers.length) {
        toast.error('CSV 헤더를 읽을 수 없습니다.')
        return
      }

      const dataRows = parsedRows
        .slice(1)
        .filter((row) => row.some((cell) => cell !== ''))
        .map((row) => headers.map((_, index) => row[index] ?? ''))

      setColumns(headers)
      setPreviewRows(dataRows.slice(0, 5))
      setRowCount(dataRows.length)
      setUploadedFile(file)
      setUploadedFileName(file.name)
      setSelectedFields(['선택', '선택', '선택'])
      setSelectedColumns([])
    }

    reader.readAsText(file, 'utf-8')
  }

  const handleCreateCsv = async () => {
    if (isSubmitting) return

    if (!trimmedTitle) {
      toast.error('이벤트 이름을 입력해주세요.', { duration: 2000 })
      return
    }

    if (
      validFields.length < 2 ||
      validFields.length > 3 ||
      new Set(validFields).size !== validFields.length
    ) {
      toast.error('조회에 사용할 정보를 2개 이상, 중복 없이 선택해주세요.', {
        duration: 2000,
      })
      return
    }

    try {
      setIsSubmitting(true)

      await createFileEvent({
        file: uploadedFile,
        eventTitle: trimmedTitle,
        count: rowCount,
        searchColumns: validFields,
        displayColumns: selectedColumns.length ? selectedColumns : null,
      })

      toast.success('CSV 이벤트가 생성되었습니다!')
      navigate('/dashboard')
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || 'CSV 이벤트 생성에 실패했습니다.'
      toast.error(message, { duration: 2000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='csvCreate'>
      {isSubmitting && (
        <div className='csvCreate-loadingOverlay'>
          <LoadingSpinner
            className='csvCreate-loadingSpinner'
            size={48}
            cubeSize={16}
            color='#2d3b86'
          />
          <div className='csvCreate-loadingText'>CSV 생성 중...</div>
        </div>
      )}
      <div className='csvCreate-container'>
        {/* ================= Header ================= */}
        <div className='csvCreate-header'>
          <div className='csvCreate-title'>새 이벤트 생성 - FILE</div>
        </div>

        {/* ================= Event Name ================= */}
        <div className='csvCreate-name'>
          <EventInput value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
        </div>

        {/* ================= File Upload ================= */}
        <CsvFileUpload
          inputId='csvCreateFileInput'
          fileName={uploadedFileName}
          onFileSelect={parseHeaderFromFile}
        />

        {/* ================= Form Fields ================= */}
        <CsvColumnSelect
          columns={columns}
          searchValue={selectedFields}
          onSearchChange={setSelectedFields}
          displayValue={selectedColumns}
          onDisplayChange={setSelectedColumns}
        />

        {/* ================= CSV Preview ================= */}
        <CsvPreview
          fileName={uploadedFileName}
          rowCount={rowCount}
          columns={columns}
          previewRows={previewRows}
        />

        <div className='csvCreate-action'>
          <EventButton text={isSubmitting ? '생성 중...' : '이벤트 생성'} onClick={handleCreateCsv} />
        </div>
      </div>
    </div>
  )
}
