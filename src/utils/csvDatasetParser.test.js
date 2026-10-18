// node --test 로 실행한다. 오류 문구는 백엔드 FileDatasetParser 와 같아야 한다.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseCsvDataset } from './csvDatasetParser.js'
import { keepAvailableColumns } from './csvColumnSelection.js'

const encode = (text) => new TextEncoder().encode(text)
const parse = (text, fileName = 'list.csv') => parseCsvDataset(encode(text), fileName)
const rejects = (text, message, fileName) =>
  assert.throws(() => parse(text, fileName), { message })

test('CSV 헤더, 행 수, 상위 5행을 읽는다', () => {
  const rows = Array.from({ length: 7 }, (_, i) => `이름${i},${i}`).join('\n')
  const result = parse(`이름,번호\n${rows}\n`)

  assert.deepEqual(result.headers, ['이름', '번호'])
  assert.equal(result.rowCount, 7)
  assert.equal(result.previewRows.length, 5)
  assert.deepEqual(result.previewRows[0], ['이름0', '0'])
})

test('확장자가 .tsv 이면 탭으로 구분한다 (대소문자 무시)', () => {
  const result = parse('이름\t메모\n홍길동\t가,나\n', 'LIST.TSV')

  assert.deepEqual(result.headers, ['이름', '메모'])
  assert.deepEqual(result.previewRows[0], ['홍길동', '가,나'])
})

test('앞자리 0 을 숫자로 바꾸지 않는다', () => {
  const result = parse('학번,이름\n00123,홍길동\n')

  assert.deepEqual(result.previewRows[0], ['00123', '홍길동'])
})

test('따옴표 안의 구분자, 줄바꿈, "" 를 값으로 읽는다', () => {
  const result = parse('이름,메모\r\n"홍,길동","첫 줄\r\n둘째 줄 ""인용"""\r\n')

  assert.equal(result.rowCount, 1)
  assert.deepEqual(result.previewRows[0], ['홍,길동', '첫 줄\n둘째 줄 "인용"'])
})

test('BOM 을 헤더에서 지운다', () => {
  const result = parse('\uFEFF"이름",번호\n홍길동,1\n')

  assert.deepEqual(result.headers, ['이름', '번호'])
})

test('헤더와 셀의 앞뒤 공백은 지우되 전각 공백은 남긴다 (Java trim 과 같음)', () => {
  const result = parse(' 이름 ,번호\u3000\n  홍길동 ,1\n')

  assert.deepEqual(result.headers, ['이름', '번호\u3000'])
  assert.deepEqual(result.previewRows[0], ['홍길동', '1'])
})

test('빈 행은 건너뛰고 컬럼 수도 검사하지 않는다', () => {
  const result = parse('이름,번호\n\n , \n홍길동,1\n,\n')

  assert.equal(result.rowCount, 1)
})

test('줄바꿈 없는 공백(U+00A0)만 있는 행은 빈 행이 아니다 (Java isBlank 와 같음)', () => {
  rejects('이름,번호\n\u00A0\n홍길동,1\n', '2행: 값이 1개입니다. 헤더와 같은 2개여야 합니다.')
})

test('행 번호는 여러 줄 값이 있어도 레코드 단위로 센다', () => {
  rejects('이름,메모\n홍길동,"두\n줄"\n김철수\n', '3행: 값이 1개입니다. 헤더와 같은 2개여야 합니다.')
})

test('컬럼 수가 헤더와 다르면 거부한다', () => {
  rejects('이름,번호\n홍길동,1,추가\n', '2행: 값이 3개입니다. 헤더와 같은 2개여야 합니다.')
})

test('값 중간의 따옴표를 거부한다', () => {
  rejects(
    '이름,번호\nAl"ice",1\n',
    '2행: CSV 형식이 올바르지 않습니다. 값 중간에 따옴표(")가 있습니다. 값 전체를 따옴표로 감싸고 안의 따옴표는 "" 로 적어 주세요.',
  )
})

test('닫는 따옴표 뒤의 문자를 거부한다', () => {
  rejects(
    '이름,번호\n"홍길동"x,1\n',
    '2행: CSV 형식이 올바르지 않습니다. 닫는 따옴표 뒤에 다른 문자가 있습니다. 값 안의 따옴표는 "" 로 적어 주세요.',
  )
})

test('닫히지 않은 따옴표를 거부한다', () => {
  rejects(
    '이름,번호\n"홍길동,1\n',
    '2행: CSV 형식이 올바르지 않습니다. 따옴표(")로 시작한 값이 닫히지 않았습니다.',
  )
})

test('UTF-8 이 아닌 파일을 거부한다', () => {
  // EUC-KR 로 인코딩한 "이름" (C0 CC B8 A7)
  const eucKr = new Uint8Array([0xc0, 0xcc, 0xb8, 0xa7, 0x0a, 0x31, 0x0a])

  assert.throws(() => parseCsvDataset(eucKr, 'list.csv'), {
    message: 'UTF-8 로 저장된 파일만 올릴 수 있습니다. 파일을 UTF-8 CSV 로 다시 저장해 주세요.',
  })
})

test('빈 파일, 빈 헤더, 데이터 없는 파일을 거부한다', () => {
  rejects('', '파일이 비어 있습니다.')
  rejects('\n', '파일이 비어 있거나 1행(헤더)이 비어 있습니다.')
  rejects(' , \n홍길동,1\n', '파일이 비어 있거나 1행(헤더)이 비어 있습니다.')
  rejects('이름,번호\n\n', '데이터 행이 없습니다. 헤더 아래에 한 행 이상 입력해 주세요.')
})

test('헤더 이름이 비었거나 중복되면 거부한다', () => {
  rejects('이름,,번호\n1,2,3\n', '1행(헤더): 2번째 열의 이름이 비어 있습니다.')
  rejects('이름, 이름\n1,2\n', "1행(헤더): '이름' 컬럼 이름이 중복되었습니다.")
})

test('새 헤더에 있는 컬럼만 순서대로 남기고 사라진 컬럼은 뺀다', () => {
  const result = keepAvailableColumns(
    { searchColumns: ['이름', '학번', '전화번호'], displayColumns: ['합격 여부', '메모'] },
    ['메모', '전화번호', '이름', '합격 여부'],
  )

  assert.deepEqual(result, {
    searchColumns: ['이름', '전화번호'],
    displayColumns: ['합격 여부', '메모'],
  })
})

test('표시 컬럼은 검색 컬럼과 겹치지 않게 뺀다', () => {
  const result = keepAvailableColumns(
    { searchColumns: ['이름', '학번'], displayColumns: ['학번', '합격 여부'] },
    ['이름', '학번', '합격 여부'],
  )

  assert.deepEqual(result.displayColumns, ['합격 여부'])
})
