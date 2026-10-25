import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getLocalPreviewPrivateGet, getLocalPreviewPublicGet } from './localPreview.js'

const searchUrl = (id, values) => `/v1/events/${id}/search?${new URLSearchParams(values)}`

test('샘플 파일과 폼의 공개 조회 화면에 검색 항목을 제공한다', async () => {
  for (const [id, eventType] of [['preview-file-002', 'FILE'], ['preview-form-001', 'FORM']]) {
    const { data } = await getLocalPreviewPublicGet(`/v1/events/${id}/summary`)
    assert.equal(data.eventType, eventType)
    assert.ok(data.eventTitle)
    assert.deepEqual(data.searchColumns, ['이름', '학번'])
  }
})

test('이름과 학번이 일치하면 파일 결과의 표시 항목을 돌려준다', async () => {
  const result = await getLocalPreviewPublicGet(searchUrl('preview-file-002', { 이름: '조성찬', 학번: '24' }))
  assert.equal(result.isSuccess, true)
  assert.deepEqual(result.data.answers, { 이름: '조성찬', 학번: '24', '합격 여부': '선발' })
})

test('폼의 샘플 정보로 신청 완료 결과를 볼 수 있다', async () => {
  const result = await getLocalPreviewPublicGet(searchUrl('preview-form-001', { 이름: '조성찬', 학번: '24' }))
  assert.equal(result.isSuccess, true)
  assert.equal(result.data.answers['신청 상태'], '신청 완료')
})

test('여러 검색 항목이 있는 파일은 모든 항목이 일치해야 한다', async () => {
  const values = { 이름: '조성찬', 연락처: '010-1234-5678', 소속: '컴퓨터정보공학부' }
  const found = await getLocalPreviewPublicGet(searchUrl('preview-file-004', values))
  assert.equal(found.isSuccess, true)
  const missing = await getLocalPreviewPublicGet(searchUrl('preview-file-004', { ...values, 소속: '' }))
  assert.equal(missing.isSuccess, false)
})

test('다른 값이나 누락한 항목은 결과 없음으로 처리한다', async () => {
  for (const values of [{ 이름: '다른 이름', 학번: '24' }, { 이름: '조성찬' }, { 이름: '조성찬', 학번: '024' }]) {
    const result = await getLocalPreviewPublicGet(searchUrl('preview-file-002', values))
    assert.equal(result.isSuccess, false)
    assert.equal(result.data, undefined)
  }
})

test('검색 값 앞뒤의 공백은 실제 조회처럼 제거한다', async () => {
  const result = await getLocalPreviewPublicGet(searchUrl('preview-file-002', { 이름: ' 조성찬 ', 학번: ' 24 ' }))
  assert.equal(result.isSuccess, true)
})

test('반환된 검색 항목과 결과를 바꿔도 다음 미리보기에 영향을 주지 않는다', async () => {
  const summary = await getLocalPreviewPublicGet('/v1/events/preview-file-002/summary')
  summary.data.searchColumns.push('추가 항목')
  assert.deepEqual((await getLocalPreviewPrivateGet('/v1/events/preview-file-002')).data.searchColumns, ['이름', '학번'])
  const url = searchUrl('preview-file-002', { 이름: '조성찬', 학번: '24' })
  const first = await getLocalPreviewPublicGet(url)
  first.data.answers.이름 = '변경'
  assert.equal((await getLocalPreviewPublicGet(url)).data.answers.이름, '조성찬')
})

test('없는 샘플이나 지원하지 않는 경로는 오류를 돌려준다', async () => {
  for (const url of ['/v1/events/preview-file-999/summary', '/v1/events/preview-file-002/delete']) {
    await assert.rejects(getLocalPreviewPublicGet(url), /로컬 미리보기 응답이 없는 요청/)
  }
})
