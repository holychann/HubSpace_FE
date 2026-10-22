// node --test 로 실행한다.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getStepProgress } from './methodProgress.js'

const BOUNDARIES = [200, 490]
const LAST_FRAME = 779

test('첫 프레임에서는 모든 막대가 비어 있고 첫 단계다', () => {
  assert.deepEqual(getStepProgress(0, BOUNDARIES, LAST_FRAME), { fills: [0, 0, 0], current: 0 })
})

test('단계 안에서는 지난 단계만큼 차고, 지금 단계는 지난 비율만큼 찬다', () => {
  assert.deepEqual(getStepProgress(100, BOUNDARIES, LAST_FRAME), { fills: [0.5, 0, 0], current: 0 })
  assert.deepEqual(getStepProgress(345, BOUNDARIES, LAST_FRAME), { fills: [1, 0.5, 0], current: 1 })
})

test('경계 프레임에서는 다음 단계로 넘어간다', () => {
  assert.deepEqual(getStepProgress(200, BOUNDARIES, LAST_FRAME), { fills: [1, 0, 0], current: 1 })
})

test('마지막 프레임과 그 뒤에서는 모두 차고 마지막 단계에 머문다', () => {
  assert.deepEqual(getStepProgress(LAST_FRAME, BOUNDARIES, LAST_FRAME), { fills: [1, 1, 1], current: 2 })
  assert.deepEqual(getStepProgress(LAST_FRAME + 0.6, BOUNDARIES, LAST_FRAME), { fills: [1, 1, 1], current: 2 })
})
