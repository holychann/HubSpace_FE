import './CsvCreatePage.css'
import { lazy, Suspense, useEffect, useEffectEvent, useRef, useState } from 'react'
import EventInput from '../../../components/eventInput/EventInput'
import EventButton from '../../../components/eventButton/EventButton'
import CsvFileUpload from '../../../components/csvFileUpload/CsvFileUpload'
import CsvColumnSelect from '../../../components/csvColumnSelect/CsvColumnSelect'
import CsvPreview from '../../../components/csvPreview/CsvPreview'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { createFileEvent } from '../apis/createFileEvent'
import CreateNotice from '../../../components/createNotice/CreateNotice'
import EventCreateConfirmModal from '../../../components/eventCreateConfirmModal/EventCreateConfirmModal'

const FileCreateGuide = lazy(() => import('../component/FileCreateGuide'))

const FILE_NOTICES = [
  {
    title: '값에 쉼표가 포함된 경우 TSV로 업로드해주세요',
    description: '데이터 값에 쉼표(,)가 있다면 탭으로 구분된 TSV 파일을 사용해주세요.',
  },
  {
    title: '선택한 항목만 서버에 저장돼요',
    description:
      '조회에 사용할 항목과 결과에 표시할 항목만 저장됩니다. 선택하지 않은 항목은 저장되지 않습니다.',
  },
  {
    title: '생성 후에도 파일을 바꿀 수 있어요',
    description: '이벤트를 만든 뒤 새로운 파일로 교체할 수 있습니다.',
  },
]

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

// 확장자는 대소문자를 구분하지 않는다. 구분자 판별도 같은 기준을 쓴다.
const isSupportedFileName = (name) => /\.(csv|tsv)$/i.test(name)
const isTsvFileName = (name) => name.toLowerCase().endsWith('.tsv')

// 텍스트·링크 드래그는 types 에 'Files' 가 없다.
const isFileDrag = (e) => Array.from(e.dataTransfer?.types ?? []).includes('Files')

export default function CsvCreatePage() {
  const [eventTitle, setEventTitle] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [columns, setColumns] = useState([])
  const [previewRows, setPreviewRows] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  // 연속으로 파일을 첨부하면 마지막 파일의 읽기 결과만 반영한다.
  const readRequestRef = useRef(0)

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
     클릭 선택과 드롭이 함께 쓴다. 실패하면 기존 첨부 파일과 선택값을 그대로 둔다.
  ========================= */
  const parseHeaderFromFile = async (file) => {
    if (isSubmitting) return

    if (!isSupportedFileName(file.name)) {
      toast.error('CSV 또는 TSV 파일만 첨부할 수 있습니다.')
      return
    }

    const requestId = readRequestRef.current + 1
    readRequestRef.current = requestId
    setIsReading(true)

    try {
      let text
      try {
        text = await file.text()
      } catch {
        if (readRequestRef.current === requestId) toast.error('파일을 읽을 수 없습니다.')
        return
      }
      if (readRequestRef.current !== requestId) return

      const delimiter = isTsvFileName(file.name) ? '\t' : ','
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
    } finally {
      if (readRequestRef.current === requestId) setIsReading(false)
    }
  }

  /* =========================
     화면 전체 드래그 업로드
  ========================= */
  // 드롭은 서버에 보내지 않고 첨부만 한다. 폴더와 여러 파일은 받지 않는다.
  // 최종 확인 화면이 열려 있는 동안에도 받지 않는다. 확인 중인 파일이 뒤에서 바뀌지 않게 하기 위해서다.
  const handleWindowDrop = useEffectEvent((dataTransfer) => {
    if (isSubmitting || isConfirmOpen) return

    const { files, items } = dataTransfer
    if (files.length === 0) return

    if (files.length > 1) {
      toast.error('파일은 한 번에 하나만 첨부해주세요.')
      return
    }

    if (items?.[0]?.webkitGetAsEntry?.()?.isDirectory) {
      toast.error('폴더는 첨부할 수 없습니다. CSV 또는 TSV 파일을 놓아주세요.')
      return
    }

    parseHeaderFromFile(files[0])
  })

  const isDropBlocked = useEffectEvent(() => isSubmitting || isConfirmOpen)

  useEffect(() => {
    // 하위 요소 사이를 이동할 때마다 enter/leave 가 쌍으로 발생하므로 깊이를 세어 오버레이 깜빡임을 막는다.
    let dragDepth = 0

    const resetDrag = () => {
      dragDepth = 0
      setIsDragging(false)
    }

    const handleDragEnter = (e) => {
      if (!isFileDrag(e)) return
      e.preventDefault()
      dragDepth += 1
      if (!isDropBlocked()) setIsDragging(true)
    }

    const handleDragOver = (e) => {
      if (!isFileDrag(e)) return
      // 기본 동작(브라우저가 파일을 여는 것)을 막아야 drop 이 발생한다.
      e.preventDefault()
      e.dataTransfer.dropEffect = isDropBlocked() ? 'none' : 'copy'
    }

    const handleDragLeave = (e) => {
      if (!isFileDrag(e)) return
      dragDepth = Math.max(0, dragDepth - 1)
      if (dragDepth === 0) setIsDragging(false)
    }

    const handleDrop = (e) => {
      if (!isFileDrag(e)) return
      e.preventDefault()
      resetDrag()
      handleWindowDrop(e.dataTransfer)
    }

    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('drop', handleDrop)
    }
  }, [])

  // 입력값을 검사한 뒤 최종 확인 화면을 띄운다. 생성 요청은 확인 화면의 '이벤트 생성'에서 시작한다.
  const handleOpenConfirm = () => {
    if (isSubmitting || isReading) return

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

    setIsConfirmOpen(true)
  }

  // 실패하면 확인 화면을 열어둔 채 입력값을 유지해 바로 다시 시도할 수 있게 한다.
  const handleCreateCsv = async () => {
    if (isSubmitting) return

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
      {isDragging && (
        <div className='csvCreate-dropOverlay' aria-hidden='true'>
          <span className='csvCreate-dropOverlay__plus' />
        </div>
      )}
      <div className='csvCreate-container'>
        {/* ================= Header ================= */}
        <div className='csvCreate-header'>
          <div className='csvCreate-title'>새 이벤트 생성 - FILE</div>
        </div>

        <section className='csvCreate-preview' aria-label='파일 이벤트 생성 안내'>
          <Suspense fallback={<div className='csvCreate-guide' />}>
            <FileCreateGuide />
          </Suspense>
        </section>

        <div className='csvCreate-notice'>
          <CreateNotice title='확인해주세요' items={FILE_NOTICES} />
        </div>

        <h2 className='csvCreate-inputDivider'>File Info</h2>

        {/* ================= Event Name ================= */}
        <div className='csvCreate-name'>
          <EventInput value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
        </div>

        {/* ================= File Upload ================= */}
        <CsvFileUpload
          inputId='csvCreateFileInput'
          fileName={uploadedFileName}
          isReading={isReading}
          disabled={isSubmitting}
          allowDrop
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
          <EventButton
            variant='navy'
            text='입력 완료'
            onClick={handleOpenConfirm}
            disabled={isReading || isSubmitting}
          />
        </div>
      </div>

      <EventCreateConfirmModal
        isOpen={isConfirmOpen}
        method='file'
        rows={[
          { label: '이벤트 관리명', value: trimmedTitle },
          { label: '첨부 파일', value: uploadedFileName },
          { label: '데이터 수', value: `${rowCount.toLocaleString('ko-KR')}개` },
          { label: '조회 항목', value: validFields.join(', ') },
          {
            label: '결과 표시 항목',
            value: selectedColumns.length ? selectedColumns.join(', ') : '선택 안 함',
          },
        ]}
        notice={{
          main: '선택한 항목만 서버에 저장됩니다.\n선택하지 않은 항목은 저장되지 않습니다.',
          sub: '값에 쉼표가 있다면 TSV 파일을 사용해주세요.\n생성 후에도 새 파일로 교체할 수 있습니다.',
        }}
        isProcessing={isSubmitting}
        onConfirm={handleCreateCsv}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  )
}
