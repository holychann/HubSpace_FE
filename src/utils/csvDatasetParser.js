// FILE 명단 교체용 CSV/TSV 파서. 백엔드 FileDatasetParser 와 같은 규칙으로 파일 전체를 검증한다.
// 생성 화면의 파서와 달리 문제가 있는 파일은 미리보기 없이 거부하며, 오류 메시지도 백엔드와 같게 맞춘다.
// 셀은 숫자로 바꾸지 않으므로 학번 등의 앞자리 0이 유지된다.

export const PREVIEW_ROW_LIMIT = 5

const EOF = null
const QUOTE = '"'

// Java String#trim 과 같게 U+0020 이하 문자만 앞뒤에서 지운다. 전각 공백(U+3000)은 지우지 않는다.
const javaTrim = (value) => {
  let start = 0
  let end = value.length
  while (start < end && value.charCodeAt(start) <= 0x20) start += 1
  while (end > start && value.charCodeAt(end - 1) <= 0x20) end -= 1
  return value.slice(start, end)
}

// Java Character#isWhitespace 와 같다. 줄바꿈 없는 공백(U+00A0, U+2007, U+202F)은 공백이 아니다.
const JAVA_WHITESPACE_CONTROLS = new Set([0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x1c, 0x1d, 0x1e, 0x1f])
const NON_BREAKING_SPACES = new Set([0x00a0, 0x2007, 0x202f])

const isJavaWhitespace = (char) => {
  const code = char.charCodeAt(0)
  if (JAVA_WHITESPACE_CONTROLS.has(code)) return true
  if (NON_BREAKING_SPACES.has(code)) return false
  // 공백 구분자(Zs), 줄 구분자(Zl), 문단 구분자(Zp)
  return /[\p{Zs}\p{Zl}\p{Zp}]/u.test(char)
}

const isBlankCell = (cell) => [...cell].every(isJavaWhitespace)

const isBlankRow = (cells) => cells.every(isBlankCell)

const cleanHeader = (header) => javaTrim(header.replaceAll('\uFEFF', ''))

// RFC 4180 레코드 리더 (백엔드 FileDatasetParser.RecordReader 와 같은 순서로 판단한다)
// - 따옴표는 값의 맨 앞에서만 열 수 있고, 값 안의 따옴표는 "" 로 쓴다.
// - 닫는 따옴표 뒤에는 구분자나 줄 끝만 올 수 있다.
// - 줄 끝은 \n 또는 \r\n 이다. 따옴표 안의 \r\n 은 \n 으로 읽는다.
const createRecordReader = (text, separator) => {
  let position = 0
  let recordNumber = 0

  const read = () => (position < text.length ? text[position++] : EOF)
  const unread = (char) => {
    if (char !== EOF) position -= 1
  }
  const peekIs = (expected) => {
    const next = read()
    if (next === expected) return true
    unread(next)
    return false
  }
  const syntax = (reason) => new Error(`${recordNumber}행: CSV 형식이 올바르지 않습니다. ${reason}`)

  const next = () => {
    let char = read()
    if (char === EOF) return null
    recordNumber += 1

    const fields = []
    let value = ''
    let valueStart = true
    let inQuotes = false
    let afterClosingQuote = false

    while (true) {
      if (inQuotes) {
        if (char === EOF) {
          throw syntax('따옴표(")로 시작한 값이 닫히지 않았습니다.')
        }
        if (char === QUOTE) {
          const following = read()
          if (following === QUOTE) {
            value += QUOTE
          } else {
            unread(following)
            inQuotes = false
            afterClosingQuote = true
          }
        } else if (char === '\r' && peekIs('\n')) {
          value += '\n'
        } else {
          value += char
        }
      } else if (char === separator) {
        fields.push(value)
        value = ''
        valueStart = true
        afterClosingQuote = false
      } else if (char === EOF || char === '\n' || (char === '\r' && peekIs('\n'))) {
        fields.push(value)
        return fields
      } else if (afterClosingQuote) {
        throw syntax('닫는 따옴표 뒤에 다른 문자가 있습니다. 값 안의 따옴표는 "" 로 적어 주세요.')
      } else if (char === QUOTE) {
        if (!valueStart) {
          throw syntax(
            '값 중간에 따옴표(")가 있습니다. 값 전체를 따옴표로 감싸고 안의 따옴표는 "" 로 적어 주세요.',
          )
        }
        inQuotes = true
        valueStart = false
      } else {
        value += char
        valueStart = false
      }
      char = read()
    }
  }

  return { next, recordNumber: () => recordNumber }
}

const decodeUtf8 = (buffer) => {
  try {
    // fatal: 잘못된 바이트를 대체 문자로 바꾸지 않고 거부한다. 맨 앞 BOM 은 디코더가 지운다.
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    throw new Error('UTF-8 로 저장된 파일만 올릴 수 있습니다. 파일을 UTF-8 CSV 로 다시 저장해 주세요.')
  }
}

/**
 * 파일 내용 전체를 검증하고 헤더, 데이터 행 수, 상위 미리보기 행을 돌려준다.
 * 문제가 있으면 백엔드와 같은 문구의 Error 를 던진다. 행 번호는 헤더를 1행으로 센다.
 * @param {ArrayBuffer | Uint8Array} buffer 파일 바이트
 * @param {string} fileName 확장자가 .tsv 이면 탭, 그 외에는 쉼표로 구분한다
 */
export const parseCsvDataset = (buffer, fileName) => {
  if (buffer.byteLength === 0) {
    throw new Error('파일이 비어 있습니다.')
  }

  const separator = fileName.toLowerCase().endsWith('.tsv') ? '\t' : ','
  const reader = createRecordReader(decodeUtf8(buffer), separator)

  const header = reader.next()
  if (header === null || isBlankRow(header)) {
    throw new Error('파일이 비어 있거나 1행(헤더)이 비어 있습니다.')
  }

  const headers = header.map(cleanHeader)
  const seen = new Set()
  headers.forEach((name, index) => {
    if (name === '') {
      throw new Error(`1행(헤더): ${index + 1}번째 열의 이름이 비어 있습니다.`)
    }
    if (seen.has(name)) {
      throw new Error(`1행(헤더): '${name}' 컬럼 이름이 중복되었습니다.`)
    }
    seen.add(name)
  })

  let rowCount = 0
  const previewRows = []
  let line
  while ((line = reader.next()) !== null) {
    if (isBlankRow(line)) continue
    if (line.length !== headers.length) {
      throw new Error(
        `${reader.recordNumber()}행: 값이 ${line.length}개입니다. 헤더와 같은 ${headers.length}개여야 합니다.`,
      )
    }

    rowCount += 1
    if (previewRows.length < PREVIEW_ROW_LIMIT) {
      // 저장 시 백엔드가 앞뒤 공백을 지우므로 미리보기도 같게 보여준다.
      previewRows.push(line.map(javaTrim))
    }
  }

  if (rowCount === 0) {
    throw new Error('데이터 행이 없습니다. 헤더 아래에 한 행 이상 입력해 주세요.')
  }

  return { headers, rowCount, previewRows }
}
