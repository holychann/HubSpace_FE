// FILE 이벤트에 현재 적용된 명단의 원본 파일명 표시. 파일명을 저장하기 전에 만든 이벤트는 서버가 null 을 준다.
export const UNKNOWN_FILE_NAME = '파일명 정보 없음'

// 표시할 파일명. null·누락·빈 값이면 null 을 돌려주고, 화면은 UNKNOWN_FILE_NAME 을 보여준다.
export const toFileNameLabel = (fileName) => {
  if (typeof fileName !== 'string') return null
  const trimmed = fileName.trim()
  return trimmed === '' ? null : trimmed
}
