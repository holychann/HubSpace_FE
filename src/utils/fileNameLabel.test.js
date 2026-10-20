// node --test 로 실행한다.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toFileNameLabel } from './fileNameLabel.js'

test('한글·공백·괄호가 들어간 파일명을 그대로 돌려준다', () => {
  assert.equal(toFileNameLabel('2026 1학기 명단 (최종).csv'), '2026 1학기 명단 (최종).csv')
})

test('null·누락·빈 값·공백만 있는 값은 null 이다', () => {
  assert.equal(toFileNameLabel(null), null)
  assert.equal(toFileNameLabel(undefined), null)
  assert.equal(toFileNameLabel(''), null)
  assert.equal(toFileNameLabel('   '), null)
})
