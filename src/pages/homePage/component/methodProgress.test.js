// node --test 로 실행한다.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getStepProgress, getStepWeights } from './methodProgress.js'

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

test('단계 막대의 비율은 단계마다 차지하는 프레임 수다', () => {
  assert.deepEqual(getStepWeights(BOUNDARIES, LAST_FRAME), [200, 290, 289])
  assert.deepEqual(getStepWeights([240, 330], 479), [240, 90, 149])
})

test('막대 폭을 프레임 수에 비례하게 나누면 단계마다 같은 속도로 찬다', () => {
  const boundaries = [240, 330]
  const weights = getStepWeights(boundaries, 479)
  // 한 프레임 동안 늘어나는 길이(막대 폭 × 늘어난 비율)가 모든 단계에서 같아야 한다.
  const speeds = [100, 300, 400].map((frame) => {
    const before = getStepProgress(frame, boundaries, 479)
    const after = getStepProgress(frame + 1, boundaries, 479)
    return weights.reduce((sum, weight, index) => sum + weight * (after.fills[index] - before.fills[index]), 0)
  })
  speeds.forEach((speed) => assert.ok(Math.abs(speed - 1) < 1e-9))
})
