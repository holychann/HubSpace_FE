// 헤더에 보일 닉네임. 새로고침해도 GET /user 를 다시 부르지 않도록 토큰과 같은 localStorage 에 둔다.
// 로그인·로그아웃 때 authStorage 가 비운다. 이메일 같은 다른 사용자 정보는 저장하지 않는다.
const NICKNAME_KEY = 'userNickname'

export const getCachedNickname = () => localStorage.getItem(NICKNAME_KEY)

// 빈 이름을 저장하면 다음 진입 때 캐시가 있는 것으로 보고 조회를 건너뛰므로 저장하지 않는다.
export const saveNickname = (nickname) => {
  if (!nickname) return
  localStorage.setItem(NICKNAME_KEY, nickname)
}

export const clearNicknameCache = () => {
  localStorage.removeItem(NICKNAME_KEY)
}
