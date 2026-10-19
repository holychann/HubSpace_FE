// node --test 로 실행한다. 전송·시간·잠금·세션 저장소를 대역으로 바꿔 갱신 정책만 검사한다.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  AUTH_REQUEST_TIMEOUT_MS,
  AuthSessionChangedError,
  AuthUnauthorizedError,
  AuthUnavailableError,
  createAuthRefresher,
} from './authRefresh.js'
import { getTokenExpiresAt } from './authToken.js'

const NOW = 1_800_000_000_000
const MINUTE = 60 * 1000

let tokenSeq = 0
const makeToken = (expiresAt) => {
  tokenSeq += 1
  const payload = btoa(JSON.stringify({ exp: Math.floor(expiresAt / 1000), n: tokenSeq }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `header.${payload}.signature`
}

// 대기 중인 Promise 콜백이 모두 실행될 때까지 기다린다.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const createSession = (accessToken = null) => {
  const state = { accessToken, epoch: 'epoch-1', cleared: 0, started: 0 }
  return {
    state,
    getAccessToken: () => state.accessToken,
    getEpoch: () => state.epoch,
    saveAccessToken: (token) => {
      state.accessToken = token
    },
    startSession: (token) => {
      state.accessToken = token
      state.epoch = `epoch-${Math.random()}`
      state.started += 1
    },
    clear: () => {
      state.accessToken = null
      state.epoch = `epoch-${Math.random()}`
      state.cleared += 1
    },
  }
}

// responses: { status, accessToken } 이면 응답, 'network' 이면 reject, 함수면 호출 결과
const createTransport = (responses) => {
  const calls = []
  const respond = (options) => {
    calls.push(options)
    const next = responses.shift()
    if (next === undefined) throw new Error('예상하지 못한 요청')
    if (next === 'network') return Promise.reject(new Error('Network Error'))
    if (typeof next === 'function') return next()
    return Promise.resolve(next)
  }
  return { calls, refresh: respond, exchange: respond }
}

// navigator.locks 의 배타 잠금 대역. 같은 객체를 넘기면 여러 탭이 하나의 잠금을 공유한다.
const createLocks = () => {
  let tail = Promise.resolve()
  const names = []
  return {
    names,
    request: (name, options, task) => {
      names.push([name, options.mode])
      const run = tail.then(() => task())
      tail = run.catch(() => {})
      return run
    },
  }
}

const setup = ({ accessToken = null, responses = [], session = createSession(accessToken), locks = createLocks() } = {}) => {
  const transport = createTransport(responses)
  const sleeps = []
  const refresher = createAuthRefresher({
    session,
    transport,
    locks,
    sleep: (ms) => {
      sleeps.push(ms)
      return Promise.resolve()
    },
    now: () => NOW,
  })
  return { refresher, session, transport, sleeps, locks }
}

test('JWT exp 를 밀리초로 읽고, 읽지 못하면 0 이다', () => {
  assert.equal(getTokenExpiresAt(makeToken(NOW + MINUTE)), Math.floor((NOW + MINUTE) / 1000) * 1000)
  assert.equal(getTokenExpiresAt('broken'), 0)
  assert.equal(getTokenExpiresAt(null), 0)
})

test('만료된 access 토큰은 refresh 로 복구한다', async () => {
  const fresh = makeToken(NOW + 60 * MINUTE)
  const { refresher, session, transport, locks } = setup({
    accessToken: makeToken(NOW - MINUTE),
    responses: [{ status: 200, accessToken: fresh }],
  })

  assert.equal(await refresher.recover(), fresh)
  assert.equal(session.state.accessToken, fresh)
  assert.equal(transport.calls.length, 1)
  assert.equal(transport.calls[0].timeoutMs, AUTH_REQUEST_TIMEOUT_MS)
  assert.deepEqual(locks.names, [['hubspace-auth', 'exclusive']])
})

test('저장된 토큰 없이 refresh 쿠키만 있어도 복구한다', async () => {
  const fresh = makeToken(NOW + 60 * MINUTE)
  const { refresher, session } = setup({ responses: [{ status: 200, accessToken: fresh }] })

  assert.equal(await refresher.recover(), fresh)
  assert.equal(session.state.accessToken, fresh)
  assert.equal(session.state.cleared, 0)
})

test('아직 유효한 토큰이 있으면 진입 시 refresh 하지 않는다', async () => {
  const valid = makeToken(NOW + 30 * 1000)
  const { refresher, transport } = setup({ accessToken: valid })

  assert.equal(await refresher.recover(), valid)
  assert.equal(transport.calls.length, 0)
})

test('네트워크 오류·5xx 는 1초, 3초 뒤 재시도해 성공한다', async () => {
  const fresh = makeToken(NOW + 60 * MINUTE)
  const { refresher, session, transport, sleeps } = setup({
    accessToken: makeToken(NOW - MINUTE),
    responses: ['network', { status: 503 }, { status: 200, accessToken: fresh }],
  })

  assert.equal(await refresher.refresh(), fresh)
  assert.equal(transport.calls.length, 3)
  assert.deepEqual(sleeps, [1000, 3000])
  assert.equal(session.state.accessToken, fresh)
  assert.equal(refresher.getStatus(), 'idle')
})

test('3회 모두 실패하면 세션을 유지하고 복구 오류 상태가 된다', async () => {
  const expired = makeToken(NOW - MINUTE)
  const { refresher, session, transport, sleeps } = setup({
    accessToken: expired,
    responses: ['network', { status: 500 }, 'network'],
  })
  let notified = 0
  refresher.subscribe(() => {
    notified += 1
  })

  await assert.rejects(refresher.recover(), AuthUnavailableError)
  assert.equal(transport.calls.length, 3)
  assert.deepEqual(sleeps, [1000, 3000])
  assert.equal(session.state.accessToken, expired)
  assert.equal(session.state.cleared, 0)
  assert.equal(refresher.getStatus(), 'unavailable')
  assert.equal(notified, 1)
})

test('보호된 요청 직전 갱신이 일시 오류로 실패해도 아직 유효한 토큰은 계속 쓴다', async () => {
  const almostExpired = makeToken(NOW + 30 * 1000)
  const { refresher, session } = setup({
    accessToken: almostExpired,
    responses: ['network', 'network', 'network'],
  })

  assert.equal(await refresher.getUsableAccessToken(), almostExpired)
  assert.equal(session.state.accessToken, almostExpired)
  assert.equal(refresher.getStatus(), 'idle')
})

test('access 토큰까지 만료됐으면 보호된 요청을 보내지 않도록 실패한다', async () => {
  const { refresher } = setup({
    accessToken: makeToken(NOW - MINUTE),
    responses: ['network', 'network', 'network'],
  })

  await assert.rejects(refresher.getUsableAccessToken(), AuthUnavailableError)
  assert.equal(refresher.getStatus(), 'unavailable')
})

test('복구 오류 상태에서는 페이지 복귀·온라인 전환 때 다시 시도하고, 성공하면 상태를 되돌린다', async () => {
  const fresh = makeToken(NOW + 60 * MINUTE)
  const { refresher, transport } = setup({
    accessToken: makeToken(NOW - MINUTE),
    responses: ['network', 'network', 'network', { status: 200, accessToken: fresh }],
  })
  await assert.rejects(refresher.recover(), AuthUnavailableError)

  assert.equal(await refresher.resume(), fresh)
  assert.equal(transport.calls.length, 4)
  assert.equal(refresher.getStatus(), 'idle')

  // 정상 상태에서는 다시 요청하지 않는다.
  assert.equal(await refresher.resume(), fresh)
  assert.equal(transport.calls.length, 4)
})

test('복구 오류 상태에서 다른 탭이 저장한 유효한 토큰이 있으면 요청 없이 상태를 되돌린다', async () => {
  const session = createSession(makeToken(NOW - MINUTE))
  const { refresher, transport } = setup({ session, responses: ['network', 'network', 'network'] })
  await assert.rejects(refresher.recover(), AuthUnavailableError)
  let notified = 0
  refresher.subscribe(() => {
    notified += 1
  })

  const fromOtherTab = makeToken(NOW + 60 * MINUTE)
  session.saveAccessToken(fromOtherTab) // localStorage 는 탭끼리 공유된다

  assert.equal(await refresher.recover(), fromOtherTab)
  assert.equal(refresher.getStatus(), 'idle')
  assert.equal(notified, 1)
  assert.equal(transport.calls.length, 3)
})

test('refresh 가 401 이면 재시도 없이 세션을 지운다', async () => {
  const { refresher, session, transport, sleeps } = setup({
    accessToken: makeToken(NOW - MINUTE),
    responses: [{ status: 401 }],
  })

  await assert.rejects(refresher.recover(), AuthUnauthorizedError)
  assert.equal(transport.calls.length, 1)
  assert.deepEqual(sleeps, [])
  assert.equal(session.state.accessToken, null)
  assert.equal(session.state.cleared, 1)
  assert.equal(refresher.getStatus(), 'idle')
})

test('401 이외의 4xx 는 재시도하지 않지만 세션도 지우지 않는다', async () => {
  const { refresher, session, transport } = setup({
    accessToken: makeToken(NOW - MINUTE),
    responses: [{ status: 400 }],
  })

  await assert.rejects(refresher.recover(), AuthUnavailableError)
  assert.equal(transport.calls.length, 1)
  assert.equal(session.state.cleared, 0)
})

test('응답을 기다리는 동안 세션이 바뀌면 늦은 응답을 저장하지 않는다', async () => {
  const session = createSession(makeToken(NOW - MINUTE))
  const newSessionToken = makeToken(NOW + 60 * MINUTE)
  const { refresher } = setup({
    session,
    responses: [
      () => {
        // 응답 전에 다른 곳에서 새로 로그인했다.
        session.startSession(newSessionToken)
        return Promise.resolve({ status: 200, accessToken: makeToken(NOW + 60 * MINUTE) })
      },
    ],
  })

  await assert.rejects(refresher.refresh(), AuthSessionChangedError)
  assert.equal(session.state.accessToken, newSessionToken)
})

test('이전 세션에서 보낸 요청의 401 은 새 세션을 갱신하거나 지우지 않는다', async () => {
  const { refresher, session, transport } = setup({ accessToken: makeToken(NOW + 60 * MINUTE) })
  const oldRequest = { token: makeToken(NOW + 60 * MINUTE), epoch: 'epoch-old' }

  await assert.rejects(refresher.recoverFromUnauthorized(oldRequest), AuthSessionChangedError)
  assert.equal(transport.calls.length, 0)
  assert.equal(session.state.cleared, 0)
})

test('401 처리가 잠금을 기다리는 동안 다른 계정으로 로그인하면 새 세션의 토큰을 돌려주지 않는다', async () => {
  const session = createSession(makeToken(NOW + 60 * MINUTE))
  const locks = createLocks()
  const usedToken = session.state.accessToken
  const accountB = makeToken(NOW + 60 * MINUTE)
  let release
  // 다른 탭이 잠금을 잡고 있다.
  const otherTab = locks.request('hubspace-auth', { mode: 'exclusive' }, () => new Promise((resolve) => (release = resolve)))
  const { refresher, transport } = setup({ session, locks })

  const pending = refresher.recoverFromUnauthorized({ token: usedToken, epoch: 'epoch-1' })
  await flush()
  session.startSession(accountB) // 기다리는 동안 B 로 로그인
  release()
  await otherTab

  await assert.rejects(pending, AuthSessionChangedError)
  assert.equal(transport.calls.length, 0)
  assert.equal(session.state.accessToken, accountB)
})

test('세션이 바뀐 뒤의 갱신 요청은 이전 세션의 진행 중인 갱신에 합류하지 않는다', async () => {
  const session = createSession(makeToken(NOW - MINUTE))
  const accountB = makeToken(NOW - MINUTE)
  const renewedB = makeToken(NOW + 60 * MINUTE)
  let releaseA
  const { refresher, transport } = setup({
    session,
    responses: [
      () => new Promise((resolve) => (releaseA = () => resolve({ status: 200, accessToken: makeToken(NOW + 60 * MINUTE) }))),
      { status: 200, accessToken: renewedB },
    ],
  })

  const forA = refresher.refresh()
  await flush()
  session.startSession(accountB)
  const forB = refresher.recoverFromUnauthorized({ token: accountB, epoch: session.getEpoch() })
  releaseA()

  await assert.rejects(forA, AuthSessionChangedError)
  assert.equal(await forB, renewedB)
  assert.equal(transport.calls.length, 2)
  assert.equal(session.state.accessToken, renewedB)
})

test('진입 복구가 잠금을 기다리는 동안 다른 탭에서 로그인하면 그 세션을 쓴다', async () => {
  const session = createSession(null)
  const locks = createLocks()
  const loggedIn = makeToken(NOW + 60 * MINUTE)
  let release
  const otherTab = locks.request('hubspace-auth', { mode: 'exclusive' }, () => new Promise((resolve) => (release = resolve)))
  const { refresher, transport } = setup({ session, locks })

  const pending = refresher.recover()
  await flush()
  session.startSession(loggedIn)
  release()
  await otherTab

  assert.equal(await pending, loggedIn)
  assert.equal(transport.calls.length, 0)
})

test('보호된 요청의 401 은 이미 다른 요청이 갱신한 토큰을 재사용한다', async () => {
  const usedToken = makeToken(NOW + 60 * MINUTE)
  const renewed = makeToken(NOW + 60 * MINUTE)
  const { refresher, transport } = setup({ accessToken: renewed })

  assert.equal(await refresher.recoverFromUnauthorized({ token: usedToken, epoch: 'epoch-1' }), renewed)
  assert.equal(transport.calls.length, 0)
})

test('보호된 요청의 401 은 저장된 토큰이 그 요청의 토큰이면 만료 전이라도 갱신한다', async () => {
  const usedToken = makeToken(NOW + 60 * MINUTE)
  const renewed = makeToken(NOW + 60 * MINUTE)
  const { refresher, transport } = setup({
    accessToken: usedToken,
    responses: [{ status: 200, accessToken: renewed }],
  })

  assert.equal(await refresher.recoverFromUnauthorized({ token: usedToken, epoch: 'epoch-1' }), renewed)
  assert.equal(transport.calls.length, 1)
})

test('탭 안의 동시 갱신 요청은 하나의 refresh 를 공유한다', async () => {
  const fresh = makeToken(NOW + 60 * MINUTE)
  let release
  const { refresher, transport } = setup({
    accessToken: makeToken(NOW - MINUTE),
    responses: [() => new Promise((resolve) => (release = () => resolve({ status: 200, accessToken: fresh })))],
  })

  const results = Promise.all([refresher.recover(), refresher.getUsableAccessToken(), refresher.refresh()])
  await flush()
  release()

  assert.deepEqual(await results, [fresh, fresh, fresh])
  assert.equal(transport.calls.length, 1)
})

test('잠금을 기다리는 동안 다른 탭이 갱신했으면 그 토큰을 재사용한다', async () => {
  const session = createSession(makeToken(NOW - MINUTE)) // 두 탭이 같은 localStorage 를 본다
  const locks = createLocks()
  const fresh = makeToken(NOW + 60 * MINUTE)
  let release
  const tabA = setup({
    session,
    locks,
    responses: [() => new Promise((resolve) => (release = () => resolve({ status: 200, accessToken: fresh })))],
  })
  const tabB = setup({ session, locks })

  const a = tabA.refresher.refresh()
  const b = tabB.refresher.refresh()
  await flush()
  release()

  assert.equal(await a, fresh)
  assert.equal(await b, fresh)
  assert.equal(tabA.transport.calls.length, 1)
  assert.equal(tabB.transport.calls.length, 0)
})

test('exchange 는 같은 잠금 안에서 새 세션을 시작하고 재시도하지 않는다', async () => {
  const token = makeToken(NOW + 60 * MINUTE)
  const ok = setup({ responses: [{ status: 200, accessToken: token }] })

  assert.equal(await ok.refresher.exchange(), token)
  assert.equal(ok.session.state.started, 1)
  assert.deepEqual(ok.locks.names, [['hubspace-auth', 'exclusive']])

  const failed = setup({ responses: ['network'] })
  await assert.rejects(failed.refresher.exchange(), AuthUnavailableError)
  assert.equal(failed.transport.calls.length, 1)
})

test('Web Locks 를 지원하지 않으면 잠금 없이 실행한다', async () => {
  const fresh = makeToken(NOW + 60 * MINUTE)
  const { refresher } = setup({ locks: undefined, responses: [{ status: 200, accessToken: fresh }] })

  assert.equal(await refresher.recover(), fresh)
})
