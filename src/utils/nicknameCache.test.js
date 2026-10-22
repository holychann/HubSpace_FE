// node --test 로 실행한다. 브라우저 localStorage 대신 Map 으로 흉내 낸다.
import { beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { clearNicknameCache, getCachedNickname, saveNickname } from './nicknameCache.js'

beforeEach(() => {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  }
})

test('저장한 닉네임을 다시 읽는다', () => {
  saveNickname('허브')
  assert.equal(getCachedNickname(), '허브')
})

test('저장한 적 없으면 null 이라 조회가 필요하다고 본다', () => {
  assert.equal(getCachedNickname(), null)
})

test('빈 이름은 저장하지 않아 다음 진입 때 다시 조회한다', () => {
  saveNickname('')
  saveNickname(null)
  assert.equal(getCachedNickname(), null)
})

test('비우면 다음 진입 때 다시 조회한다', () => {
  saveNickname('허브')
  clearNicknameCache()
  assert.equal(getCachedNickname(), null)
})
